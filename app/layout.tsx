import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import './globals.css';

/**
 * TAP 앱의 메타데이터 설정
 * 브라우저 탭에 표시될 제목과 설명을 정의한다
 */
export const metadata: Metadata = {
  title: 'TAP - Theme Analysis Program',
  description: '테마별 종목을 11개 지표로 다중 정렬·비교하여 대장주를 빠르게 식별하는 웹 서비스',
};

/**
 * 루트 레이아웃 컴포넌트
 * 모든 페이지에 공통으로 적용되는 최상위 레이아웃이다
 * Navbar가 상단에 고정되고, 그 아래에 페이지 콘텐츠가 렌더링된다
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className="min-h-screen bg-background text-text-primary font-body antialiased">
        {/* 상단 고정 네비게이션 바 */}
        <Navbar />

        {/* 페이지 콘텐츠 영역 */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
