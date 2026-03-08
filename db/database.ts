import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES, SEED_DATA } from './schema';
import seedData from './seed/gijoe-arah.json';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('filecard.db');
  await initDatabase(db);
  return db;
}

async function initDatabase(database: SQLite.SQLiteDatabase) {
  await database.execAsync(CREATE_TABLES);
  await database.execAsync(SEED_DATA);
  await seedCatalogItems(database);
}

async function seedCatalogItems(database: SQLite.SQLiteDatabase) {
  const existing = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM catalog_items'
  );
  if (existing && existing.count > 0) return;

  for (const item of seedData) {
    await database.runAsync(
      `INSERT OR IGNORE INTO catalog_items
        (id, product_line_id, release_id, canonical_name, display_name, slug, year, era, description, rarity_level, complexity_score, market_value_brl, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [item.id, item.product_line_id, item.release_id, item.canonical_name,
       item.display_name, item.slug, item.year, item.era, item.description,
       item.rarity_level, item.complexity_score, item.market_value_brl, item.image_url ?? null]
    );

    for (const acc of item.accessories || []) {
      await database.runAsync(
        `INSERT OR IGNORE INTO accessories (catalog_item_id, name, accessory_type, required_for_complete)
         VALUES (?, ?, ?, ?)`,
        [item.id, acc.name, acc.accessory_type, acc.required_for_complete ? 1 : 0]
      );
    }

    for (const v of item.variants || []) {
      await database.runAsync(
        `INSERT OR IGNORE INTO item_variants (catalog_item_id, variant_name, variant_type, distinguishing_features)
         VALUES (?, ?, ?, ?)`,
        [item.id, v.variant_name, v.variant_type, v.distinguishing_features]
      );
    }
  }
}

export async function getCatalogItems(query?: string) {
  const database = await getDatabase();
  if (query) {
    return database.getAllAsync<any>(
      `SELECT ci.*, pl.name as line_name
       FROM catalog_items ci
       JOIN product_lines pl ON ci.product_line_id = pl.id
       WHERE ci.display_name LIKE ? OR ci.canonical_name LIKE ?
       ORDER BY ci.display_name`,
      [`%${query}%`, `%${query}%`]
    );
  }
  return database.getAllAsync<any>(
    `SELECT ci.*, pl.name as line_name
     FROM catalog_items ci
     JOIN product_lines pl ON ci.product_line_id = pl.id
     ORDER BY ci.year, ci.display_name`
  );
}

export async function getCollectionItems() {
  const database = await getDatabase();
  return database.getAllAsync<any>(
    `SELECT uci.*, ci.display_name, ci.year, ci.market_value_brl, ci.image_url, ci.rarity_level
     FROM user_collection_items uci
     JOIN catalog_items ci ON uci.catalog_item_id = ci.id
     ORDER BY uci.created_at DESC`
  );
}

export async function addToCollection(catalogItemId: number, pricePaid: number, condition: string) {
  const database = await getDatabase();
  return database.runAsync(
    `INSERT INTO user_collection_items (user_collection_id, catalog_item_id, price_paid, condition_grade)
     VALUES (1, ?, ?, ?)`,
    [catalogItemId, pricePaid, condition]
  );
}

export async function getCollectionStats() {
  const database = await getDatabase();
  return database.getFirstAsync<{
    total_items: number;
    total_paid: number;
    total_market_value: number;
  }>(
    `SELECT
       COUNT(*) as total_items,
       SUM(uci.price_paid) as total_paid,
       SUM(ci.market_value_brl) as total_market_value
     FROM user_collection_items uci
     JOIN catalog_items ci ON uci.catalog_item_id = ci.id`
  );
}

export async function getTopValorizadas(limit = 5) {
  const database = await getDatabase();
  return database.getAllAsync<any>(
    `SELECT
       ci.display_name, ci.market_value_brl, uci.price_paid,
       ROUND((ci.market_value_brl - uci.price_paid) / uci.price_paid * 100) as appreciation_pct
     FROM user_collection_items uci
     JOIN catalog_items ci ON uci.catalog_item_id = ci.id
     WHERE uci.price_paid > 0
     ORDER BY appreciation_pct DESC
     LIMIT ?`,
    [limit]
  );
}
