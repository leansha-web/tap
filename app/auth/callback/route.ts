import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * OAuth 콜백 처리 라우트 (Agent 3, Skill 3-1)
 *
 * 소셜 로그인(구글/카카오) 후 Supabase가 리다이렉트하는 URL이다.
 * URL에 포함된 인증 코드를 세션 토큰으로 교환한 뒤,
 * /themes 페이지로 리다이렉트한다.
 *
 * 참조: docs/03_UserFlow.md 섹션 3.1
 */
export async function GET(request: NextRequest) {
  // URL에서 인증 코드 추출
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    // 쿠키 저장소 가져오기
    const cookieStore = cookies();

    // Supabase 서버 클라이언트 생성
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // 쿠키 읽기 함수
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          // 쿠키 설정 함수
          set(name: string, value: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value, ...options });
          },
          // 쿠키 삭제 함수
          remove(name: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // 인증 코드를 세션 토큰으로 교환
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 인증 완료 후 테마 분석 페이지로 리다이렉트
  return NextResponse.redirect(new URL('/themes', requestUrl.origin));
}
