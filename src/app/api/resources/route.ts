import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import { ResourceItem } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ success: false, message: '请先登录管理员权限' }, { status: 401 });
    }

    const body = await request.json();
    const { media_id, resources, name, type, code, url } = body;

    const mediaId = parseInt(String(media_id), 10);
    if (isNaN(mediaId)) {
      return NextResponse.json({ success: false, message: '必须指定关联的影视ID' }, { status: 400 });
    }

    // 支持批量添加或者单条添加
    if (Array.isArray(resources) && resources.length > 0) {
      const addedItems: ResourceItem[] = [];

      for (const item of resources) {
        if (!item.name || !item.url) continue;

        const res = await query<ResourceItem>(
          `INSERT INTO resources (media_id, name, type, code, url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *;`,
          [
            mediaId,
            item.name.trim(),
            item.type?.trim() || '网盘链接',
            item.code?.trim() || '',
            item.url.trim(),
          ]
        );
        addedItems.push(res[0]);
      }

      // 联动更新 media 的 updated_at
      await execute('UPDATE media SET updated_at = NOW() WHERE id = $1;', [mediaId]);

      return NextResponse.json({
        success: true,
        message: `成功批量添加 ${addedItems.length} 条资源`,
        data: addedItems,
      });
    }

    // 单条添加
    if (!name || !url) {
      return NextResponse.json({ success: false, message: '资源名称和链接地址为必填项' }, { status: 400 });
    }

    const res = await query<ResourceItem>(
      `INSERT INTO resources (media_id, name, type, code, url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *;`,
      [mediaId, name.trim(), type?.trim() || '网盘链接', code?.trim() || '', url.trim()]
    );

    await execute('UPDATE media SET updated_at = NOW() WHERE id = $1;', [mediaId]);

    return NextResponse.json({
      success: true,
      message: '资源链接已成功添加',
      data: res[0],
    });
  } catch (error) {
    console.error('Add resources failed:', error);
    return NextResponse.json({ success: false, message: '添加影视资源失败' }, { status: 500 });
  }
}
