import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS 설정 파일
 * Design System 문서(docs/05_DesignSystem.md)의 색상, 폰트, 간격을 반영한다
 */
const config: Config = {
  // Tailwind가 스캔할 파일 경로 (이 경로의 클래스만 빌드에 포함)
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  // 다크 모드를 CSS 클래스 기반으로 제어 (class="dark")
  darkMode: 'class',

  theme: {
    extend: {
      // 역할 기반 색상 팔레트 (다크 모드 기준)
      colors: {
        primary: '#3B82F6',       // 주요 버튼, 링크, 강조
        secondary: '#8B5CF6',     // 보조 액션, 부가 기능
        surface: '#1F2937',       // 카드, 패널 배경
        background: '#111827',    // 전체 배경
        'text-primary': '#F9FAFB',   // 주요 텍스트
        'text-secondary': '#9CA3AF', // 보조 텍스트, 설명
        border: '#374151',        // 테두리, 구분선
        success: '#10B981',       // 상승, 성공 메시지
        danger: '#EF4444',        // 하락, 에러 메시지
        warning: '#F59E0B',       // 주의, 경고
        info: '#3B82F6',          // 정보 메시지
        // 차트 전용 색상
        'chart-up': '#10B981',    // 양봉 (상승)
        'chart-down': '#EF4444',  // 음봉 (하락)
        'chart-volume': '#3B82F6', // 거래량
        'chart-ma': '#F59E0B',    // 이동평균선
      },

      // 폰트 패밀리
      fontFamily: {
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
        heading: ['Inter', 'sans-serif'],
      },
    },
  },

  plugins: [],
};

export default config;
