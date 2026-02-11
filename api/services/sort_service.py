"""
데이터 정렬·필터링 서비스 (Agent 2, Skill 2-4)

종목 데이터를 다중 컬럼으로 정렬하고 타입별로 필터링하는 유틸리티 함수 모음
"""
import logging
from typing import Any

logger = logging.getLogger(__name__)


def sort_stocks(
    stocks: list[dict[str, Any]],
    sort_by: list[str],
    order: list[str]
) -> list[dict[str, Any]]:
    """
    종목 리스트를 다중 컬럼으로 정렬하는 함수

    여러 컬럼을 기준으로 동시에 정렬할 수 있다.
    sort_by와 order 리스트의 순서대로 우선순위가 결정된다.

    Args:
        stocks: 정렬할 종목 리스트
        sort_by: 정렬 기준 컬럼 이름 리스트 (예: ["volume", "price"])
        order: 각 컬럼의 정렬 방향 리스트 (예: ["desc", "asc"])

    Returns:
        정렬된 종목 리스트

    사용 예시:
        sorted_stocks = sort_stocks(
            stocks,
            sort_by=["trading_volume", "price"],
            order=["desc", "asc"]
        )
    """
    # sort_by와 order 길이가 다르면 기본값(desc)으로 채운다
    while len(order) < len(sort_by):
        order.append("desc")

    def sort_key(stock: dict[str, Any]) -> tuple:
        """정렬 키를 생성하는 내부 함수"""
        keys = []
        for column, direction in zip(sort_by, order):
            value = stock.get(column, 0)
            # 내림차순이면 음수로 변환 (숫자 데이터 기준)
            if direction == "desc" and isinstance(value, (int, float)):
                value = -value
            keys.append(value)
        return tuple(keys)

    return sorted(stocks, key=sort_key)


def filter_stocks_by_type(
    stocks: list[dict[str, Any]],
    stock_type: str
) -> list[dict[str, Any]]:
    """
    종목 타입으로 필터링하는 함수

    Args:
        stocks: 필터링할 종목 리스트
        stock_type: 종목 타입 ('stock' 또는 'ETF')

    Returns:
        필터링된 종목 리스트
    """
    return [stock for stock in stocks if stock.get("type") == stock_type]
