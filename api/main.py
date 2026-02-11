"""
TAP (Theme Analysis Program) - FastAPI 앱 진입점

증권 데이터를 수집·가공하여 RESTful API로 제공하는 백엔드 서버이다.
모든 라우터와 미들웨어를 여기서 등록한다.
"""
import os
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from contextlib import asynccontextmanager

from api.routers import themes, stocks, news
from api.middleware.error_handler import global_exception_handler
from api.scheduler import start_scheduler, stop_scheduler

# .env 파일에서 환경 변수 로드
load_dotenv()

# 로깅 설정 (디버깅용)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================
# 앱 수명 주기 관리 (시작/종료 시 실행)
# ============================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI 앱의 수명 주기를 관리하는 함수

    시작 시: 백그라운드 스케줄러를 시작한다
    종료 시: 스케줄러를 안전하게 정리한다
    """
    # 서버 시작 시 스케줄러 실행
    start_scheduler()
    yield
    # 서버 종료 시 스케줄러 정리
    stop_scheduler()


# FastAPI 앱 인스턴스 생성
app = FastAPI(
    title="TAP API",
    description="Theme Analysis Program - 테마별 종목 분석 API",
    version="1.0.0",
    lifespan=lifespan,
)

# ============================================
# CORS 미들웨어 설정
# 허용된 도메인만 API에 접근할 수 있도록 제한한다
# 와일드카드(*) 사용 금지 (보안 규칙)
# ============================================
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # 허용된 도메인만 명시
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # 필요한 HTTP 메서드만 허용
    allow_headers=["*"],
)

# ============================================
# 전역 예외 처리 핸들러 등록
# 처리되지 않은 모든 예외를 일관된 JSON 형식으로 반환한다
# ============================================
app.add_exception_handler(Exception, global_exception_handler)

# ============================================
# 헬스 체크 엔드포인트
# 서버가 정상 작동하는지 확인할 때 사용한다
# ============================================
@app.get("/")
async def health_check():
    """서버 상태를 확인하는 헬스 체크 엔드포인트"""
    return {"status": "ok", "message": "TAP API가 정상 작동 중입니다."}


@app.get("/api/health")
async def api_health():
    """API 상태를 확인하는 엔드포인트"""
    return {"status": "ok", "version": "1.0.0"}


# ============================================
# 라우터 등록
# 각 라우터는 /api 접두사 아래에 마운트된다
# ============================================
app.include_router(themes.router, prefix="/api", tags=["themes"])
app.include_router(stocks.router, prefix="/api", tags=["stocks"])
app.include_router(news.router, prefix="/api", tags=["news"])

logger.info("TAP API 서버가 초기화되었습니다.")
