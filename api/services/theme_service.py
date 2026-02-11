"""
테마 수집 서비스 (Agent 2, Skill 2-1)

pykrx를 사용하여 한국 증시 테마 데이터를 수집하고,
거래량 또는 급등주 기준으로 정렬하여 상위 5개를 반환한다.

참조: docs/08_AgentSkillDesign.md — Skill 2-1
"""
import logging
from datetime import datetime, timedelta
from pykrx import stock

logger = logging.getLogger(__name__)


def _get_recent_trading_date() -> str:
    """
    가장 최근 거래일을 가져오는 헬퍼 함수

    주말이나 공휴일일 경우 최근 영업일을 반환한다.
    pykrx가 데이터를 가져올 수 있는 날짜를 보장한다.

    Returns:
        거래일 문자열 (형식: "YYYYMMDD")
    """
    today = datetime.today()
    # 최대 7일 전까지 탐색하여 유효한 거래일 찾기
    for offset in range(7):
        target_date = today - timedelta(days=offset)
        date_str = target_date.strftime("%Y%m%d")
        try:
            # 테마 시장에서 티커 목록을 가져올 수 있는지 확인
            tickers = stock.get_index_ticker_list(date_str, market="테마")
            if tickers is not None and len(tickers) > 0:
                return date_str
        except Exception:
            continue
    # 탐색 실패 시 오늘 날짜 반환
    return today.strftime("%Y%m%d")


async def fetch_themes_by_volume(limit: int = 5) -> list[dict]:
    """
    거래량 기준으로 상위 테마를 조회하는 함수

    pykrx에서 전체 테마 목록을 가져온 뒤,
    각 테마의 총 거래량을 합산하여 상위 N개를 반환한다.

    Args:
        limit: 반환할 테마 수 (기본값: 5)

    Returns:
        거래량 상위 테마 리스트
    """
    logger.info(f"거래량 기준 상위 {limit}개 테마 조회 시작")

    try:
        date_str = _get_recent_trading_date()
        # pykrx에서 전체 테마 티커 목록 가져오기
        theme_tickers = stock.get_index_ticker_list(date_str, market="테마")

        themes = []
        for ticker in theme_tickers:
            try:
                # 테마 이름 가져오기
                theme_name = stock.get_index_ticker_name(ticker)

                # 해당 테마의 OHLCV 데이터 가져오기 (거래량 포함)
                ohlcv = stock.get_index_ohlcv_by_date(date_str, date_str, ticker)

                # 거래량 데이터 추출
                total_volume = 0
                if not ohlcv.empty and "거래량" in ohlcv.columns:
                    total_volume = int(ohlcv["거래량"].iloc[-1])

                themes.append({
                    "id": int(ticker) if ticker.isdigit() else hash(ticker) % 100000,
                    "code": ticker,
                    "name": theme_name,
                    "trading_volume": total_volume,
                    "surge_stock_count": 0,
                    "updated_at": datetime.now().isoformat(),
                })
            except Exception as e:
                logger.warning(f"테마 {ticker} 데이터 수집 실패: {e}")
                continue

        # 거래량 기준 내림차순 정렬 후 상위 N개 반환
        themes.sort(key=lambda x: x["trading_volume"], reverse=True)
        result = themes[:limit]

        logger.info(f"거래량 기준 상위 {limit}개 테마 조회 완료 (총 {len(themes)}개 중)")
        return result

    except Exception as e:
        logger.error(f"테마 거래량 조회 실패: {e}")
        return []


async def fetch_themes_by_surge(limit: int = 5) -> list[dict]:
    """
    급등주 기준으로 상위 테마를 조회하는 함수

    각 테마에 속한 종목 중 전일 대비 상승률이 높은 종목 수를 세어,
    급등주가 많은 순서대로 상위 N개 테마를 반환한다.

    Args:
        limit: 반환할 테마 수 (기본값: 5)

    Returns:
        급등주 많은 상위 테마 리스트
    """
    logger.info(f"급등주 기준 상위 {limit}개 테마 조회 시작")

    try:
        date_str = _get_recent_trading_date()
        theme_tickers = stock.get_index_ticker_list(date_str, market="테마")

        themes = []
        for ticker in theme_tickers:
            try:
                theme_name = stock.get_index_ticker_name(ticker)

                # 테마에 속한 종목 목록 가져오기
                theme_stocks = stock.get_index_portfolio_deposit_file(ticker)

                # 급등주 수 계산 (전일 대비 2% 이상 상승한 종목)
                surge_count = 0
                total_volume = 0

                if theme_stocks is not None and len(theme_stocks) > 0:
                    for stock_code in theme_stocks:
                        try:
                            ohlcv = stock.get_market_ohlcv_by_date(date_str, date_str, stock_code)
                            if not ohlcv.empty:
                                if "등락률" in ohlcv.columns:
                                    change_rate = float(ohlcv["등락률"].iloc[-1])
                                    if change_rate >= 2.0:
                                        surge_count += 1
                                if "거래량" in ohlcv.columns:
                                    total_volume += int(ohlcv["거래량"].iloc[-1])
                        except Exception:
                            continue

                themes.append({
                    "id": int(ticker) if ticker.isdigit() else hash(ticker) % 100000,
                    "code": ticker,
                    "name": theme_name,
                    "trading_volume": total_volume,
                    "surge_stock_count": surge_count,
                    "updated_at": datetime.now().isoformat(),
                })
            except Exception as e:
                logger.warning(f"테마 {ticker} 급등주 계산 실패: {e}")
                continue

        # 급등주 수 기준 내림차순 정렬 후 상위 N개 반환
        themes.sort(key=lambda x: x["surge_stock_count"], reverse=True)
        result = themes[:limit]

        logger.info(f"급등주 기준 상위 {limit}개 테마 조회 완료 (총 {len(themes)}개 중)")
        return result

    except Exception as e:
        logger.error(f"테마 급등주 조회 실패: {e}")
        return []


async def search_themes(query: str) -> list[dict]:
    """
    테마 이름으로 검색하는 함수

    사용자가 입력한 키워드로 테마를 검색하여 일치하는 테마 목록을 반환한다.

    Args:
        query: 검색할 테마 이름 키워드

    Returns:
        검색 결과 테마 리스트
    """
    logger.info(f"테마 검색 요청: '{query}'")

    try:
        date_str = _get_recent_trading_date()
        theme_tickers = stock.get_index_ticker_list(date_str, market="테마")

        results = []
        for ticker in theme_tickers:
            try:
                theme_name = stock.get_index_ticker_name(ticker)

                # 검색 키워드가 테마 이름에 포함되어 있는지 확인 (대소문자 무시)
                if query.lower() in theme_name.lower():
                    results.append({
                        "id": int(ticker) if ticker.isdigit() else hash(ticker) % 100000,
                        "code": ticker,
                        "name": theme_name,
                        "trading_volume": 0,
                        "surge_stock_count": 0,
                        "updated_at": datetime.now().isoformat(),
                    })
            except Exception:
                continue

        logger.info(f"테마 검색 완료: '{query}' → {len(results)}건")
        return results

    except Exception as e:
        logger.error(f"테마 검색 실패: {e}")
        return []
