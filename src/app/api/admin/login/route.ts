import { NextResponse } from 'next/server';
import { checkAdminPassword, setAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ success: false, message: '请输入管理密码' }, { status: 400 });
    }

    if (!checkAdminPassword(password)) {
      return NextResponse.json({ success: false, message: '管理密码不正确' }, { status: 401 });
    }

    await setAdminSession();
    return NextResponse.json({ success: true, message: '登录成功' });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: '登录处理异常' }, { status: 500 });
  }
}
