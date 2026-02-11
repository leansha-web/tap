'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import StockTable from '@/components/features/StockTable';
import Spinner from '@/components/ui/Spinner';
import Skeleton from '@/components/ui/Skeleton';
import { apiGet } from '@/lib/api';
import type { ThemeStocksResponse } from '@/lib/types';

/**
 * 테마별 종목 목록 페이지 (FEAT-2, Agent 1, Skill 1-4)
 *
 * 선택한 테마에 속한 대장주 5개와 ETF 3개를 테이블로 표시한다.
 * 각 종목은 클릭하면 상세 페이지로 이동한다.
 *
 * 참조: docs/01_PRD.md FEAT-2, docs/03_UserFlow.md 섹션 2
 */
export default function ThemeStocksPage() {
  // URL에서 테마 코드 가져오기
  const params = useParams();
  const themeCode = params.code as string;

  // 종목 데이터 상태
  const [stocksData, setStocksData] = useState<ThemeStocksResponse | null>(null);
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  // 에러 메시지
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * 테마별 종목 데이터를 API에서 가져오는 함수
   */
  useEffect(() => {
    const fetchStocks = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await apiGet<ThemeStocksResponse>(`/api/themes/${themeCode}/stocks`);
        setStocksData(data);
      } catch (error) {
        console.error('종목 조회 실패:', error);
        setErrorMessage('종목 데이터를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    if (themeCode) {
      fetchStocks();
    }
  }, [themeCode]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 뒤로 가기 링크 */}
      <Link
        href="/themes"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        테마 목록으로 돌아가기
      </Link>

      {/* 페이지 제목 */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          테마 종목 분석
        </h1>
        <p className="text-text-secondary">
          테마 코드: {themeCode} — 대장주 및 관련 ETF를 비교하세요.
        </p>
      </div>

      {/* 에러 메시지 */}
      {errorMessage && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm">
          {errorMessage}
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-lg p-5">
            <Skeleton width="200px" height="24px" />
            <div className="mt-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} width="100%" height="40px" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 종목 테이블 */}
      {!isLoading && stocksData && (
        <div className="space-y-8">
          {/* 대장주 테이블 */}
          <div className="bg-surface border border-border rounded-lg p-5">
            <StockTable
              stocks={stocksData.stocks}
              title={`대장주 TOP ${stocksData.stocks.length}`}
            />
          </div>

          {/* ETF 테이블 */}
          {stocksData.etfs.length > 0 && (
            <div className="bg-surface border border-border rounded-lg p-5">
              <StockTable
                stocks={stocksData.etfs}
                title={`관련 ETF ${stocksData.etfs.length}개`}
              />
            </div>
          )}

          {/* 데이터 없음 */}
          {stocksData.stocks.length === 0 && stocksData.etfs.length === 0 && (
            <div className="text-center py-12 text-text-secondary">
              <p className="text-lg">이 테마에 속한 종목이 없습니다.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
