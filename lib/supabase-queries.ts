import { supabase } from './supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CatalogItem {
  id: string;
  display_name: string;
  year: number;
  product_line_id?: number;
  rarity_level?: number;
  image_url?: string;
  description?: string;
  version?: number;
  deleted_at?: string | null;
}

export interface CollectionItem {
  id: string;
  user_id: string;
  catalog_item_id: string;
  condition_grade?: string;
  completeness_status?: 'complete' | 'incomplete' | 'stripped' | null;
  price_paid?: number;
  acquired_at?: string;
  notes?: string;
  version?: number;
  deleted_at?: string | null;
  // joined
  catalog_item?: CatalogItem;
  market_value?: number;
  primary_photo_url?: string;
}

export interface MarketPrice {
  id: string;
  catalog_item_id: string;
  price_brl: number;
  price_usd?: number;
  source: string;
  condition_grade?: string;
  fetched_at: string;
}

export interface ItemPhoto {
  id: string;
  catalog_item_id?: number;
  user_collection_item_id?: number;
  storage_path: string;
  bucket_name: string;
  is_primary: boolean;
  photo_type: string;
}

export interface UserProfile {
  id: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan: 'free' | 'pro' | 'lifetime';
  status: 'active' | 'expired' | 'cancelled';
  ends_at?: string;
}

export interface PatrimonioSnapshot {
  id: string;
  user_id: string;
  total_value_brl: number;
  item_count: number;
  snapshot_date: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  read: boolean;
  type: string;
  created_at: string;
}

export interface MarketplaceListing {
  id: string;
  seller_id: string;
  catalog_item_id: string;
  price: number;
  condition?: string;
  description?: string;
  status: string;
}

// ─── Catálogo ─────────────────────────────────────────────────────────────────

