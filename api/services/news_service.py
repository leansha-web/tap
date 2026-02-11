"""
뉴스 수집 서비스 (Agent 2, Skill 2-3)

종목별 최신 뉴스를 Naver 검색 API 또는 Google News RSS에서 수집한다.
1순위: Naver 검색 API, 2순위: Google News RSS (대체)

참조: docs/08_AgentSkillDesign.md — Skill 2-3
"""
import os
import logging
import re
from datetime import datetime

import httpx
import feedparser

logger = logging.getLogger(__name__)

# Naver API 인증 정보 (환경 변수에서 로드)
NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID", "")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET", "")


def _strip_html_tags(text: str) -> str:
    """
    HTML 태그를 제거하는 헬퍼 함수

    Naver API 응답에 포함된 <b>, </b> 등의 HTML 태그를 제거한다.

    Args:
        text: HTML 태그가 포함된 문자열

    Returns:
        태그가 제거된 순수 텍스트
    """
    return re.sub(r'<[^>]+>', '', text)


async def fetch_news_from_naver(stock_name: str, limit: int = 5) -> list[dict]:
    """
    Naver 검색 API에서 종목 관련 뉴스를 가져오는 함수

    Naver 뉴스 검색 API를 호출하여 종목명으로 검색한 뉴스를 반환한다.

    Args:
        stock_name: 종목 이름 (예: "삼성전자")
        limit: 최대 뉴스 수 (기본값: 5)

    Returns:
        뉴스 리스트 [{title, link, description, published_at, source}]
    """
    # Naver API 키가 설정되지 않은 경우 빈 리스트 반환
    if not NAVER_CLIENT_ID or not NAVER_CLIENT_SECRET:
        logger.warning("Naver API 키가 설정되지 않았습니다. Google News로 대체합니다.")
        return []

    logger.info(f"Naver 뉴스 검색 요청: '{stock_name}' (최대 {limit}건)")

    try:
        # Naver 검색 API 호출
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                "https://openapi.naver.com/v1/search/news.json",
                headers={
                    "X-Naver-Client-Id": NAVER_CLIENT_ID,
                    "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
                },
                params={
                    "query": stock_name,
                    "display": limit,
                    "sort": "date",  # 최신순 정렬
                },
            )

            # 응답 상태 확인
            if response.status_code != 200:
                logger.error(f"Naver API 응답 에러: {response.status_code}")
                return []

            data = response.json()
            items = data.get("items", [])

            # 뉴스 데이터 가공
            news_list = []
            for item in items[:limit]:
                news_list.append({
                    "title": _strip_html_tags(item.get("title", "")),
                    "link": item.get("originallink", item.get("link", "")),
                    "description": _strip_html_tags(item.get("description", "")),
                    "published_at": item.get("pubDate", ""),
                    "source": "Naver",
                })

            logger.info(f"Naver 뉴스 {len(news_list)}건 조회 완료")
            return news_list

    except httpx.TimeoutException:
        logger.warning(f"Naver 뉴스 API 타임아웃: '{stock_name}'")
        return []
    except Exception as e:
        logger.error(f"Naver 뉴스 API 호출 실패: {e}")
        return []


async def fetch_news_from_google(stock_name: str, limit: int = 5) -> list[dict]:
    """
    Google News RSS에서 종목 관련 뉴스를 가져오는 대체 함수

    Naver API가 실패했을 때 Google News RSS를 파싱하여 뉴스를 가져온다.

    Args:
        stock_name: 종목 이름 (예: "삼성전자")
        limit: 최대 뉴스 수 (기본값: 5)

    Returns:
        뉴스 리스트 [{title, link, description, published_at, source}]
    """
    logger.info(f"Google News 대체 검색 요청: '{stock_name}' (최대 {limit}건)")

    try:
        # Google News RSS 피드 URL 생성
        feed_url = f"https://news.google.com/rss/search?q={stock_name}&hl=ko&gl=KR&ceid=KR:ko"

        # feedparser로 RSS 피드 파싱
        feed = feedparser.parse(feed_url)

        news_list = []
        for entry in feed.entries[:limit]:
            news_list.append({
                "title": entry.get("title", ""),
                "link": entry.get("link", ""),
                "description": entry.get("summary", ""),
                "published_at": entry.get("published", ""),
                "source": "Google News",
            })

        logger.info(f"Google News {len(news_list)}건 조회 완료")
        return news_list

    except Exception as e:
        logger.error(f"Google News RSS 파싱 실패: {e}")
        return []


async def fetch_stock_news(stock_name: str, limit: int = 5) -> list[dict]:
    """
    종목 뉴스를 가져오는 메인 함수 (Naver 우선, Google 대체)

    먼저 Naver API를 시도하고, 실패하면 Google News RSS로 대체한다.

    Args:
        stock_name: 종목 이름 (예: "삼성전자")
        limit: 최대 뉴스 수 (기본값: 5)

    Returns:
        뉴스 리스트 (최대 limit건)
    """
    try:
        # 1순위: Naver 검색 API
        news = await fetch_news_from_naver(stock_name, limit)
        if news:
            return news
    except Exception as e:
        logger.warning(f"Naver 뉴스 API 실패, Google News로 대체: {e}")

    try:
        # 2순위: Google News RSS (대체)
        return await fetch_news_from_google(stock_name, limit)
    except Exception as e:
        logger.error(f"Google News 대체도 실패: {e}")
        return []
