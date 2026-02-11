"""
종목 수집 서비스 (Agent 2, Skill 2-2)

pykrx를 사용하여 테마별 종목 데이터를 수집하고,
11개 상세 지표를 포함하여 반환한다.

참조: docs/08_AgentSkillDesign.md — Skill 2-2
"""
import logging
from datetime import datetime, timedelta
from pykrx import stock

logger = logging.getLogger(__name__)


def _get_recent_trading_date() -> str:
    """
    가장 최근 거래일을 가져오는 헬퍼 함수

    Returns:
        거래일 문자열 (형식: "YYYYMMDD")
    """
    today = datetime.today()
    for offset in range(7):
        target_date = today - timedelta(days=offset)
        date_str = target_date.strftime("%Y%m%d")
        try:
            tickers = stock.get_market_ohlcv_by_date(date_str, date_str, "005930")
            if not tickers.empty:
                return date_str
        except Exception:
            continue
    return today.strftime("%Y%m%d")


async def fetch_stocks_by_theme(theme_code: str, stock_limit: int = 5, etf_limit: int = 3) -> dict:
    """
    테마별 대장주와 ETF를 조회하는 함수

    지정한 테마에 속한 종목 중 거래량 상위 5개(대장주)와
    관련 ETF 상위 3개를 반환한다.

    Args:
        theme_code: 테마 코드 (pykrx 티커)
        stock_limit: 대장주 수 (기본값: 5)
        etf_limit: ETF 수 (기본값: 3)

    Returns:
        {"stocks": [...], "etfs": [...]}
    """
    logger.info(f"테마 {theme_code}의 종목 조회 시작 (대장주 {stock_limit}개, ETF {etf_limit}개)")

    try:
        date_str = _get_recent_trading_date()

        # 테마에 속한 종목 코드 리스트 가져오기
        theme_stock_codes = stock.get_index_portfolio_deposit_file(theme_code)

        if theme_stock_codes is None or len(theme_stock_codes) == 0:
            logger.warning(f"테마 {theme_code}에 속한 종목이 없습니다.")
            return {"stocks": [], "etfs": []}

        all_stocks = []
        for stock_code in theme_stock_codes:
            try:
                stock_info = _fetch_single_stock_info(stock_code, date_str)
                if stock_info:
                    all_stocks.append(stock_info)
            except Exception as e:
                logger.warning(f"종목 {stock_code} 데이터 수집 실패: {e}")
                continue

        # 거래량 기준 내림차순 정렬
        all_stocks.sort(key=lambda x: x.get("trading_volume", 0), reverse=True)

        # 일반 종목과 ETF 분리
        regular_stocks = [s for s in all_stocks if s.get("type") == "stock"]
        etf_stocks = [s for s in all_stocks if s.get("type") == "ETF"]

        result = {
            "stocks": regular_stocks[:stock_limit],
            "etfs": etf_stocks[:etf_limit],
        }

        logger.info(
            f"테마 {theme_code} 종목 조회 완료: "
            f"대장주 {len(result['stocks'])}개, ETF {len(result['etfs'])}개"
        )
        return result

    except Exception as e:
        logger.error(f"테마별 종목 조회 실패: {e}")
        return {"stocks": [], "etfs": []}


