import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { MediaItem, ResourceItem } from '@/lib/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const mediaId = parseInt(id, 10);
    if (isNaN(mediaId)) {
      return NextResponse.json({ success: false, message: '无效的影视ID' }, { status: 400 });
    }

    const media = await queryOne<MediaItem>(
      'SELECT * FROM media WHERE id = $1;',
      [mediaId]
    );

    if (!media) {
      return NextResponse.json({ success: false, message: '未找到该影视作品' }, { status: 404 });
    }

    const resources = await query<ResourceItem>(
      'SELECT * FROM resources WHERE media_id = $1 ORDER BY id ASC;',
      [mediaId]
    );

    return NextResponse.json({
      success: true,
      data: {
        ...media,
        resources,
      },
    });
  } catch (error) {
    console.error('Get media detail failed:', error);
    return NextResponse.json({ success: false, message: '获取影视详情失败' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ success: false, message: '请先登录管理员权限' }, { status: 401 });
    }

    const { id } = await context.params;
    const mediaId = parseInt(id, 10);
    if (isNaN(mediaId)) {
      return NextResponse.json({ success: false, message: '无效的影视ID' }, { status: 400 });
    }

    const body = await request.json();
    const {
      title,
      original_title,
      type,
      year,
      country,
      overview,
      poster_url,
      backdrop_url,
      rating,
      tags,
    } = body;

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(/[,，\s]+/).filter(Boolean)
      : [];

    const updateSql = `
      UPDATE media 
      SET 
        title = COALESCE($1, title),
        original_title = COALESCE($2, original_title),
        type = COALESCE($3, type),
        year = COALESCE($4, year),
        country = COALESCE($5, country),
        overview = COALESCE($6, overview),
        poster_url = COALESCE($7, poster_url),
        backdrop_url = COALESCE($8, backdrop_url),
        rating = COALESCE($9, rating),
        tags = COALESCE($10, tags),
        updated_at = NOW()
      WHERE id = $11
      RETURNING *;
    `;

    const updated = await query<MediaItem>(updateSql, [
      title,
      original_title,
      type,
      year ? parseInt(String(year), 10) : null,
      country,
      overview,
      poster_url,
      backdrop_url,
      rating !== undefined ? parseFloat(String(rating)) : null,
      parsedTags,
      mediaId,
    ]);

    if (!updated.length) {
      return NextResponse.json({ success: false, message: '未找到要更新的影视记录' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated[0], message: '影视作品已成功更新' });
  } catch (error) {
    console.error('Update media failed:', error);
    return NextResponse.json({ success: false, message: '更新影视信息失败' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ success: false, message: '请先登录管理员权限' }, { status: 401 });
    }

    const { id } = await context.params;
    const mediaId = parseInt(id, 10);
    if (isNaN(mediaId)) {
      return NextResponse.json({ success: false, message: '无效的影视ID' }, { status: 400 });
    }

    await execute('DELETE FROM media WHERE id = $1;', [mediaId]);

    return NextResponse.json({ success: true, message: '影视作品及关联资源已删除' });
  } catch (error) {
    console.error('Delete media failed:', error);
    return NextResponse.json({ success: false, message: '删除影视作品失败' }, { status: 500 });
  }
}
