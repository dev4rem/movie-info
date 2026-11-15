import { Pool } from 'pg';
import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';

let pool: Pool | null = null;
let pgliteInstance: PGlite | null = null;
let initialized = false;

// 全局单例保护，防止 Next.js 热重载重复实例化
declare global {
  // eslint-disable-next-line no-var
  var __dbPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __pgliteInstance: PGlite | undefined;
  // eslint-disable-next-line no-var
  var __dbInitialized: boolean | undefined;
}

export async function getDb() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl) {
    if (!globalThis.__dbPool) {
      globalThis.__dbPool = new Pool({
        connectionString: databaseUrl,
        max: 10,
        idleTimeoutMillis: 30000,
      });
    }
    pool = globalThis.__dbPool;
    return { type: 'pg' as const, client: pool };
  } else {
    if (!globalThis.__pgliteInstance) {
      const dataDir = path.join(process.cwd(), 'data', 'pgdata');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      globalThis.__pgliteInstance = new PGlite(dataDir);
    }
    pgliteInstance = globalThis.__pgliteInstance;
    return { type: 'pglite' as const, client: pgliteInstance };
  }
}

/**
 * 确保数据库表和索引已就绪
 */
export async function ensureSchema() {
  if (globalThis.__dbInitialized) {
    return;
  }

  const { type, client } = await getDb();
  const schemaPath = path.join(process.cwd(), 'scripts', 'schema.sql');
  let schemaSql = '';

  if (fs.existsSync(schemaPath)) {
    schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  } else {
    schemaSql = `
      CREATE TABLE IF NOT EXISTS media (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          original_title VARCHAR(255),
          type VARCHAR(50) NOT NULL DEFAULT '电影',
          year INTEGER,
          country VARCHAR(100),
          overview TEXT,
          poster_url TEXT,
          backdrop_url TEXT,
          rating NUMERIC(3, 1) DEFAULT 0.0,
          tags TEXT[] DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS resources (
          id SERIAL PRIMARY KEY,
          media_id INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL DEFAULT '网盘链接',
          code VARCHAR(100),
          url TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
      CREATE INDEX IF NOT EXISTS idx_media_rating ON media(rating DESC);
      CREATE INDEX IF NOT EXISTS idx_media_year ON media(year DESC);
      CREATE INDEX IF NOT EXISTS idx_resources_media_id ON resources(media_id);
    `;
  }

  if (type === 'pg') {
    await (client as Pool).query(schemaSql);
  } else {
    await (client as PGlite).exec(schemaSql);
  }

  globalThis.__dbInitialized = true;
  initialized = true;
}

/**
 * 统一执行参数化 SQL 查询并返回多行结果
 */
export async function query<T = any>(sqlText: string, params: any[] = []): Promise<T[]> {
  await ensureSchema();
  const { type, client } = await getDb();

  let rows: any[] = [];
  if (type === 'pg') {
    const res = await (client as Pool).query(sqlText, params);
    rows = res.rows;
  } else {
    const res = await (client as PGlite).query(sqlText, params);
    rows = res.rows as any[];
  }

  // 格式化输出，处理 tags 数组与数字类型
  return rows.map((row) => normalizeRow(row)) as T[];
}

/**
 * 执行参数化 SQL 查询并返回第一行（若无则返回 null）
 */
export async function queryOne<T = any>(sqlText: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sqlText, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * 执行数据修改语句（INSERT / UPDATE / DELETE）
 */
export async function execute(sqlText: string, params: any[] = []): Promise<void> {
  await ensureSchema();
  const { type, client } = await getDb();

  if (type === 'pg') {
    await (client as Pool).query(sqlText, params);
  } else {
    await (client as PGlite).query(sqlText, params);
  }
}

/**
 * 针对 PostgreSQL 输出做兼容标准化（如 tags 数组或 rating 数值）
 */
function normalizeRow(row: any): any {
  if (!row || typeof row !== 'object') return row;
  const res = { ...row };

  if ('rating' in res && res.rating !== null && res.rating !== undefined) {
    res.rating = Number(res.rating);
  }

  if ('tags' in res) {
    if (Array.isArray(res.tags)) {
      res.tags = res.tags;
    } else if (typeof res.tags === 'string') {
      // 处理形如 "{科幻,悬疑,动作}" 的 Postgres 数组字符串
      const cleaned = res.tags.replace(/^\{|\}$/g, '').trim();
      res.tags = cleaned ? cleaned.split(',').map((t: string) => t.trim().replace(/^"|"$/g, '')) : [];
    } else {
      res.tags = [];
    }
  }

  return res;
}
