# TAP FastAPI 서버 — Docker 빌드 설정
# pykrx가 pkg_resources를 사용하므로 setuptools를 먼저 설치해야 한다

FROM python:3.12-slim

WORKDIR /app

# setuptools를 먼저 설치 (pykrx의 pkg_resources 의존성 해결)
RUN pip install --no-cache-dir setuptools

# 나머지 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 앱 코드 복사
COPY . .

# Railway에서 $PORT 환경변수를 사용하므로 기본값 8000 설정
ENV PORT=8000

# 서버 실행 — Railway가 $PORT를 주입함
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
