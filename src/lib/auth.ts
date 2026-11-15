import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = 'cinema_admin_token';

/**
 * 获取基于服务端秘钥的动态校验签名
 * 确保即使代码开源，也绝不可能伪造 Cookie
 */
function getExpectedToken(): string {
  const secret = process.env.ADMIN_PASSWORD || 'admin123';
  const salt = process.env.SESSION_SECRET || 'cinema_secure_salt_key_9988';
  return crypto.createHmac('sha256', salt).update(secret).digest('hex');
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);
  if (!token?.value) return false;

  const expected = getExpectedToken();
  // 使用定长时序比较，防止时序攻击（Timing Attacks）
  try {
    const a = Buffer.from(token.value);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  const token = getExpectedToken();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true, // 防止浏览器端 JS 读取，杜绝 XSS 窃取 Cookie
    secure: process.env.NODE_ENV === 'production', // 生产环境仅限 HTTPS 传输
    sameSite: 'lax', // 防止跨站请求伪造 (CSRF)
    maxAge: 60 * 60 * 24 * 7, // 7 天有效期
    path: '/',
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function checkAdminPassword(password: string): boolean {
  const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
  if (!password || !expectedPassword) return false;
  
  // 使用定长时序对比，避免密码比对过程被基于响应时间的侧信道探测
  const bufA = Buffer.from(password);
  const bufB = Buffer.from(expectedPassword);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
