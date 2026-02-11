import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 보호된 라우트를 위한 미들웨어 (Agent 1, Skill 1-8)
 *
 * 모든 페이지 요청 전에 실행되어 로그인 상태를 확인한다.
 * 로그인하지 않은 사용자가 보호된 페이지에 접근하면 /login으로 리다이렉트한다.
 *
 * 보호된 경로: /themes, /basket, /stocks, /reports
 * 허용된 경로: /login, /auth/callback, /, 정적 파일
 *
 * 참조: docs/03_UserFlow.md 섹션 5 (엣지 케이스)
 */

// 보호가 필요한 경로 목록
const PROTECTED_PATHS = ['/themes', '/basket', '/stocks', '/reports'];

export async function middleware(request: NextRequest) {
  // NextResponse 객체 생성
  const response = NextResponse.next();

  // Supabase 서버 클라이언트 생성 (미들웨어용)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // 요청 쿠키에서 읽기
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        // 응답 쿠키에 설정
        set(name: string, value: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value });
          response.cookies.set({ name, value, ...options });
        },
        // 쿠키 삭제
        remove(name: string, options: Record<string, unknown>) {
          request.cookies.set({ name, value: '' });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 현재 세션 가져오기
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 현재 요청 경로
  const currentPath = request.nextUrl.pathname;

  // 보호된 경로인지 확인
  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    currentPath.startsWith(path)
  );

  // 로그인하지 않은 사용자가 보호된 경로에 접근하면 /login으로 리다이렉트
  if (isProtectedPath && !session) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 이미 로그인한 사용자가 /login에 접근하면 /themes로 리다이렉트
  if (currentPath === '/login' && session) {
    const themesUrl = new URL('/themes', request.url);
    return NextResponse.redirect(themesUrl);
  }

  return response;
}

/**
 * 미들웨어가 실행될 경로 패턴 설정
 * 정적 파일(_next, favicon 등)은 미들웨어를 건너뛴다
 */
export const config = {
  matcher: [
    // 정적 파일과 API 라우트를 제외한 모든 경로에 적용
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
