import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// eBay Browse API — Buy/Browse v1
// Docs: https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/search
// Sandbox: api.sandbox.ebay.com | Production: api.ebay.com
const IS_SANDBOX = Deno.env.get('EBAY_SANDBOX') === 'true';
const EBAY_BASE = IS_SANDBOX ? 'https://api.sandbox.ebay.com' : 'https://api.ebay.com';
const EBAY_API_URL = `${EBAY_BASE}/buy/browse/v1/item_summary/search`;

// Cache TTL: 24h (in seconds)
const CACHE_TTL_HOURS = 24;

interface EbaySearchResult {
  itemSummaries?: Array<{
    price?: { value: string; currency: string };
    condition?: string;
    title: string;
  }>;
  total?: number;
}

async function getEbayToken(clientId: string, clientSecret: string): Promise<string> {
  const credentials = btoa(`${clientId}:${clientSecret}`);
  const tokenUrl = `${EBAY_BASE}/identity/v1/oauth2/token`;
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
  });
  if (!res.ok) throw new Error(`eBay auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

async function searchEbaySoldPrices(
  token: string,
  query: string,
  conditionGrade: string
): Promise<number | null> {
  // Map condition grades to eBay condition IDs
  // C10=Mint, C9=Near Mint, C8=Very Fine, C7=Fine, C6=Very Good, etc.
  const conditionMap: Record<string, string> = {
    'C10': '1000', // New
    'C9':  '3000', // Used - Like New
    'C8':  '3000', // Used - Like New
    'C7':  '4000', // Used - Very Good
    'C6':  '5000', // Used - Good
    'C5':  '6000', // Used - Acceptable
  };

  const ebayCondition = conditionMap[conditionGrade] ?? '3000';
  const searchQuery = `${query} GI Joe action figure`;

  const params = new URLSearchParams({
    q: searchQuery,
    filter: `conditionIds:{${ebayCondition}},buyingOptions:{FIXED_PRICE}`,
    sort: 'price',
    limit: '10',
  });

  const res = await fetch(`${EBAY_API_URL}?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    console.error(`eBay search failed: ${res.status}`, await res.text());
    return null;
  }

  const data: EbaySearchResult = await res.json();
  const items = data.itemSummaries ?? [];

  if (items.length === 0) return null;

  // Median price from results
  const prices = items
    .map(i => parseFloat(i.price?.value ?? '0'))
    .filter(p => p > 0)
    .sort((a, b) => a - b);

  if (prices.length === 0) return null;

  const mid = Math.floor(prices.length / 2);
  const medianUSD = prices.length % 2 !== 0
    ? prices[mid]
    : (prices[mid - 1] + prices[mid]) / 2;

  // Convert USD → BRL (approximate — update rate periodically)
  // TODO: integrate an exchange rate API for accurate conversion
  const USD_TO_BRL = 5.0;
  return Math.round(medianUSD * USD_TO_BRL);
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ebayClientId = Deno.env.get('EBAY_CLIENT_ID');
    const ebayClientSecret = Deno.env.get('EBAY_CLIENT_SECRET');

    if (!ebayClientId || !ebayClientSecret) {
      return new Response(
        JSON.stringify({ error: 'eBay credentials not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request: { catalog_item_id, condition_grade } or batch { items: [...] }
    const body = await req.json().catch(() => ({}));
    const items: Array<{ catalog_item_id: string; condition_grade: string; name: string }> =
      body.items ?? (body.catalog_item_id
        ? [{ catalog_item_id: body.catalog_item_id, condition_grade: body.condition_grade ?? 'C8', name: body.name ?? '' }]
        : []);

    if (items.length === 0) {
      // Auto mode: fetch all catalog items that need price refresh
      const cutoff = new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();
      const { data: staleItems } = await supabase
        .from('catalog_items')
        .select('id, name')
        .limit(50); // Process max 50 per invocation

      if (!staleItems || staleItems.length === 0) {
        return new Response(
          JSON.stringify({ updated: 0, message: 'No items to update' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check which ones have stale/missing prices
      const { data: recentPrices } = await supabase
        .from('market_prices')
        .select('catalog_item_id, fetched_at')
        .gte('fetched_at', cutoff);

      const recentIds = new Set((recentPrices ?? []).map((p: any) => p.catalog_item_id));

      for (const item of staleItems) {
        if (recentIds.has(item.id)) continue; // Still fresh
        items.push({ catalog_item_id: item.id, condition_grade: 'C8', name: item.name });
      }
    }

    if (items.length === 0) {
      return new Response(
        JSON.stringify({ updated: 0, message: 'All prices are fresh' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get eBay token once for all requests
    const token = await getEbayToken(ebayClientId, ebayClientSecret);

    const results = [];
    const conditions = ['C10', 'C9', 'C8', 'C7', 'C6', 'C5'];

    for (const item of items.slice(0, 20)) { // Max 20 per call to stay within rate limits
      for (const condition of conditions) {
        const priceBRL = await searchEbaySoldPrices(token, item.name, condition);
        if (priceBRL === null) continue;

        // Delete stale entry then insert fresh (no unique constraint needed)
        await supabase
          .from('market_prices')
          .delete()
          .eq('catalog_item_id', item.catalog_item_id)
          .eq('condition_grade', condition)
          .eq('source', 'ebay');

        const { error } = await supabase
          .from('market_prices')
          .insert({
            catalog_item_id: item.catalog_item_id,
            condition_grade: condition,
            price_brl: priceBRL,
            source: 'ebay',
            fetched_at: new Date().toISOString(),
            valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          });

        if (error) {
          console.error(`Failed to upsert price for ${item.name} ${condition}:`, error);
        } else {
          results.push({ name: item.name, condition, price_brl: priceBRL });
        }
      }
    }

    return new Response(
      JSON.stringify({ updated: results.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('ebay-prices function error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
