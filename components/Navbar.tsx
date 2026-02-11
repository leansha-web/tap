'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ShoppingBag, LogOut, LogIn, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

/**
 * 네비게이션 링크 목록 정의
 * 각 링크의 경로, 표시 텍스트, 아이콘을 정의한다
 */
const NAV_LINKS = [
  { href: '/themes', label: '테마 분석', icon: BarChart3 },
  { href: '/basket', label: '바구니', icon: ShoppingBag },
] as const;

/**
 * 네비게이션 바 컴포넌트 (Agent 1, Skill 1-8)
 *
 * 모든 페이지 상단에 고정되는 공통 네비게이션 바이다.
 * - 데스크톱 (≥1024px): 수평 링크 + 로그아웃 버튼
 * - 모바일 (<1024px): 햄버거 메뉴 + 슬라이드 아웃 드로어
 * - 현재 페이지가 하이라이트된다 (primary 색상 밑줄)
 * - 로그인 상태에 따라 로그아웃/로그인 버튼이 조건부 표시된다
 *
 * Design System(docs/05_DesignSystem.md) 섹션 7 참조
 */
export default function Navbar() {
  // 현재 페이지 경로 (하이라이트용)
  const pathname = usePathname();
  // 라우터 (페이지 이동용)
  const router = useRouter();

  // 모바일 메뉴 열림/닫힘 상태
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 현재 로그인 세션 상태
  const [session, setSession] = useState<Session | null>(null);

  /**
   * 컴포넌트 마운트 시 세션 상태를 가져오고,
   * 인증 상태 변경을 실시간으로 구독한다
   */
  useEffect(() => {
    // 현재 세션 가져오기
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
    });

    // 인증 상태 변경 이벤트 구독 (로그인/로그아웃 시 자동 업데이트)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => subscription.unsubscribe();
  }, []);

  /**
   * 주어진 경로가 현재 페이지인지 확인하는 함수
   * @param href - 확인할 경로
   * @returns 현재 페이지이면 true
   */
  const isActivePage = (href: string): boolean => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  /**
   * 로그아웃 처리 함수
   * Supabase Auth에서 로그아웃 후 /login 페이지로 이동한다
   */
  const handleLogout = async () => {
    // Supabase 세션 종료
    await supabase.auth.signOut();
    // 로그인 페이지로 이동
    router.push('/login');
  };

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* 로고 */}
          <Link
            href="/"
            className="text-xl font-bold text-primary hover:text-blue-400 transition-colors"
          >
            TAP
          </Link>

          {/* 데스크톱 네비게이션 링크 (1024px 이상에서 표시) */}
          <div className="hidden lg:flex items-center gap-1">
            {/* 로그인 상태일 때만 네비게이션 링크 표시 */}
            {session && NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = isActivePage(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                    transition-colors duration-150
                    ${isActive
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* 데스크톱: 로그인/로그아웃 조건부 표시 */}
          <div className="hidden lg:flex items-center">
            {session ? (
              // 로그인 상태: 로그아웃 버튼
              <button
                onClick={handleLogout}
                aria-label="로그아웃"
                className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-gray-700 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                로그아웃
              </button>
            ) : (
              // 비로그인 상태: 로그인 버튼
              <Link
                href="/login"
                className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:text-blue-400 hover:bg-gray-700 rounded-md transition-colors"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                로그인
              </Link>
            )}
          </div>

          {/* 모바일 햄버거 버튼 (1024px 미만에서 표시) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            className="lg:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-gray-700 rounded-md transition-colors focus:ring-2 focus:ring-primary/50 focus:outline-none"
          >
            {isMobileMenuOpen
              ? <X className="w-6 h-6" aria-hidden="true" />
              : <Menu className="w-6 h-6" aria-hidden="true" />
            }
          </button>
        </div>
      </div>

      {/* 모바일 슬라이드 아웃 메뉴 */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-surface">
          <div className="px-4 py-3 space-y-1">
            {/* 로그인 상태일 때만 네비게이션 링크 표시 */}
            {session && NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = isActivePage(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium
                    transition-colors duration-150
                    ${isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-text-secondary hover:text-text-primary hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}

            {/* 모바일: 로그인/로그아웃 조건부 표시 */}
            {session ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-text-secondary hover:text-text-primary hover:bg-gray-700 w-full transition-colors"
              >
                <LogOut className="w-5 h-5" aria-hidden="true" />
                로그아웃
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-primary hover:text-blue-400 hover:bg-gray-700"
              >
                <LogIn className="w-5 h-5" aria-hidden="true" />
                로그인
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