export async function getCatalogItems(filters?: {
  search?: string;
  franchise?: string;
  year?: number;
  page?: number;
  pageSize?: number;
}) {
  const page = filters?.page ?? 0;
  const pageSize = filters?.pageSize ?? 20;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('catalog_items')
    .select(`
      id, display_name, year, product_line_id, rarity_level, image_url, description,
      market_prices ( price_brl, condition_grade, source, fetched_at )
    `)
    .range(from, to)
    .order('display_name');

  if (filters?.search) {
    query = query.ilike('display_name', `%${filters.search}%`);
  }
  if (filters?.year) {
    query = query.eq('year', filters.year);
  }
  if (filters?.franchise) {
    query = query.eq('product_line_id', filters.franchise);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Flatten market price (pega o mais recente para cada item)
  return (data ?? []).map((item: any) => {
    const prices: MarketPrice[] = item.market_prices ?? [];
    const latest = prices.sort((a, b) =>
      new Date(b.fetched_at).getTime() - new Date(a.fetched_at).getTime()
    )[0];
    return {
      ...item,
      market_value_brl: latest?.price_brl ?? 0,
      market_prices: undefined,
    };
  });
}

export async function getCatalogItemById(id: string) {
  const { data, error } = await supabase
    .from('catalog_items')
    .select(`
      *,
      market_prices ( price_brl, price_usd, source, condition_grade, fetched_at ),
      item_photos ( storage_path, bucket_name, is_primary, photo_type ),
      item_variants ( id, variant_name, variant_type, notes )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// ─── Coleção do usuário ───────────────────────────────────────────────────────

export async function getCollectionItems(userId: string): Promise<CollectionItem[]> {
  // user_collection_items does not have user_id directly — it links through user_collections
  const { data, error } = await supabase
    .from('user_collection_items')
    .select(`
      id, catalog_item_id, condition_grade, completeness_status, price_paid, acquisition_date, private_notes, photo_url, deleted_at,
      user_collection:user_collections ( user_id ),
      catalog_item:catalog_items (
        id, display_name, year, product_line_id, rarity_level, image_url,
        market_prices ( price_brl, source, fetched_at )
      ),
      item_photos ( storage_path, bucket_name, is_primary, photo_type )
    `)
    .eq('user_collection.user_id', userId)
    .is('deleted_at', null)
    .order('acquisition_date', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => {
    const prices: MarketPrice[] = row.catalog_item?.market_prices ?? [];
    const latest = prices.sort((a, b) =>
      new Date(b.fetched_at).getTime() - new Date(a.fetched_at).getTime()
    )[0];
    // item_photos join — prefer that; fallback to inline photo_url or catalog image
    const primaryPhoto = (row.item_photos ?? []).find((p: ItemPhoto) => p.is_primary);
    const primaryPhotoUrl = primaryPhoto
      ? getPublicPhotoUrl(primaryPhoto.storage_path, (primaryPhoto.bucket_name as 'item-photos' | 'catalog-photos') ?? 'item-photos')
      : (row.photo_url ?? null);
    return {
      ...row,
      user_id: row.user_collection?.user_id ?? userId,
      market_value: latest?.price_brl ?? 0,
      primary_photo_url: primaryPhotoUrl ?? row.catalog_item?.image_url ?? null,
    };
  });
}

export async function getOrCreateUserCollection(userId: string): Promise<number> {
  // Get or create the default user_collection for this user
  let { data, error } = await supabase
    .from('user_collections')
    .select('id')
    .eq('user_id', userId)
    .order('created_at')
    .limit(1)
    .single();

  if (error && error.code === 'PGRST116') {
    // Not found — create default collection
    const { data: created, error: createError } = await supabase
      .from('user_collections')
      .insert({ user_id: userId, name: 'Minha Coleção' })
      .select('id')
      .single();
    if (createError) throw createError;
    return created.id;
  }
  if (error) throw error;
  return data!.id;
}

export async function addToCollection(
  userId: string,
  catalogItemId: string,
  condition: string = 'C8',
  pricePaid?: number
) {
  const collectionId = await getOrCreateUserCollection(userId);
  const { data, error } = await supabase
    .from('user_collection_items')
    .insert({
      user_collection_id: collectionId,
      catalog_item_id: catalogItemId,
      condition_grade: condition,
      price_paid: pricePaid ?? null,
      acquisition_date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCollectionItem(
  id: string,
  updates: Partial<Pick<CollectionItem, 'condition_grade' | 'price_paid' | 'notes'>>
) {
  // Map 'notes' to 'private_notes' (schema column name)
  const { notes, ...rest } = updates as any;
  const payload: any = { ...rest };
  if (notes !== undefined) payload.private_notes = notes;

  const { data, error } = await supabase
    .from('user_collection_items')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeFromCollection(id: string) {
  const { error } = await supabase
    .from('user_collection_items')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

// ─── Patrimônio ───────────────────────────────────────────────────────────────

export async function getPatrimonioSnapshot(userId: string): Promise<PatrimonioSnapshot | null> {
  const { data, error } = await supabase
    .from('patrimonio_snapshots')
    .select('*')
    .eq('user_id', userId)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data ?? null;
}

export async function savePatrimonioSnapshot(userId: string) {
  // Chama a função SQL do M8 para calcular e salvar snapshot
  const { data, error } = await supabase.rpc('save_patrimonio_snapshot', { p_user_id: userId });
  if (error) throw error;
  return data;
}

export async function getTopValorizadas(userId: string, limit = 5) {
  // Pega os itens da coleção do usuário com maior valorização (market vs paid)
  const items = await getCollectionItems(userId);
  return items
    .filter(item => item.price_paid && item.price_paid > 0 && item.market_value && item.market_value > 0)
    .map(item => ({
      ...item,
      appreciation_pct: Math.round(((item.market_value! - item.price_paid!) / item.price_paid!) * 100),
      appreciation_brl: item.market_value! - item.price_paid!,
    }))
    .sort((a, b) => b.appreciation_pct - a.appreciation_pct)
    .slice(0, limit);
}

export async function calcPatrimonioLive(userId: string) {
  const items = await getCollectionItems(userId);
  const totalPaid = items.reduce((acc, i) => acc + (i.price_paid ?? 0), 0);
  const totalMarket = items.reduce((acc, i) => acc + (i.market_value ?? 0), 0);
  return { totalPaid, totalMarket, itemCount: items.length };
}

// ─── Fotos ────────────────────────────────────────────────────────────────────

export async function getItemPhotos(itemId: string, type: 'catalog' | 'user' = 'catalog') {
  const col = type === 'catalog' ? 'catalog_item_id' : 'user_collection_item_id';
  const { data, error } = await supabase
    .from('item_photos')
    .select('*')
    .eq(col, itemId)
    .eq('photo_type', type)
    .order('is_primary', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export function getPublicPhotoUrl(path: string, bucket: 'item-photos' | 'catalog-photos') {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ─── Notificações ─────────────────────────────────────────────────────────────

export async function getUnreadNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('read', false)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data ?? [];
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);

  if (error) throw error;
}

// ─── Perfil e assinatura ──────────────────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data ?? null;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data ?? null;
}

// ─── Marketplace ──────────────────────────────────────────────────────────────

export async function getMarketplaceListings(filters?: {
  catalogItemId?: string;
  condition?: string;
  status?: string;
}) {
  let query = supabase
    .from('marketplace_listings')
    .select(`
      *,
      catalog_item:catalog_items ( display_name, year, image_url )
    `)
    .eq('status', filters?.status ?? 'active')
    .order('created_at', { ascending: false });

  if (filters?.catalogItemId) {
    query = query.eq('catalog_item_id', filters.catalogItemId);
  }
  if (filters?.condition) {
    query = query.eq('condition', filters.condition);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createListing(listing: Omit<MarketplaceListing, 'id'>) {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .insert(listing)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Price Alerts ─────────────────────────────────────────────────────────────

export async function createPriceAlert(
  userId: string,
  catalogItemId: string,
  targetPrice: number
) {
  const { data, error } = await supabase
    .from('price_alerts')
    .insert({ user_id: userId, catalog_item_id: catalogItemId, target_price: targetPrice })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserPriceAlerts(userId: string) {
  const { data, error } = await supabase
    .from('price_alerts')
    .select(`*, catalog_item:catalog_items ( display_name, year )`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function trackEvent(userId: string, eventName: string, properties?: Record<string, any>) {
  // Fire-and-forget — não bloquear UI
  supabase
    .from('analytics_events')
    .insert({ user_id: userId, event_name: eventName, properties: properties ?? {} })
    .then(() => {});
}

// ─── Sync ─────────────────────────────────────────────────────────────────────

export async function getLastSyncCheckpoint(userId: string, deviceId: string) {
  const { data, error } = await supabase
    .from('sync_checkpoints')
    .select('*')
    .eq('user_id', userId)
    .eq('device_id', deviceId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data ?? null;
}

export async function updateSyncCheckpoint(
  userId: string,
  deviceId: string,
  lastSyncAt: string
) {
  const { error } = await supabase
    .from('sync_checkpoints')
    .upsert({ user_id: userId, device_id: deviceId, last_sync_at: lastSyncAt });

  if (error) throw error;
}
// schema alignment fixes: franchise_id, photo_url, user_collection_items 1774784088
