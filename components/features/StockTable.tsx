'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import type { Stock, SortConfig } from '@/lib/types';
import { formatLargeNumber, formatNumber } from '@/lib/utils';

/**
 * StockTable 컴포넌트 Props
 */
interface StockTableProps {
  stocks: Stock[];  // 종목 리스트
  title: string;    // 테이블 제목 (예: "대장주 TOP 5", "관련 ETF")
}

/**
 * 정렬 가능한 컬럼 정의
 * 각 컬럼의 키, 표시 이름, 정렬 타입을 정의한다
 */
const SORTABLE_COLUMNS = [
  { key: 'name', label: '종목명', type: 'string' as const },
  { key: 'price', label: '현재가', type: 'number' as const },
  { key: 'trading_volume', label: '거래량', type: 'number' as const },
  { key: 'market_cap', label: '시가총액', type: 'number' as const },
] as const;

/**
 * 종목 데이터 테이블 컴포넌트 (Agent 1, Skill 1-4)
 *
 * 테마에 속한 종목들을 테이블 형태로 표시한다.
 * - 헤더 클릭으로 정렬 (한 컬럼 기준)
 * - Shift + 클릭으로 다중 정렬 추가
 * - 종목명 클릭 시 상세 페이지로 이동
 *
 * 참조: docs/01_PRD.md FEAT-2, docs/03_UserFlow.md 섹션 2
 */
export default function StockTable({ stocks, title }: StockTableProps) {
  // 정렬 설정 목록 (다중 정렬 지원)
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([]);

  /**
   * 헤더 클릭 시 정렬 설정을 변경하는 함수
   * - 일반 클릭: 단일 컬럼 정렬 (기존 정렬 초기화)
   * - Shift + 클릭: 기존 정렬에 컬럼 추가 (다중 정렬)
   */
  const handleHeaderClick = (column: string, event: React.MouseEvent) => {
    setSortConfigs((prevConfigs) => {
      // Shift 키를 누르지 않으면 기존 정렬 초기화
      if (!event.shiftKey) {
        const existingConfig = prevConfigs.find((config) => config.column === column);

        // 같은 컬럼을 다시 클릭하면 방향 토글
        if (existingConfig) {
          const newDirection = existingConfig.direction === 'asc' ? 'desc' : 'asc';
          return [{ column, direction: newDirection }];
        }
        // 새 컬럼이면 내림차순으로 시작
        return [{ column, direction: 'desc' }];
      }

      // Shift + 클릭: 다중 정렬 추가
      const existingIndex = prevConfigs.findIndex((config) => config.column === column);

      if (existingIndex >= 0) {
        // 이미 있는 컬럼이면 방향 토글
        const newConfigs = [...prevConfigs];
        const currentDirection = newConfigs[existingIndex].direction;
        newConfigs[existingIndex] = {
          column,
          direction: currentDirection === 'asc' ? 'desc' : 'asc',
        };
        return newConfigs;
      }

      // 새 컬럼 추가
      return [...prevConfigs, { column, direction: 'desc' }];
    });
  };

  /**
   * 정렬된 종목 리스트를 계산하는 useMemo
   * 정렬 설정이 변경될 때만 재계산한다
   */
  const sortedStocks = useMemo(() => {
    if (sortConfigs.length === 0) {
      return stocks;
    }

    return [...stocks].sort((stockA, stockB) => {
      for (const config of sortConfigs) {
        const valueA = stockA[config.column as keyof Stock];
        const valueB = stockB[config.column as keyof Stock];

        // 문자열 비교
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          const comparison = valueA.localeCompare(valueB, 'ko');
          if (comparison !== 0) {
            return config.direction === 'asc' ? comparison : -comparison;
          }
        }

        // 숫자 비교
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          const comparison = valueA - valueB;
          if (comparison !== 0) {
            return config.direction === 'asc' ? comparison : -comparison;
          }
        }
      }
      return 0;
    });
  }, [stocks, sortConfigs]);

  /**
   * 특정 컬럼의 현재 정렬 상태를 가져오는 함수
   */
  const getSortDirection = (column: string): 'asc' | 'desc' | null => {
    const config = sortConfigs.find((c) => c.column === column);
    return config ? config.direction : null;
  };

  /**
   * 정렬 아이콘을 렌더링하는 함수
   */
  const renderSortIcon = (column: string) => {
    const direction = getSortDirection(column);
    if (direction === 'asc') {
      return <ArrowUp className="w-3 h-3 text-primary" aria-hidden="true" />;
    }
    if (direction === 'desc') {
      return <ArrowDown className="w-3 h-3 text-primary" aria-hidden="true" />;
    }
    return <ArrowUpDown className="w-3 h-3 text-text-secondary opacity-50" aria-hidden="true" />;
  };

  if (stocks.length === 0) {
    return null;
  }

  return (
    <div>
      {/* 테이블 제목 */}
      <h3 className="text-lg font-semibold text-text-primary mb-3">{title}</h3>

      {/* 다중 정렬 안내 */}
      {sortConfigs.length > 0 && (
        <p className="text-xs text-text-secondary mb-2">
          Shift + 클릭으로 다중 정렬 가능
          {sortConfigs.length > 1 && ` (${sortConfigs.length}개 컬럼 정렬 중)`}
        </p>
      )}

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {SORTABLE_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={(e) => handleHeaderClick(col.key, e)}
                  className="px-3 py-3 text-left text-text-secondary font-medium cursor-pointer hover:text-text-primary hover:bg-surface/50 transition-colors select-none"
                  aria-sort={
                    getSortDirection(col.key) === 'asc'
                      ? 'ascending'
                      : getSortDirection(col.key) === 'desc'
                      ? 'descending'
                      : 'none'
                  }
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {renderSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedStocks.map((stockItem) => (
              <tr
                key={stockItem.code}
                className="border-b border-border/50 hover:bg-surface/50 transition-colors"
              >
                {/* 종목명 (링크) */}
                <td className="px-3 py-3">
                  <Link
                    href={`/stocks/${stockItem.code}`}
                    className="text-text-primary hover:text-primary transition-colors font-medium"
                  >
                    {stockItem.name}
                    {stockItem.type === 'ETF' && (
                      <span className="ml-2 inline-block px-1.5 py-0.5 text-xs font-medium rounded bg-gray-600 text-text-secondary">ETF</span>
                    )}
                  </Link>
                </td>

                {/* 현재가 */}
                <td className="px-3 py-3 text-right font-mono text-text-primary">
                  {formatNumber(stockItem.price)}원
                </td>

                {/* 거래량 */}
                <td className="px-3 py-3 text-right font-mono text-text-primary">
                  {formatLargeNumber(stockItem.trading_volume)}
                </td>

                {/* 시가총액 */}
                <td className="px-3 py-3 text-right font-mono text-text-primary">
                  {formatLargeNumber(stockItem.market_cap)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
