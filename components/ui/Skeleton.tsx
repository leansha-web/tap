import React from 'react';

/**
 * 스켈레톤 컴포넌트의 Props 타입 정의
 * Design System(docs/05_DesignSystem.md) 섹션 11.2 참조
 */
interface SkeletonProps {
  width?: string;    // 너비 (Tailwind 클래스, 예: "w-3/4")
  height?: string;   // 높이 (Tailwind 클래스, 예: "h-6")
  rounded?: boolean; // 둥근 모서리 여부 (아바타용)
  className?: string; // 추가 CSS 클래스
}

/**
 * 스켈레톤 로딩 컴포넌트
 *
 * 데이터 로딩 중에 콘텐츠의 자리를 차지하는 애니메이션이다.
 * 사용자에게 어떤 형태의 콘텐츠가 로딩 중인지 시각적으로 힌트를 준다.
 *
 * @example
 * // 텍스트 스켈레톤
 * <Skeleton width="w-3/4" height="h-6" />
 *
 * // 짧은 텍스트 스켈레톤
 * <Skeleton width="w-1/2" height="h-4" />
 *
 * // 카드 스켈레톤
 * <Card>
 *   <Skeleton width="w-3/4" height="h-6" className="mb-4" />
 *   <Skeleton width="w-1/2" height="h-4" />
 * </Card>
 */
export default function Skeleton({
  width = 'w-full',
  height = 'h-4',
  rounded = false,
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`
        bg-gray-700 animate-pulse
        ${width} ${height}
        ${rounded ? 'rounded-full' : 'rounded'}
        ${className}
      `}
      aria-hidden="true"
    />
  );
}
