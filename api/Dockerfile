# TAP FastAPI 서버 — Docker 빌드 설정
# pykrx가 pkg_resources를 사용하므로 setuptools를 반드시 먼저 설치해야 한다

FROM python:3.12-slim

WORKDIR /app

# 1단계: pip 업그레이드 + setuptools 강제 설치 + 설치 검증
RUN pip install --upgrade pip && \
    pip install --force-reinstall setuptools && \
    python -c "import pkg_resources; print('pkg_resources OK')"

# 2단계: 나머지 의존성 설치 + pykrx import 검증
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    python -c "from pykrx import stock; print('pykrx OK')"

# 앱 코드 복사
COPY . .

# Railway에서 $PORT 환경변수를 사용
ENV PORT=8000

# 서버 실행 — Railway가 $PORT를 주입함
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
