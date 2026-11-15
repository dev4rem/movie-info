import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ success: false, message: '请先登录管理员权限' }, { status: 401 });
    }

    const { id } = await context.params;
    const resourceId = parseInt(id, 10);
    if (isNaN(resourceId)) {
      return NextResponse.json({ success: false, message: '无效的资源ID' }, { status: 400 });
    }

    await execute('DELETE FROM resources WHERE id = $1;', [resourceId]);

    return NextResponse.json({ success: true, message: '资源链接已成功删除' });
  } catch (error) {
    console.error('Delete resource failed:', error);
    return NextResponse.json({ success: false, message: '删除资源失败' }, { status: 500 });
  }
}
