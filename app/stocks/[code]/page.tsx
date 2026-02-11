'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';
import { apiGet } from '@/lib/api';
import { formatNumber, formatLargeNumber, formatPercent } from '@/lib/utils';
import type { StockDetailResponse, StockNewsResponse, NewsItem } from '@/lib/types';

// 차트 컴포넌트를 동적 임포트 (SSR 비활성화 — 성능 최적화 규칙)
const StockChart = dynamic(() => import('@/components/features/StockChart'), {
  ssr: false,
  loading: () => <Skeleton width="100%" height="320px" />,
});

/**
 * 종목 상세 페이지 (FEAT-2, Agent 1, Skill 1-5 + 1-6 + 1-7)
 *
 * 선택한 종목의 차트, 11개 지표, 뉴스를 표시하는 화면이다.
 * - 종가 라인 차트 + 거래량 바 차트
 * - 11개 지표 테이블
 * - 최신 뉴스 5건
 *
 * 참조: docs/01_PRD.md FEAT-2, docs/03_UserFlow.md 섹션 3
 */
export default function StockDetailPage() {
  // URL에서 종목 코드 가져오기
  const params = useParams();
  const stockCode = params.code as string;

  // 종목 상세 데이터
  const [stockData, setStockData] = useState<StockDetailResponse | null>(null);
  // 뉴스 데이터
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  // 차트 기간 선택
  const [chartPeriod, setChartPeriod] = useState<string>('3m');
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  const [isNewsLoading, setIsNewsLoading] = useState(true);
  // 에러 메시지
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * 종목 상세 데이터를 API에서 가져오는 함수
   */
  const fetchStockDetail = async (period: string) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await apiGet<StockDetailResponse>(
        `/api/stocks/${stockCode}?period=${period}`
      );
      setStockData(data);
    } catch (error) {
      console.error('종목 상세 조회 실패:', error);
      setErrorMessage('종목 데이터를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 종목 뉴스를 API에서 가져오는 함수
   */
  const fetchNews = async () => {
    setIsNewsLoading(true);
    try {
      const data = await apiGet<StockNewsResponse>(`/api/stocks/${stockCode}/news`);
      setNewsData(data.news);
    } catch (error) {
      console.error('뉴스 조회 실패:', error);
    } finally {
      setIsNewsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (stockCode) {
      fetchStockDetail(chartPeriod);
      fetchNews();
    }
  }, [stockCode]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * 차트 기간 변경 핸들러
   */
  const handlePeriodChange = (period: string) => {
    setChartPeriod(period);
    fetchStockDetail(period);
  };

  // 종목 상세 정보 (shorthand)
  const detail = stockData?.detail;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 뒤로 가기 */}
      <Link
        href="/themes"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        돌아가기
      </Link>

      {/* 종목 헤더 */}
      {detail && (
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-text-primary">{detail.name}</h1>
            <Badge variant={detail.type === 'ETF' ? 'default' : 'success'}>
              {detail.type}
            </Badge>
          </div>
          <p className="text-text-secondary font-mono">{detail.code}</p>
          <p className="text-4xl font-bold font-mono text-text-primary mt-2">
            {formatNumber(detail.price)}원
          </p>
        </div>
      )}

      {/* 에러 메시지 */}
      {errorMessage && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm">
          {errorMessage}
        </div>
      )}

      {/* 차트 섹션 */}
      <div className="bg-surface border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-primary">가격 차트</h2>

          {/* 기간 선택 버튼 */}
          <div className="flex gap-1">
            {[
              { key: '1w', label: '1주' },
              { key: '1m', label: '1개월' },
              { key: '3m', label: '3개월' },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => handlePeriodChange(option.key)}
                className={`
                  px-3 py-1.5 text-xs rounded-md transition-colors
                  ${chartPeriod === option.key
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-gray-700'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 차트 */}
        {isLoading ? (
          <Skeleton width="100%" height="320px" />
        ) : (
          stockData && <StockChart history={stockData.history} />
        )}
      </div>

      {/* 11개 지표 테이블 */}
      {detail && (
        <div className="bg-surface border border-border rounded-lg p-5">
          <h2 className="text-xl font-semibold text-text-primary mb-4">상세 지표</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* 거래량 */}
            <div className="space-y-1">
              <p className="text-xs text-text-secondary">거래량</p>
              <p className="font-mono font-medium text-text-primary">
                {formatLargeNumber(detail.trading_volume)}
              </p>
            </div>

            {/* 시가총액 */}
            <div className="space-y-1">
              <p className="text-xs text-text-secondary">시가총액</p>
              <p className="font-mono font-medium text-text-primary">
                {formatLargeNumber(detail.market_cap)}
              </p>
            </div>

            {/* 외국인 거래량 */}
            <div className="space-y-1">
              <p className="text-xs text-text-secondary">외국인 순매수</p>
              <p className={`font-mono font-medium ${detail.foreign_trading >= 0 ? 'text-success' : 'text-danger'}`}>
                {detail.foreign_trading >= 0 ? '+' : ''}{formatLargeNumber(detail.foreign_trading)}
              </p>
            </div>

            {/* 기관 거래량 */}
            <div className="space-y-1">
              <p className="text-xs text-text-secondary">기관 순매수</p>
              <p className={`font-mono font-medium ${detail.institution_trading >= 0 ? 'text-success' : 'text-danger'}`}>
                {detail.institution_trading >= 0 ? '+' : ''}{formatLargeNumber(detail.institution_trading)}
              </p>
            </div>

            {/* 개인 거래량 */}
            <div className="space-y-1">
              <p className="text-xs text-text-secondary">개인 순매수</p>
              <p className={`font-mono font-medium ${detail.individual_trading >= 0 ? 'text-success' : 'text-danger'}`}>
                {detail.individual_trading >= 0 ? '+' : ''}{formatLargeNumber(detail.individual_trading)}
              </p>
            </div>

            {/* PER */}
            <div className="space-y-1">
              <p className="text-xs text-text-secondary">PER</p>
              <p className="font-mono font-medium text-text-primary">
                {detail.per !== null ? detail.per.toFixed(2) : '-'}
              </p>
            </div>

            {/* PBR */}
            <div className="space-y-1">
              <p className="text-xs text-text-secondary">PBR</p>
              <p className="font-mono font-medium text-text-primary">
                {detail.pbr !== null ? detail.pbr.toFixed(2) : '-'}
              </p>
            </div>

            {/* 동일업종 PER */}
            <div className="space-y-1">
              <p className="text-xs text-text-secondary">동일업종 PER</p>
              <p className="font-mono font-medium text-text-primary">
                {detail.industry_per !== null ? detail.industry_per.toFixed(2) : '-'}
              </p>
            </div>

            {/* 배당수익률 */}
            <div className="space-y-1">
              <p className="text-xs text-text-secondary">배당수익률</p>
              <p className="font-mono font-medium text-text-primary">
                {detail.dividend_yield !== null ? formatPercent(detail.dividend_yield) : '-'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 뉴스 섹션 */}
      <div className="bg-surface border border-border rounded-lg p-5">
        <h2 className="text-xl font-semibold text-text-primary mb-4">관련 뉴스</h2>

        {isNewsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <Skeleton width="80%" height="20px" />
                <Skeleton width="60%" height="14px" />
              </div>
            ))}
          </div>
        ) : newsData.length > 0 ? (
          <div className="space-y-4">
            {newsData.map((news, index) => (
              <a
                key={index}
                href={news.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-md hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-text-primary font-medium text-sm leading-snug">
                      {news.title}
                    </p>
                    {news.description && (
                      <p className="text-text-secondary text-xs mt-1 line-clamp-2">
                        {news.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-text-secondary">{news.source}</span>
                      {news.published_at && (
                        <span className="text-xs text-text-secondary">
                          {news.published_at}
                        </span>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-text-secondary flex-shrink-0 mt-0.5" aria-hidden="true" />
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-sm">관련 뉴스가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
