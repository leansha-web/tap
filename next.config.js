/** @type {import('next').NextConfig} */
// Next.js 설정 파일
const nextConfig = {
  // React strict 모드 활성화 (개발 중 잠재적 문제 감지)
  reactStrictMode: true,

  // Railway 배포 시 standalone 모드로 빌드하여 번들 크기를 줄인다
  output: 'standalone',

  // 환경 변수를 클라이언트에서 사용할 수 있도록 설정
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
};

module.exports = nextConfig;
