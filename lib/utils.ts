/**
 * 공통 유틸리티 함수 모음
 * 숫자 포맷팅, 날짜 처리 등 앱 전체에서 공통으로 사용하는 함수들
 */

/**
 * 숫자를 한국식 포맷으로 변환하는 함수 (쉼표 구분)
 * @param value - 포맷할 숫자
 * @returns 포맷된 문자열 (예: 1234567 → "1,234,567")
 *
 * 사용 예시:
 * formatNumber(1234567) → "1,234,567"
 * formatNumber(0) → "0"
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('ko-KR');
}

/**
 * 큰 숫자를 축약하여 표시하는 함수 (억/만 단위)
 * @param value - 축약할 숫자
 * @returns 축약된 문자열 (예: 150000000000 → "1,500억")
 *
 * 사용 예시:
 * formatLargeNumber(150000000000) → "1,500억"
 * formatLargeNumber(50000000) → "5,000만"
 * formatLargeNumber(123456) → "123,456"
 */
export function formatLargeNumber(value: number): string {
  // 1억 이상인 경우
  if (value >= 100000000) {
    const billions = value / 100000000;
    return `${formatNumber(Math.round(billions * 10) / 10)}억`;
  }

  // 1만 이상인 경우
  if (value >= 10000) {
    const tenThousands = value / 10000;
    return `${formatNumber(Math.round(tenThousands))}만`;
  }

  // 1만 미만은 그대로 표시
  return formatNumber(value);
}

/**
 * 퍼센트 값을 포맷하는 함수
 * @param value - 퍼센트 값 (예: 2.35)
 * @returns 포맷된 문자열 (예: "+2.35%" 또는 "-1.20%")
 */
export function formatPercent(value: number): string {
  // 양수일 때 + 기호 추가
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * 상대 시간을 계산하는 함수 (예: "2시간 전", "3일 전")
 * @param dateString - ISO 8601 날짜 문자열
 * @returns 상대 시간 문자열
 */
export function getRelativeTime(dateString: string): string {
  // 현재 시간과의 차이를 밀리초로 계산
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();

  // 밀리초를 분, 시간, 일로 변환
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // 1시간 미만이면 분 단위로 표시
  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  // 24시간 미만이면 시간 단위로 표시
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  // 그 외에는 일 단위로 표시
  return `${diffDays}일 전`;
}
