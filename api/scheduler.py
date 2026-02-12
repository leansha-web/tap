"""
스케줄러 설정 (Agent 4)

Skill 4-1: 장중 5분 간격 데이터 갱신 + 장마감 후 1회 최종 업데이트
Skill 4-2: 만료 보고서 자동 삭제는 Supabase Function(pg_cron)에서 처리

참조: docs/08_AgentSkillDesign.md Agent 4 섹션
"""
import asyncio
import logging
from datetime import datetime

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from services.theme_service import fetch_themes_by_volume, fetch_themes_by_surge
from services.stock_service import fetch_stocks_by_theme

# 로깅 설정
logger = logging.getLogger(__name__)

# 스케줄러 전역 인스턴스
scheduler: BackgroundScheduler | None = None


def start_scheduler():
    """
    백그라운드 스케줄러를 시작하는 함수

    FastAPI 서버 시작 시 호출되어 다음 작업을 스케줄링한다:
    1. 장중 (09:00~15:30, 월~금): 5분마다 테마/종목 데이터 갱신
    2. 장마감 후 (15:40, 월~금): 최종 데이터 일괄 업데이트

    스케줄러는 별도 스레드에서 실행되므로 API 응답에 영향을 주지 않는다.
    """
    global scheduler

    scheduler = BackgroundScheduler()

    # ============================================
    # 장중 5분마다 실행 (월~금, 09:00~15:30)
    # 테마 거래량, 종목 가격/거래량 갱신
    # ============================================
    scheduler.add_job(
        refresh_market_data,
        CronTrigger(
            day_of_week='mon-fri',  # 월요일~금요일만 실행
            hour='9-15',            # 9시~15시 사이
            minute='*/5',           # 5분마다
        ),
        id='market_data_refresh',
        name='장중 데이터 갱신 (5분 간격)',
        replace_existing=True,
    )

    # ============================================
    # 장마감 후 1회 실행 (월~금, 15:40)
    # PER, PBR, 배당수익률 등 최종 확정 데이터 업데이트
    # ============================================
    scheduler.add_job(
        refresh_final_data,
        CronTrigger(
            day_of_week='mon-fri',  # 월요일~금요일만 실행
            hour=15,
            minute=40,
        ),
        id='final_data_refresh',
        name='장마감 후 최종 데이터 갱신',
        replace_existing=True,
    )

    scheduler.start()
    logger.info("스케줄러가 성공적으로 시작되었습니다. (장중 5분 갱신 + 15:40 최종 갱신)")


def stop_scheduler():
    """
    스케줄러를 안전하게 종료하는 함수

    FastAPI 서버 종료 시 호출된다.
    """
    global scheduler
    if scheduler and scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("스케줄러가 종료되었습니다.")


def refresh_market_data():
    """
    장중 데이터를 갱신하는 함수

    테마별 거래량 상위 5개를 조회한 뒤,
    각 테마의 종목 데이터(현재가, 거래량, 시가총액)를 업데이트한다.
    5분 간격으로 호출된다.
    """
    try:
        now = datetime.now()
        logger.info(f"[{now.strftime('%H:%M')}] 장중 데이터 갱신 시작")

        # 거래량 기준 상위 테마 조회 (async 함수이므로 asyncio.run으로 실행)
        themes = asyncio.run(fetch_themes_by_volume())
        logger.info(f"테마 {len(themes)}개 갱신 완료")

        # 각 테마별 종목 데이터 갱신
        for theme in themes[:5]:
            theme_code = theme.get("code", "")
            if theme_code:
                asyncio.run(fetch_stocks_by_theme(theme_code))
                logger.info(f"테마 '{theme.get('name', '')}' 종목 갱신 완료")

        logger.info("장중 데이터 갱신 완료")

    except Exception as error:
        logger.error(f"장중 데이터 갱신 실패: {error}")


def refresh_final_data():
    """
    장마감 후 최종 데이터를 갱신하는 함수

    PER, PBR, 배당수익률, 투자자별 거래량 등
    장 마감 후에만 확정되는 데이터를 업데이트한다.
    매일 15:40에 1회 호출된다.
    """
    try:
        logger.info("장마감 후 최종 데이터 갱신 시작")

        # 거래량 + 급등주 기준 모두 갱신 (async 함수이므로 asyncio.run으로 실행)
        volume_themes = asyncio.run(fetch_themes_by_volume())
        surge_themes = asyncio.run(fetch_themes_by_surge())

        # 중복 제거를 위해 코드 기준으로 합치기
        all_theme_codes = set()
        all_themes = []

        for theme in volume_themes + surge_themes:
            code = theme.get("code", "")
            if code and code not in all_theme_codes:
                all_theme_codes.add(code)
                all_themes.append(theme)

        # 각 테마의 종목 데이터 전체 갱신 (상세 지표 포함)
        for theme in all_themes:
            theme_code = theme.get("code", "")
            if theme_code:
                asyncio.run(fetch_stocks_by_theme(theme_code))

        logger.info(f"장마감 후 최종 데이터 갱신 완료 (테마 {len(all_themes)}개)")

    except Exception as error:
        logger.error(f"장마감 후 최종 데이터 갱신 실패: {error}")
