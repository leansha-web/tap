/** @type {import('next').NextConfig} */
// Next.js 설정 파일
const nextConfig = {
  // React strict 모드 활성화 (개발 중 잠재적 문제 감지)
  reactStrictMode: true,

  // 환경 변수를 클라이언트에서 사용할 수 있도록 설정
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
};

module.exports = nextConfig;
