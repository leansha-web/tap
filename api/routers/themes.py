"""
테마 관련 API 라우터

테마 추천(거래량/급등주 기준)과 테마 검색 엔드포인트를 제공한다.

참조: docs/08_AgentSkillDesign.md — Skill 2-1
"""
from fastapi import APIRouter, HTTPException, Query
import logging

from api.services.theme_service import (
    fetch_themes_by_volume,
    fetch_themes_by_surge,
    search_themes as search_themes_service,
)

logger = logging.getLogger(__name__)

# 테마 라우터 인스턴스 생성
router = APIRouter()


@router.get("/themes")
async def get_themes(sort: str = Query("volume", description="정렬 기준: 'volume'(거래량) 또는 'surge'(급등주)")):
    """
    테마 추천 API

    거래량 또는 급등주 기준으로 상위 5개 테마를 반환한다.
    응답 시간 목표: 3초 이내

    Args:
        sort: 정렬 기준 ('volume' = 거래량, 'surge' = 급등주)

    Returns:
        상위 5개 테마 리스트
    """
    try:
        if sort == "surge":
            themes = await fetch_themes_by_surge(limit=5)
        else:
            themes = await fetch_themes_by_volume(limit=5)

        return {"themes": themes, "sort": sort}

    except Exception as e:
        logger.error(f"테마 조회 실패: {e}")
        raise HTTPException(
            status_code=500,
            detail="테마 데이터를 불러오는 데 실패했습니다."
        )


@router.get("/themes/search")
async def search_themes(q: str = Query(..., description="검색할 테마 이름")):
    """
    테마 검색 API

    사용자가 입력한 키워드로 테마를 검색한다.
    응답 시간 목표: 2초 이내

    Args:
        q: 검색 키워드 (테마명)

    Returns:
        검색 결과 테마 리스트
    """
    try:
        themes = await search_themes_service(q)
        return {"themes": themes, "query": q}
    except Exception as e:
        logger.error(f"테마 검색 실패: {e}")
        raise HTTPException(
            status_code=500,
            detail="테마 검색에 실패했습니다."
        )
