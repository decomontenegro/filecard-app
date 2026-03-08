export const CREATE_TABLES = `
  CREATE TABLE IF NOT EXISTS figuras (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    character TEXT NOT NULL,
    year INTEGER NOT NULL,
    series TEXT DEFAULT 'ARAH',
    accessories TEXT DEFAULT '[]',
    variants TEXT DEFAULT '[]',
    image TEXT,
    market_value_brl REAL
  );

  CREATE TABLE IF NOT EXISTS colecao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    figura_id INTEGER NOT NULL REFERENCES figuras(id),
    condition TEXT NOT NULL DEFAULT 'C5',
    price_paid REAL NOT NULL DEFAULT 0,
    purchase_date TEXT,
    notes TEXT,
    photo TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`;
