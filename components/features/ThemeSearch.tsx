'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Input from '@/components/ui/Input';

/**
 * ThemeSearch 컴포넌트 Props
 */
interface ThemeSearchProps {
  onSearch: (query: string) => void; // 검색 실행 콜백
  isLoading: boolean;                // 검색 중 여부
}

/**
 * 테마 검색 컴포넌트 (Agent 1, Skill 1-2)
 *
 * 사용자가 테마 이름을 입력하여 검색할 수 있는 입력 폼이다.
 * Enter 키 또는 검색 버튼으로 검색을 실행한다.
 *
 * 참조: docs/03_UserFlow.md 섹션 1.1
 */
export default function ThemeSearch({ onSearch, isLoading }: ThemeSearchProps) {
  // 검색어 입력 상태
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * 폼 제출 핸들러 (Enter 키 또는 버튼 클릭)
   */
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // 공백만 있는 검색어는 무시한다
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      onSearch(trimmedQuery);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      {/* 검색어 입력 필드 */}
      <div className="flex-1">
        <Input
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="테마 이름으로 검색 (예: AI, 2차전지, 반도체)"
          disabled={isLoading}
        />
      </div>

      {/* 검색 버튼 */}
      <button
        type="submit"
        disabled={isLoading || !searchQuery.trim()}
        aria-label="테마 검색"
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-primary/50 focus:outline-none"
      >
        <Search className="w-5 h-5" aria-hidden="true" />
      </button>
    </form>
  );
}
