// eBay Sold Listings API — via Supabase Edge Function (cache diário)
// Nunca expor API key no bundle do app
export async function getMarketValue(figureName: string): Promise<number | null> {
  // TODO: chamar Supabase edge function que consulta eBay e retorna cache
  // const res = await fetch(`https://xxx.supabase.co/functions/v1/ebay-price?q=${figureName}`);
  // const data = await res.json();
  // return data.avgSoldPriceBRL;
  return null;
}
