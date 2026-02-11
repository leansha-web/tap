/**
 * FastAPI 서버와 통신하기 위한 유틸리티 함수 모음
 * 모든 API 호출은 이 파일의 함수를 통해 이루어진다
 */

// FastAPI 서버 기본 URL (환경 변수에서 가져옴)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * API 응답의 에러 형식
 * FastAPI에서 반환하는 표준 에러 구조
 */
interface ApiError {
  error: {
    code: string;     // 에러 코드 (예: "THEME_NOT_FOUND")
    message: string;  // 사용자에게 보여줄 메시지
    details: string;  // 디버깅용 상세 정보
  };
}

/**
 * FastAPI 서버에 GET 요청을 보내는 함수
 * @param endpoint - API 경로 (예: "/api/themes?sort=volume")
 * @returns API 응답 데이터
 * @throws 네트워크 오류 또는 서버 에러 시 예외 발생
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  try {
    // FastAPI 서버에 GET 요청
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 응답 상태가 실패인 경우 에러 처리
    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.error?.message || '서버 요청에 실패했습니다.');
    }

    // JSON으로 변환하여 반환
    return await response.json();
  } catch (error) {
    // 콘솔에 에러 기록 (디버깅용)
    console.error(`API GET ${endpoint} 실패:`, error);
    throw error;
  }
}

/**
 * FastAPI 서버에 POST 요청을 보내는 함수
 * @param endpoint - API 경로 (예: "/api/reports")
 * @param body - 요청 본문 데이터
 * @returns API 응답 데이터
 */
export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  try {
    // FastAPI 서버에 POST 요청
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // 응답 상태가 실패인 경우 에러 처리
    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.error?.message || '서버 요청에 실패했습니다.');
    }

    // JSON으로 변환하여 반환
    return await response.json();
  } catch (error) {
    // 콘솔에 에러 기록 (디버깅용)
    console.error(`API POST ${endpoint} 실패:`, error);
    throw error;
  }
}
