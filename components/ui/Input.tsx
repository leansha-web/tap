'use client';

import React from 'react';

/**
 * 입력 필드 컴포넌트의 Props 타입 정의
 * Design System(docs/05_DesignSystem.md) 섹션 4.2 참조
 */
interface InputProps {
  value: string;                       // 입력 값
  onChange: (value: string) => void;   // 값 변경 핸들러
  placeholder?: string;                // 플레이스홀더 텍스트
  type?: 'text' | 'email' | 'password' | 'number'; // 입력 타입
  disabled?: boolean;                  // 비활성화 여부
  error?: string;                      // 에러 메시지 (있으면 에러 스타일 적용)
  label?: string;                      // 라벨 텍스트
  ariaLabel?: string;                  // 접근성 라벨
  fullWidth?: boolean;                 // 전체 너비 사용 여부
}

/**
 * 재사용 가능한 입력 필드 컴포넌트
 *
 * Design System의 입력 필드 스타일(기본, 포커스, 에러, 비활성화)을 적용하며,
 * 라벨과 에러 메시지 표시를 지원한다.
 *
 * @example
 * <Input value={name} onChange={setName} placeholder="테마 검색..." />
 * <Input value={email} onChange={setEmail} error="올바른 이메일을 입력하세요" />
 */
export default function Input({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  disabled = false,
  error,
  label,
  ariaLabel,
  fullWidth = true,
}: InputProps) {
  // 에러 상태에 따라 테두리 색상 변경
  const borderStyle = error
    ? 'border-danger focus:ring-danger/20'   // 에러 상태: 빨간 테두리
    : 'border-border focus:border-primary focus:ring-primary/20'; // 기본 상태

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {/* 라벨 (있을 때만 표시) */}
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1">
          {label}
        </label>
      )}

      {/* 입력 필드 */}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={ariaLabel || label}
        aria-invalid={!!error}
        className={`
          bg-surface ${borderStyle} border
          text-text-primary px-3 py-2 rounded-md
          focus:outline-none focus:ring-2
          ${fullWidth ? 'w-full' : ''}
          ${disabled ? 'bg-gray-800 cursor-not-allowed opacity-50' : ''}
          placeholder:text-text-secondary/50
          transition duration-150
        `}
      />

      {/* 에러 메시지 (있을 때만 표시) */}
      {error && (
        <p className="text-danger text-sm mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