def _fetch_single_stock_info(stock_code: str, date_str: str) -> dict | None:
    """
    개별 종목의 기본 정보를 가져오는 내부 함수

    Args:
        stock_code: 종목 코드
        date_str: 기준 날짜 (YYYYMMDD)

    Returns:
        종목 정보 딕셔너리 또는 None
    """
    try:
        # 종목명 가져오기
        stock_name = stock.get_market_ticker_name(stock_code)

        # OHLCV 데이터 가져오기
        ohlcv = stock.get_market_ohlcv_by_date(date_str, date_str, stock_code)
        if ohlcv.empty:
            return None

        # 기본 시세 정보 추출
        price = int(ohlcv["종가"].iloc[-1]) if "종가" in ohlcv.columns else 0
        volume = int(ohlcv["거래량"].iloc[-1]) if "거래량" in ohlcv.columns else 0

        # 시가총액 가져오기
        market_cap_data = stock.get_market_cap_by_date(date_str, date_str, stock_code)
        market_cap = 0
        if not market_cap_data.empty and "시가총액" in market_cap_data.columns:
            market_cap = int(market_cap_data["시가총액"].iloc[-1])

        # ETF 여부 판별 (종목명에 ETF 또는 ETN 포함 여부)
        stock_type = "ETF" if ("ETF" in stock_name or "ETN" in stock_name) else "stock"

        return {
            "code": stock_code,
            "name": stock_name,
            "price": price,
            "trading_volume": volume,
            "market_cap": market_cap,
            "type": stock_type,
            "updated_at": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.warning(f"종목 {stock_code} 기본 정보 수집 실패: {e}")
        return None


async def fetch_stock_detail(stock_code: str, period: str = "3m") -> dict:
    """
    개별 종목의 상세 정보를 조회하는 함수

    종목의 11개 지표와 차트에 필요한 OHLCV 히스토리 데이터를 반환한다.

    Args:
        stock_code: 종목 코드 (예: "005930")
        period: 차트 기간 ('1d', '1w', '1m', '3m')

    Returns:
        {"detail": {...}, "history": [...]}
    """
    logger.info(f"종목 {stock_code} 상세 정보 조회 시작 (기간: {period})")

    try:
        date_str = _get_recent_trading_date()

        # 종목명 가져오기
        stock_name = stock.get_market_ticker_name(stock_code)

        # 기간에 따른 시작일 계산
        end_date = datetime.strptime(date_str, "%Y%m%d")
        period_map = {
            "1d": 1,
            "1w": 7,
            "1m": 30,
            "3m": 90,
        }
        days_back = period_map.get(period, 90)
        start_date = end_date - timedelta(days=days_back)
        start_str = start_date.strftime("%Y%m%d")

        # OHLCV 히스토리 가져오기 (차트용)
        ohlcv_history = stock.get_market_ohlcv_by_date(start_str, date_str, stock_code)

        history = []
        if not ohlcv_history.empty:
            for idx, row in ohlcv_history.iterrows():
                history.append({
                    "date": idx.strftime("%Y-%m-%d"),
                    "open": int(row.get("시가", 0)),
                    "high": int(row.get("고가", 0)),
                    "low": int(row.get("저가", 0)),
                    "close": int(row.get("종가", 0)),
                    "volume": int(row.get("거래량", 0)),
                })

        # 현재 시세 (최신 데이터)
        current_price = history[-1]["close"] if history else 0
        current_volume = history[-1]["volume"] if history else 0

        # 시가총액
        market_cap_data = stock.get_market_cap_by_date(date_str, date_str, stock_code)
        market_cap = 0
        if not market_cap_data.empty and "시가총액" in market_cap_data.columns:
            market_cap = int(market_cap_data["시가총액"].iloc[-1])

        # 투자자별 거래량 (외국인, 기관, 개인)
        foreign_trading = 0
        institution_trading = 0
        individual_trading = 0

        try:
            investor_data = stock.get_market_trading_volume_by_investor(date_str, date_str, stock_code)
            if not investor_data.empty:
                if "외국인" in investor_data.index:
                    foreign_trading = int(investor_data.loc["외국인", "순매수"] if "순매수" in investor_data.columns else 0)
                if "기관합계" in investor_data.index:
                    institution_trading = int(investor_data.loc["기관합계", "순매수"] if "순매수" in investor_data.columns else 0)
                if "개인" in investor_data.index:
                    individual_trading = int(investor_data.loc["개인", "순매수"] if "순매수" in investor_data.columns else 0)
        except Exception as e:
            logger.warning(f"종목 {stock_code} 투자자별 거래량 조회 실패: {e}")

        # 기본적 지표 (PER, PBR, 배당수익률)
        per = None
        pbr = None
        dividend_yield = None

        try:
            fundamental = stock.get_market_fundamental_by_date(date_str, date_str, stock_code)
            if not fundamental.empty:
                if "PER" in fundamental.columns:
                    per_val = float(fundamental["PER"].iloc[-1])
                    per = per_val if per_val != 0 else None
                if "PBR" in fundamental.columns:
                    pbr_val = float(fundamental["PBR"].iloc[-1])
                    pbr = pbr_val if pbr_val != 0 else None
                if "DIV" in fundamental.columns:
                    div_val = float(fundamental["DIV"].iloc[-1])
                    dividend_yield = div_val if div_val != 0 else None
        except Exception as e:
            logger.warning(f"종목 {stock_code} 펀더멘탈 조회 실패: {e}")

        # ETF 여부 판별
        stock_type = "ETF" if ("ETF" in stock_name or "ETN" in stock_name) else "stock"

        detail = {
            "code": stock_code,
            "name": stock_name,
            "price": current_price,
            "trading_volume": current_volume,
            "market_cap": market_cap,
            "type": stock_type,
            "foreign_trading": foreign_trading,
            "institution_trading": institution_trading,
            "individual_trading": individual_trading,
            "per": per,
            "pbr": pbr,
            "industry_per": None,  # 동일업종 PER은 별도 API 필요
            "dividend_yield": dividend_yield,
            "updated_at": datetime.now().isoformat(),
        }

        logger.info(f"종목 {stock_code} 상세 정보 조회 완료 (히스토리 {len(history)}건)")
        return {"detail": detail, "history": history}

    except Exception as e:
        logger.error(f"종목 상세 조회 실패: {e}")
        return {"detail": None, "history": []}
