"""
뉴스 관련 API 라우터

종목별 최신 뉴스를 제공하는 엔드포인트를 정의한다.

참조: docs/08_AgentSkillDesign.md — Skill 2-3
"""
from fastapi import APIRouter, HTTPException, Path
import logging
from datetime import datetime, timedelta

from pykrx import stock as pykrx_stock
from services.news_service import fetch_stock_news

logger = logging.getLogger(__name__)

# 뉴스 라우터 인스턴스 생성
router = APIRouter()


def _get_stock_name(code: str) -> str:
    """
    종목 코드로 종목명을 가져오는 헬퍼 함수

    pykrx의 get_market_ticker_name이 장 외 시간에 실패할 수 있으므로
    OHLCV 데이터에서 종목명을 추출하는 대체 방법을 사용한다.

    Args:
        code: 종목 코드 (예: "005930")

    Returns:
        종목명 (예: "삼성전자"), 실패 시 종목 코드 그대로 반환
    """
    # 1순위: 직접 조회
    try:
        name = pykrx_stock.get_market_ticker_name(code)
        # DataFrame이 반환되는 경우(장 외 시간 버그)를 처리
        if isinstance(name, str) and name:
            return name
    except Exception:
        pass

    # 2순위: 최근 거래일에서 종목명 찾기
    try:
        today = datetime.today()
        for offset in range(7):
            target_date = today - timedelta(days=offset)
            date_str = target_date.strftime("%Y%m%d")
            try:
                # OHLCV 조회로 해당 종목이 존재하는지 확인
                ohlcv = pykrx_stock.get_market_ohlcv_by_date(date_str, date_str, code)
                if not ohlcv.empty:
                    # 티커 이름 재시도
                    name = pykrx_stock.get_market_ticker_name(code)
                    if isinstance(name, str) and name:
                        return name
            except Exception:
                continue
    except Exception:
        pass

    # 3순위: 종목 코드 그대로 반환 (검색에 사용 가능)
    logger.warning(f"종목명 조회 실패, 코드로 대체: {code}")
    return code


@router.get("/stocks/{code}/news")
async def get_stock_news(code: str = Path(..., description="종목 코드 (예: '005930')")):
    """
    종목 뉴스 API

    지정한 종목의 최신 뉴스 5건을 반환한다.
    1순위: Naver 검색 API, 2순위: Google News RSS
    응답 시간 목표: 3초 이내

    Args:
        code: 종목 코드 (예: "005930" = 삼성전자)

    Returns:
        뉴스 5건 리스트 (제목, 링크, 설명, 발행일, 출처)
    """
    try:
        # 종목 코드로 종목명 가져오기 (뉴스 검색에 사용)
        stock_name = _get_stock_name(code)

        # 종목명으로 뉴스 검색
        news = await fetch_stock_news(stock_name, limit=5)

        return {
            "code": code,
            "stock_name": stock_name,
            "news": news,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"종목 뉴스 조회 실패 (code={code}): {e}")
        raise HTTPException(
            status_code=500,
            detail="뉴스 데이터를 불러오는 데 실패했습니다."
        )
