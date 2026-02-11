"""
글로벌 에러 핸들러 (Agent 2, Skill 2-5)

모든 API 엔드포인트의 에러를 일관된 JSON 형식으로 처리한다.
예상치 못한 에러도 사용자 친화적 메시지로 변환하여 반환한다.
"""
import logging
from fastapi import Request
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    전역 예외 처리 핸들러

    FastAPI에서 처리되지 않은 모든 예외를 잡아서
    표준 에러 JSON 형식으로 변환하여 반환한다.

    Args:
        request: HTTP 요청 객체
        exc: 발생한 예외

    Returns:
        표준 에러 형식의 JSON 응답

    에러 응답 형식:
        {
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "서버에서 오류가 발생했습니다.",
                "details": "디버깅용 상세 정보"
            }
        }
    """
    # 에러 로그 기록 (디버깅용)
    logger.error(
        f"처리되지 않은 에러 발생 - "
        f"경로: {request.url.path}, "
        f"메서드: {request.method}, "
        f"에러: {str(exc)}"
    )

    # 표준 에러 응답 반환
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
                "details": str(exc),
            }
        },
    )


def create_error_response(code: str, message: str, details: str = "") -> dict:
    """
    표준 에러 응답 딕셔너리를 생성하는 헬퍼 함수

    라우터에서 직접 에러 응답을 만들 때 사용한다.

    Args:
        code: 에러 코드 (예: "THEME_NOT_FOUND")
        message: 사용자에게 보여줄 에러 메시지
        details: 디버깅용 상세 정보 (선택)

    Returns:
        표준 에러 형식 딕셔너리
    """
    return {
        "error": {
            "code": code,
            "message": message,
            "details": details,
        }
    }
