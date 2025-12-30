import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

const USER_COOKIE_NAME = 'anonymous_user_id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 yıl

/**
 * Cookie'den kullanıcı ID'sini al veya yeni oluştur
 */
export async function getOrCreateUserId(): Promise<string> {
  const cookieStore = await cookies();
  let userId = cookieStore.get(USER_COOKIE_NAME)?.value;

  if (!userId) {
    userId = randomUUID();
    cookieStore.set(USER_COOKIE_NAME, userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });
  }

  return userId;
}
