import React from 'react';

/**
 * 배지 컴포넌트의 Props 타입 정의
 * Design System(docs/05_DesignSystem.md) 섹션 4.5 참조
 */
interface BadgeProps {
  children: React.ReactNode;           // 배지 안에 표시할 텍스트
  variant?: 'default' | 'success' | 'danger' | 'warning'; // 배지 스타일 종류
}

/**
 * 배지 스타일 변형별 Tailwind 클래스 매핑
 * 투명도 20%의 배경색과 진한 텍스트 색상을 조합한다
 */
const variantStyles: Record<string, string> = {
  default: 'bg-primary/20 text-primary',     // 기본 (파란색)
  success: 'bg-success/20 text-success',     // 성공/상승 (초록색)
  danger: 'bg-danger/20 text-danger',        // 위험/하락 (빨간색)
  warning: 'bg-warning/20 text-warning',     // 경고 (노란색)
};

/**
 * 재사용 가능한 배지 컴포넌트
 *
 * 상태 표시나 카테고리 태그에 사용한다.
 * 주로 상승/하락 표시, ETF/주식 구분 등에 활용된다.
 *
 * @example
 * <Badge variant="success">상승</Badge>
 * <Badge variant="danger">하락</Badge>
 * <Badge variant="default">ETF</Badge>
 */
export default function Badge({
  children,
  variant = 'default',
}: BadgeProps) {
  return (
    <span
      className={`
        ${variantStyles[variant]}
        px-2 py-1 rounded text-xs font-medium
        inline-flex items-center
      `}
    >
      {children}
    </span>
  );
}
