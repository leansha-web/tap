"""
종목 관련 API 라우터

테마별 종목 목록, 종목 상세 정보 엔드포인트를 제공한다.

참조: docs/08_AgentSkillDesign.md — Skill 2-2
"""
from fastapi import APIRouter, HTTPException, Path, Query
import logging

from api.services.stock_service import fetch_stocks_by_theme, fetch_stock_detail

logger = logging.getLogger(__name__)

# 종목 라우터 인스턴스 생성
router = APIRouter()


@router.get("/themes/{theme_code}/stocks")
async def get_theme_stocks(theme_code: str = Path(..., description="테마 코드 (pykrx 티커)")):
    """
    테마별 종목 목록 API

    선택한 테마의 대장주 5개와 관련 ETF 3개를 반환한다.
    응답 시간 목표: 5초 이내

    Args:
        theme_code: 조회할 테마의 코드

    Returns:
        대장주 5개 + ETF 3개
    """
    try:
        result = await fetch_stocks_by_theme(theme_code)
        return {
            "theme_code": theme_code,
            "stocks": result["stocks"],
            "etfs": result["etfs"],
        }
    except Exception as e:
        logger.error(f"테마별 종목 조회 실패 (theme_code={theme_code}): {e}")
        raise HTTPException(
            status_code=500,
            detail="종목 데이터를 불러오는 데 실패했습니다."
        )


@router.get("/stocks/{code}")
async def get_stock_detail_endpoint(
    code: str = Path(..., description="종목 코드 (예: '005930')"),
    period: str = Query("3m", description="차트 기간: '1d', '1w', '1m', '3m'"),
):
    """
    종목 상세 정보 API

    개별 종목의 상세 지표와 OHLCV 히스토리 데이터를 반환한다.
    응답 시간 목표: 2초 이내

    Args:
        code: 종목 코드 (예: "005930" = 삼성전자)
        period: 차트 기간 (기본값: '3m' = 3개월)

    Returns:
        종목 상세 정보 (11개 지표 + OHLCV 히스토리)
    """
    try:
        result = await fetch_stock_detail(code, period)
        return {
            "code": code,
            "detail": result["detail"],
            "history": result["history"],
        }
    except Exception as e:
        logger.error(f"종목 상세 조회 실패 (code={code}): {e}")
        raise HTTPException(
            status_code=500,
            detail="종목 상세 정보를 불러오는 데 실패했습니다."
        )
