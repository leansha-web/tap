import React from 'react';

/**
 * 스피너 컴포넌트의 Props 타입 정의
 * Design System(docs/05_DesignSystem.md) 섹션 11.1 참조
 */
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';   // 스피너 크기
  color?: string;                // 스피너 색상 (Tailwind 클래스)
}

/**
 * 스피너 크기별 Tailwind 클래스 매핑
 */
const sizeStyles: Record<string, string> = {
  sm: 'h-4 w-4',   // 작은 스피너 (버튼 내부용)
  md: 'h-8 w-8',   // 기본 스피너
  lg: 'h-12 w-12', // 큰 스피너 (전체 화면 로딩용)
};

/**
 * 로딩 스피너 컴포넌트
 *
 * 데이터를 불러오는 동안 표시하는 회전 애니메이션이다.
 * 버튼 내부, 카드 내부, 전체 화면 등 다양한 크기로 사용 가능하다.
 *
 * @example
 * <Spinner />                    // 기본 크기
 * <Spinner size="lg" />          // 큰 크기 (전체 화면 로딩)
 * <Spinner size="sm" />          // 작은 크기 (버튼 내부)
 */
export default function Spinner({
  size = 'md',
  color = 'border-primary',
}: SpinnerProps) {
  return (
    <div
      className={`
        animate-spin rounded-full
        ${sizeStyles[size]}
        border-b-2 ${color}
      `}
      role="status"
      aria-label="로딩 중"
    >
      {/* 스크린 리더 전용 텍스트 */}
      <span className="sr-only">로딩 중...</span>
    </div>
  );
}
