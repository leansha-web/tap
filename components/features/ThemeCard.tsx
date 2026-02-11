'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, BarChart3, Plus, Check } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import type { Theme } from '@/lib/types';
import { formatLargeNumber } from '@/lib/utils';

/**
 * ThemeCard 컴포넌트 Props
 */
interface ThemeCardProps {
  theme: Theme;                     // 테마 데이터
  isInBasket: boolean;              // 바구니에 이미 담겨 있는지 여부
  onAddToBasket: (theme: Theme) => void; // 바구니에 추가하는 콜백
}

/**
 * 테마 카드 컴포넌트 (Agent 1, Skill 1-1)
 *
 * 개별 테마 정보를 카드 형태로 표시한다.
 * - 테마 이름, 거래량, 급등주 수를 보여준다
 * - 클릭하면 해당 테마의 종목 목록 페이지로 이동한다
 * - 바구니 담기 버튼으로 테마를 저장할 수 있다
 *
 * 참조: docs/05_DesignSystem.md 섹션 4
 */
export default function ThemeCard({ theme, isInBasket, onAddToBasket }: ThemeCardProps) {
  /**
   * 바구니 담기 버튼 클릭 핸들러
   * 이벤트 전파를 막아 카드 클릭(링크 이동)과 분리한다
   */
  const handleAddToBasket = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isInBasket) {
      onAddToBasket(theme);
    }
  };

  return (
    <Link
      href={`/themes/${theme.code}/stocks`}
      className="block group"
    >
      <div className="bg-surface border border-border rounded-lg p-5 hover:border-primary/50 hover:bg-surface/80 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/50">
        {/* 카드 상단: 테마 이름 + 바구니 버튼 */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
            {theme.name}
          </h3>

          {/* 바구니 담기/담김 버튼 */}
          <button
            onClick={handleAddToBasket}
            disabled={isInBasket}
            aria-label={isInBasket ? '바구니에 담김' : '바구니에 담기'}
            className={`
              p-1.5 rounded-md transition-colors
              ${isInBasket
                ? 'text-success cursor-default'
                : 'text-text-secondary hover:text-primary hover:bg-primary/10'
              }
            `}
          >
            {isInBasket
              ? <Check className="w-5 h-5" aria-hidden="true" />
              : <Plus className="w-5 h-5" aria-hidden="true" />
            }
          </button>
        </div>

        {/* 카드 하단: 지표 표시 */}
        <div className="flex items-center gap-4">
          {/* 거래량 */}
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-text-secondary" aria-hidden="true" />
            <span className="text-sm text-text-secondary">거래량</span>
            <span className="text-sm font-mono font-medium text-text-primary">
              {formatLargeNumber(theme.trading_volume)}
            </span>
          </div>

          {/* 급등주 수 */}
          {theme.surge_stock_count > 0 && (
            <Badge variant="success">
              <TrendingUp className="w-3 h-3 mr-1" aria-hidden="true" />
              급등 {theme.surge_stock_count}종목
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
