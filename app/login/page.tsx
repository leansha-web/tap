'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';

/**
 * 로그인 페이지 (Agent 1, Skill 1-1)
 *
 * 구글/카카오 소셜 로그인 버튼을 제공하는 화면이다.
 * Supabase Auth를 사용하여 OAuth 인증을 처리한다.
 * 로그인 성공 시 /themes 페이지로 리다이렉트된다.
 *
 * 참조: docs/03_UserFlow.md 섹션 3.1
 */
export default function LoginPage() {
  // 에러 메시지 상태
  const [errorMessage, setErrorMessage] = useState<string>('');
  // 로딩 상태 (어떤 제공자로 로그인 중인지)
  const [loadingProvider, setLoadingProvider] = useState<string>('');

  /**
   * 소셜 로그인을 처리하는 함수
   * @param provider - OAuth 제공자 ('google' 또는 'kakao')
   */
  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    try {
      // 로딩 시작, 이전 에러 초기화
      setLoadingProvider(provider);
      setErrorMessage('');

      // Supabase OAuth 로그인 요청
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          // 로그인 성공 후 리다이렉트할 URL
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      // 에러가 발생하면 메시지 표시
      if (error) {
        setErrorMessage('로그인에 실패했습니다. 다시 시도해주세요.');
        console.error(`${provider} 로그인 에러:`, error);
      }
    } catch (error) {
      // 네트워크 오류 등 예상치 못한 에러
      setErrorMessage('인터넷 연결을 확인해주세요.');
      console.error('로그인 처리 중 에러:', error);
    } finally {
      setLoadingProvider('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      {/* 로그인 카드 */}
      <Card className="max-w-sm w-full text-center">
        {/* 앱 로고 및 제목 */}
        <h1 className="text-3xl font-bold text-primary mb-2">TAP</h1>
        <p className="text-text-secondary text-sm mb-8">
          테마별 종목 흐름을 한눈에
        </p>

        {/* 소셜 로그인 버튼들 */}
        <div className="space-y-3">
          {/* 구글 로그인 버튼 */}
          <Button
            variant="secondary"
            fullWidth
            onClick={() => handleSocialLogin('google')}
            loading={loadingProvider === 'google'}
            disabled={!!loadingProvider}
          >
            구글로 로그인
          </Button>

          {/* 카카오 로그인 버튼 */}
          <Button
            variant="secondary"
            fullWidth
            onClick={() => handleSocialLogin('kakao')}
            loading={loadingProvider === 'kakao'}
            disabled={!!loadingProvider}
          >
            카카오로 로그인
          </Button>
        </div>

        {/* 에러 메시지 (있을 때만 표시) */}
        {errorMessage && (
          <div
            className="mt-4 bg-danger/10 border border-danger text-danger px-4 py-3 rounded-md text-sm"
            role="alert"
          >
            {errorMessage}
          </div>
        )}
      </Card>
    </div>
  );
}
