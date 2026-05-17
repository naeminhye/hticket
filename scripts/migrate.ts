import { neon } from "@neondatabase/serverless";
import * as dotenv from "node:fs";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL not set");

const sql = neon(url);

async function migrate() {
  console.log("Running migrations...");

  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id          TEXT PRIMARY KEY,
      title_vi    TEXT NOT NULL,
      title_en    TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      venue       TEXT NOT NULL,
      start_at    TEXT NOT NULL DEFAULT '',
      end_at      TEXT NOT NULL DEFAULT '',
      policy      TEXT NOT NULL DEFAULT '',
      cover       TEXT NOT NULL DEFAULT '#FF8FA8',
      cover2      TEXT NOT NULL DEFAULT '#C4B5FB',
      badge       TEXT NOT NULL DEFAULT 'concert',
      status      TEXT NOT NULL DEFAULT 'open',
      sold        INTEGER NOT NULL DEFAULT 0,
      held        INTEGER NOT NULL DEFAULT 0,
      revenue     BIGINT NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      published_at TIMESTAMPTZ
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS zones (
      id           TEXT PRIMARY KEY,
      event_id     TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      name         TEXT NOT NULL,
      type         TEXT NOT NULL DEFAULT 'seating',
      color        TEXT NOT NULL DEFAULT '#FF8FA8',
      x            REAL NOT NULL DEFAULT 0,
      y            REAL NOT NULL DEFAULT 0,
      w            REAL NOT NULL DEFAULT 240,
      h            REAL NOT NULL DEFAULT 80,
      capacity     INTEGER NOT NULL DEFAULT 200,
      price        INTEGER NOT NULL DEFAULT 0,
      rows         INTEGER,
      cols         INTEGER,
      queue_prefix TEXT,
      sort_order   INTEGER NOT NULL DEFAULT 0
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id         TEXT PRIMARY KEY,
      event_id   TEXT NOT NULL REFERENCES events(id),
      buyer      TEXT NOT NULL,
      email      TEXT NOT NULL,
      phone      TEXT NOT NULL DEFAULT '',
      area_name  TEXT NOT NULL,
      qty        INTEGER NOT NULL,
      total      INTEGER NOT NULL,
      status     TEXT NOT NULL DEFAULT 'paid',
      items      JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  console.log("✓ Tables created (or already exist)");
}

migrate().catch(err => { console.error(err); process.exit(1); });
