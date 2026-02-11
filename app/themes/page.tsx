'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';
import ThemeCard from '@/components/features/ThemeCard';
import ThemeSearch from '@/components/features/ThemeSearch';
import Spinner from '@/components/ui/Spinner';
import Skeleton from '@/components/ui/Skeleton';
import { apiGet } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import type { Theme, ThemesResponse, ThemeSearchResponse } from '@/lib/types';

/**
 * 테마 분석 페이지 (FEAT-1, Agent 1, Skill 1-1)
 *
 * 거래량/급등주 기준으로 상위 5개 테마를 추천하는 메인 화면이다.
 * - 정렬 기준 탭 전환 (거래량 / 급등주)
 * - 테마 검색
 * - 바구니에 테마 추가
 *
 * 참조: docs/01_PRD.md FEAT-1, docs/03_UserFlow.md 섹션 1
 */
export default function ThemesPage() {
  // 추천 테마 목록
  const [themes, setThemes] = useState<Theme[]>([]);
  // 검색 결과 테마 목록
  const [searchResults, setSearchResults] = useState<Theme[] | null>(null);
  // 현재 정렬 기준 ('volume' 또는 'surge')
  const [sortBy, setSortBy] = useState<'volume' | 'surge'>('volume');
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  // 검색 로딩 상태
  const [isSearching, setIsSearching] = useState(false);
  // 에러 메시지
  const [errorMessage, setErrorMessage] = useState('');
  // 바구니에 담긴 테마 코드 세트
  const [basketThemeCodes, setBasketThemeCodes] = useState<Set<string>>(new Set());

  /**
   * 테마 추천 목록을 API에서 가져오는 함수
   */
  const fetchThemes = useCallback(async (sort: 'volume' | 'surge') => {
    setIsLoading(true);
    setErrorMessage('');
    setSearchResults(null);

    try {
      const data = await apiGet<ThemesResponse>(`/api/themes?sort=${sort}`);
      setThemes(data.themes);
    } catch (error) {
      console.error('테마 조회 실패:', error);
      setErrorMessage('테마 데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
      setThemes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 테마 검색 함수
   */
  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setErrorMessage('');

    try {
      const data = await apiGet<ThemeSearchResponse>(`/api/themes/search?q=${encodeURIComponent(query)}`);
      setSearchResults(data.themes);
    } catch (error) {
      console.error('테마 검색 실패:', error);
      setErrorMessage('테마 검색에 실패했습니다.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * 바구니에 테마 추가 함수
   * Supabase baskets / basket_themes 테이블에 데이터를 저장한다
   */
  const handleAddToBasket = async (theme: Theme) => {
    try {
      // 현재 로그인한 사용자 정보 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setErrorMessage('바구니에 담으려면 로그인이 필요합니다.');
        return;
      }

      const userId = session.user.id;

      // 기본 바구니 조회 또는 생성
      let { data: baskets } = await supabase
        .from('baskets')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      let basketId: number;

      if (baskets && baskets.length > 0) {
        basketId = baskets[0].id;
      } else {
        // 기본 바구니 생성
        const { data: newBasket, error } = await supabase
          .from('baskets')
          .insert({ user_id: userId, name: '내 바구니' })
          .select('id')
          .single();

        if (error || !newBasket) {
          setErrorMessage('바구니 생성에 실패했습니다.');
          return;
        }
        basketId = newBasket.id;
      }

      // 테마를 바구니에 추가 (themes 테이블에 먼저 upsert)
      await supabase
        .from('themes')
        .upsert({
          id: theme.id,
          name: theme.name,
          code: theme.code,
          trading_volume: theme.trading_volume,
          surge_stock_count: theme.surge_stock_count,
        }, { onConflict: 'code' });

      // basket_themes에 매핑 추가
      const { error: insertError } = await supabase
        .from('basket_themes')
        .insert({ basket_id: basketId, theme_id: theme.id });

      if (insertError) {
        // 이미 담겨 있는 경우 (UNIQUE 제약조건)
        if (insertError.code === '23505') {
          setErrorMessage('이미 바구니에 담긴 테마입니다.');
        } else {
          setErrorMessage('바구니에 추가하는 데 실패했습니다.');
        }
        return;
      }

      // 바구니 상태 업데이트
      setBasketThemeCodes((prev) => new Set([...prev, theme.code]));

    } catch (error) {
      console.error('바구니 추가 실패:', error);
      setErrorMessage('바구니에 추가하는 데 실패했습니다.');
    }
  };

  /**
   * 정렬 기준 탭 변경 핸들러
   */
  const handleSortChange = (sort: 'volume' | 'surge') => {
    setSortBy(sort);
    fetchThemes(sort);
  };

  // 컴포넌트 마운트 시 테마 목록 로드
  useEffect(() => {
    fetchThemes(sortBy);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // 표시할 테마 목록 결정 (검색 결과가 있으면 검색 결과, 없으면 추천 목록)
  const displayThemes = searchResults !== null ? searchResults : themes;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 페이지 제목 */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">테마 분석</h1>
        <p className="text-text-secondary">거래량 또는 급등주 기준으로 주목할 테마를 확인하세요.</p>
      </div>

      {/* 테마 검색 */}
      <ThemeSearch onSearch={handleSearch} isLoading={isSearching} />

      {/* 검색 결과 표시 시 되돌아가기 버튼 */}
      {searchResults !== null && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">
            검색 결과 {searchResults.length}건
          </span>
          <button
            onClick={() => setSearchResults(null)}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            추천 목록으로 돌아가기
          </button>
        </div>
      )}

      {/* 정렬 기준 탭 (검색 결과가 아닌 경우에만 표시) */}
      {searchResults === null && (
        <div className="flex gap-2">
          <button
            onClick={() => handleSortChange('volume')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${sortBy === 'volume'
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-primary/50'
              }
            `}
          >
            <BarChart3 className="w-4 h-4" aria-hidden="true" />
            거래량 기준
          </button>
          <button
            onClick={() => handleSortChange('surge')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${sortBy === 'surge'
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-primary/50'
              }
            `}
          >
            <TrendingUp className="w-4 h-4" aria-hidden="true" />
            급등주 기준
          </button>
        </div>
      )}

      {/* 에러 메시지 */}
      {errorMessage && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm">
          {errorMessage}
        </div>
      )}

      {/* 로딩 상태 */}
      {(isLoading || isSearching) && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="bg-surface border border-border rounded-lg p-5">
              <Skeleton width="40%" height="24px" />
              <div className="mt-3 flex gap-4">
                <Skeleton width="120px" height="16px" />
                <Skeleton width="80px" height="16px" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 테마 카드 목록 */}
      {!isLoading && !isSearching && (
        <div className="space-y-3">
          {displayThemes.length > 0 ? (
            displayThemes.map((theme) => (
              <ThemeCard
                key={theme.code}
                theme={theme}
                isInBasket={basketThemeCodes.has(theme.code)}
                onAddToBasket={handleAddToBasket}
              />
            ))
          ) : (
            <div className="text-center py-12 text-text-secondary">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">
                {searchResults !== null
                  ? '검색 결과가 없습니다.'
                  : '테마 데이터를 불러올 수 없습니다.'
                }
              </p>
              <p className="text-sm mt-2">
                {searchResults !== null
                  ? '다른 키워드로 다시 검색해보세요.'
                  : 'FastAPI 서버가 실행 중인지 확인해주세요.'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
