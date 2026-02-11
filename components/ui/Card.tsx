import React from 'react';

/**
 * 카드 컴포넌트의 Props 타입 정의
 * Design System(docs/05_DesignSystem.md) 섹션 4.3 참조
 */
interface CardProps {
  children: React.ReactNode;           // 카드 안에 표시할 내용
  onClick?: () => void;                // 클릭 이벤트 (인터랙티브 카드용)
  interactive?: boolean;               // 호버 효과 활성화 여부
  className?: string;                  // 추가 CSS 클래스
  padding?: 'sm' | 'md' | 'lg';       // 내부 패딩 크기
}

/**
 * 패딩 크기별 Tailwind 클래스 매핑
 */
const paddingStyles: Record<string, string> = {
  sm: 'p-3',   // 작은 패딩 (12px)
  md: 'p-4',   // 중간 패딩 (16px)
  lg: 'p-6',   // 큰 패딩 (24px)
};

/**
 * 재사용 가능한 카드 컴포넌트
 *
 * Design System의 카드 스타일(어두운 배경, 테두리, 둥근 모서리)을 적용한다.
 * interactive 옵션을 켜면 호버 시 배경이 밝아지고, 클릭 가능한 스타일이 적용된다.
 *
 * @example
 * // 기본 카드
 * <Card><p>내용</p></Card>
 *
 * // 인터랙티브 카드 (클릭 가능)
 * <Card interactive onClick={handleClick}><p>클릭하세요</p></Card>
 */
export default function Card({
  children,
  onClick,
  interactive = false,
  className = '',
  padding = 'lg',
}: CardProps) {
  return (
    <div
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              // Enter 또는 Space 키로도 클릭 가능 (접근성)
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`
        bg-surface border border-border rounded-lg shadow-lg
        ${paddingStyles[padding]}
        ${interactive ? 'hover:bg-gray-700 cursor-pointer transition-colors duration-300 focus:ring-2 focus:ring-primary/50 focus:outline-none' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
