/**
 * TAP 메인 페이지 (랜딩 페이지)
 * 로그인 여부에 따라 /themes 또는 /login으로 리다이렉트한다
 * 현재는 개발 중 상태를 보여주는 임시 페이지이다
 */
export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      {/* 앱 제목 */}
      <h1 className="text-4xl font-bold text-text-primary mb-4">
        TAP
      </h1>

      {/* 앱 설명 */}
      <p className="text-text-secondary text-lg mb-8 text-center max-w-md">
        Theme Analysis Program
        <br />
        테마별 종목 흐름을 한눈에 보여주는 도구
      </p>

      {/* 개발 진행 상태 배지 */}
      <div className="bg-surface border border-border rounded-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          개발 진행 현황
        </h2>
        <ul className="space-y-2 text-text-secondary text-sm">
          <li className="flex items-center gap-2">
            <span className="text-success">✓</span> M0: 프로젝트 초기화
          </li>
          <li className="flex items-center gap-2">
            <span className="text-warning">◦</span> M1: 디자인 시스템 + UI
          </li>
          <li className="flex items-center gap-2">
            <span className="text-text-secondary">◦</span> M2: 인증
          </li>
          <li className="flex items-center gap-2">
            <span className="text-text-secondary">◦</span> M3: 핵심 기능
          </li>
          <li className="flex items-center gap-2">
            <span className="text-text-secondary">◦</span> M4: 배포
          </li>
        </ul>
      </div>
    </div>
  );
}
