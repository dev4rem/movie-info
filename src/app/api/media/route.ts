import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { MediaItem } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const type = searchParams.get('type')?.trim();
    const tag = searchParams.get('tag')?.trim();
    const sort = searchParams.get('sort')?.trim() || 'latest';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (q) {
      conditions.push(`(title ILIKE $${paramIndex} OR original_title ILIKE $${paramIndex} OR overview ILIKE $${paramIndex})`);
      params.push(`%${q}%`);
      paramIndex++;
    }

    if (type && type !== '全部') {
      conditions.push(`type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    if (tag && tag !== '全部') {
      conditions.push(`$${paramIndex} = ANY(tags)`);
      params.push(tag);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'updated_at DESC';
    if (sort === 'rating') {
      orderBy = 'rating DESC, updated_at DESC';
    } else if (sort === 'year') {
      orderBy = 'year DESC, rating DESC';
    } else if (sort === 'latest') {
      orderBy = 'updated_at DESC';
    }

    const sqlText = `
      SELECT 
        m.*,
        (SELECT COUNT(*)::int FROM resources r WHERE r.media_id = m.id) AS resource_count
      FROM media m
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex};
    `;
    params.push(limit);

    const rows = await query<MediaItem & { resource_count: number }>(sqlText, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('Fetch media list failed:', error);
    return NextResponse.json({ success: false, message: '获取影视列表失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ success: false, message: '请先登录管理员权限' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      original_title = '',
      type = '电影',
      year = new Date().getFullYear(),
      country = '中国',
      overview = '',
      poster_url = '',
      backdrop_url = '',
      rating = 8.0,
      tags = [],
    } = body;

    if (!title) {
      return NextResponse.json({ success: false, message: '标题为必填项' }, { status: 400 });
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(/[,，\s]+/).filter(Boolean)
      : [];

    const insertSql = `
      INSERT INTO media (title, original_title, type, year, country, overview, poster_url, backdrop_url, rating, tags, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *;
    `;

    const result = await query<MediaItem>(insertSql, [
      title,
      original_title,
      type,
      year ? parseInt(String(year), 10) : null,
      country,
      overview,
      poster_url,
      backdrop_url || poster_url,
      parseFloat(String(rating)) || 0,
      parsedTags,
    ]);

    return NextResponse.json({ success: true, data: result[0], message: '影视作品已成功创建' });
  } catch (error) {
    console.error('Create media failed:', error);
    return NextResponse.json({ success: false, message: '创建影视作品失败' }, { status: 500 });
  }
}
