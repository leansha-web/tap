'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';
import { supabase } from '@/lib/supabase';
import { formatLargeNumber } from '@/lib/utils';
import type { Theme } from '@/lib/types';

/**
 * 바구니에 담긴 테마 정보 (basket_themes + themes 조인 결과)
 */
interface BasketThemeItem {
  id: number;        // basket_themes.id (매핑 ID)
  added_at: string;  // 추가일
  theme: Theme;      // 조인된 테마 정보
}

/**
 * 바구니 페이지 (FEAT-1, Agent 1, Skill 1-3)
 *
 * 사용자가 담은 테마 목록을 표시하고, 종목 분석으로 이동하는 화면이다.
 * - Supabase에서 본인 바구니의 테마 목록을 조회한다
 * - 각 테마를 클릭하면 종목 분석 페이지로 이동한다
 * - 삭제 버튼으로 바구니에서 테마를 제거할 수 있다
 *
 * 참조: docs/01_PRD.md FEAT-1, docs/03_UserFlow.md 섹션 1.3
 */
export default function BasketPage() {
  // 바구니에 담긴 테마 목록
  const [basketThemes, setBasketThemes] = useState<BasketThemeItem[]>([]);
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  // 에러 메시지
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * 바구니의 테마 목록을 Supabase에서 가져오는 함수
   */
  const fetchBasketThemes = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      // 현재 로그인한 사용자 정보
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setErrorMessage('바구니를 보려면 로그인이 필요합니다.');
        setIsLoading(false);
        return;
      }

      // 사용자의 바구니 조회
      const { data: baskets } = await supabase
        .from('baskets')
        .select('id')
        .eq('user_id', session.user.id)
        .limit(1);

      if (!baskets || baskets.length === 0) {
        // 바구니가 없으면 빈 목록 표시
        setBasketThemes([]);
        setIsLoading(false);
        return;
      }

      const basketId = baskets[0].id;

      // basket_themes에서 테마 정보와 함께 조회
      const { data: items, error } = await supabase
        .from('basket_themes')
        .select(`
          id,
          added_at,
          themes (
            id,
            code,
            name,
            trading_volume,
            surge_stock_count,
            updated_at
          )
        `)
        .eq('basket_id', basketId)
        .order('added_at', { ascending: false });

      if (error) {
        throw error;
      }

      // 데이터 가공
      const formattedItems: BasketThemeItem[] = (items || [])
        .filter((item: { themes: unknown }) => item.themes !== null)
        .map((item: { id: number; added_at: string; themes: Theme | Theme[] }) => ({
          id: item.id,
          added_at: item.added_at,
          theme: Array.isArray(item.themes) ? item.themes[0] : item.themes,
        }));

      setBasketThemes(formattedItems);

    } catch (error) {
      console.error('바구니 조회 실패:', error);
      setErrorMessage('바구니 데이터를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 바구니에서 테마를 삭제하는 함수
   */
  const handleRemoveTheme = async (basketThemeId: number) => {
    try {
      const { error } = await supabase
        .from('basket_themes')
        .delete()
        .eq('id', basketThemeId);

      if (error) {
        throw error;
      }

      // 목록에서 삭제된 항목 제거
      setBasketThemes((prev) => prev.filter((item) => item.id !== basketThemeId));

    } catch (error) {
      console.error('바구니 삭제 실패:', error);
      setErrorMessage('테마 삭제에 실패했습니다.');
    }
  };

  // 컴포넌트 마운트 시 바구니 데이터 로드
  useEffect(() => {
    fetchBasketThemes();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 페이지 제목 */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">내 바구니</h1>
        <p className="text-text-secondary">관심 있는 테마를 모아놓고, 종목 분석으로 바로 이동하세요.</p>
      </div>

      {/* 에러 메시지 */}
      {errorMessage && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm">
          {errorMessage}
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((index) => (
            <div key={index} className="bg-surface border border-border rounded-lg p-5">
              <Skeleton width="40%" height="24px" />
              <div className="mt-3">
                <Skeleton width="120px" height="16px" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 바구니 테마 목록 */}
      {!isLoading && (
        <div className="space-y-3">
          {basketThemes.length > 0 ? (
            basketThemes.map((item) => (
              <div
                key={item.id}
                className="bg-surface border border-border rounded-lg p-5 flex items-center justify-between hover:border-primary/50 transition-colors"
              >
                {/* 테마 정보 */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {item.theme.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-text-secondary">
                    <span>
                      거래량: <span className="font-mono">{formatLargeNumber(item.theme.trading_volume)}</span>
                    </span>
                    {item.theme.surge_stock_count > 0 && (
                      <span className="text-success">
                        급등 {item.theme.surge_stock_count}종목
                      </span>
                    )}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-2 ml-4">
                  {/* 종목 분석으로 이동 */}
                  <Link
                    href={`/themes/${item.theme.code}/stocks`}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md transition-colors"
                    aria-label={`${item.theme.name} 종목 분석`}
                  >
                    종목 보기
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>

                  {/* 삭제 버튼 */}
                  <button
                    onClick={() => handleRemoveTheme(item.id)}
                    aria-label={`${item.theme.name} 바구니에서 삭제`}
                    className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-text-secondary">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">바구니가 비어 있습니다.</p>
              <p className="text-sm mt-2">테마 분석에서 관심 있는 테마를 담아보세요.</p>
              <Link
                href="/themes"
                className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                테마 분석으로 이동
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
