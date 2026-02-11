'use client';

import React from 'react';

/**
 * 버튼 컴포넌트의 Props 타입 정의
 * Design System(docs/05_DesignSystem.md) 섹션 4.1 참조
 */
interface ButtonProps {
  children: React.ReactNode;          // 버튼 안에 표시할 내용
  onClick?: () => void;               // 클릭 이벤트 핸들러
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; // 버튼 스타일 종류
  size?: 'sm' | 'md' | 'lg';         // 버튼 크기
  disabled?: boolean;                  // 비활성화 여부
  loading?: boolean;                   // 로딩 상태 여부
  type?: 'button' | 'submit';         // HTML 버튼 타입
  fullWidth?: boolean;                 // 전체 너비 사용 여부
  ariaLabel?: string;                  // 접근성 라벨 (아이콘 버튼에 필수)
}

/**
 * 버튼 스타일 변형별 Tailwind 클래스 매핑
 * 각 변형(variant)에 대한 기본, 호버, 포커스 스타일을 정의한다
 */
const variantStyles: Record<string, string> = {
  // 주요 액션 버튼 (파란색 배경)
  primary:
    'bg-primary text-white hover:bg-blue-600 focus:ring-primary/50',
  // 보조 액션 버튼 (테두리만)
  secondary:
    'bg-surface text-text-primary border border-border hover:bg-gray-700 focus:ring-border',
  // 위험한 액션 버튼 (빨간색 배경)
  danger:
    'bg-danger text-white hover:bg-red-600 focus:ring-danger/50',
  // 투명 배경 버튼 (텍스트만)
  ghost:
    'text-primary hover:bg-primary/10 focus:ring-primary/50',
};

/**
 * 버튼 크기별 Tailwind 클래스 매핑
 */
const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',   // 작은 버튼
  md: 'px-4 py-2 text-base',   // 기본 크기 버튼
  lg: 'px-6 py-3 text-lg',     // 큰 버튼
};

/**
 * 재사용 가능한 버튼 컴포넌트
 *
 * Design System의 4가지 변형(primary, secondary, danger, ghost)을 지원하며,
 * 로딩 상태, 비활성화 상태, 접근성(포커스 링, aria-label)을 모두 처리한다.
 *
 * @example
 * <Button variant="primary" onClick={handleClick}>확인</Button>
 * <Button variant="danger" loading={true}>삭제 중...</Button>
 */
export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  fullWidth = false,
  ariaLabel,
}: ButtonProps) {
  // 버튼이 비활성화 또는 로딩 중이면 클릭 불가
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        rounded-md font-medium
        focus:outline-none focus:ring-2
        transition duration-150
        inline-flex items-center justify-center gap-2
      `}
    >
      {/* 로딩 중일 때 스피너 표시 */}
      {loading && (
        <div
          className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
