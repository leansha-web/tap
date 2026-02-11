# TAP Railway 배포 가이드

> Next.js 프론트엔드 + FastAPI 백엔드를 Railway에 배포하는 단계별 안내서

---

## 사전 준비

시작하기 전에 아래 3가지가 완료되어야 한다:

### 1. GitHub 리포지토리 준비

TAP 프로젝트를 GitHub에 push한다.

```bash
# 프로젝트 루트에서 실행
git init
git add .
git commit -m "feat: TAP 프로젝트 초기 커밋"

# GitHub에서 새 리포지토리를 만든 뒤 연결
git remote add origin https://github.com/your-username/tap.git
git branch -M main
git push -u origin main
```

### 2. Railway 계정 생성

1. https://railway.app 접속
2. `Login` 클릭 → **GitHub 계정으로 로그인** (추천)
3. GitHub 계정으로 로그인하면 리포지토리 연동이 자동으로 된다

### 3. Supabase 프로젝트 생성 & DB 마이그레이션

1. https://supabase.com 접속 → 프로젝트 생성
2. SQL Editor에서 `supabase/migrations/001_create_tables.sql` 내용을 실행
3. Project Settings → API 에서 **URL**과 **anon key**를 메모해둔다

---

## Step 1: Railway 프로젝트 생성

Railway에서 프로젝트를 만들고 GitHub 리포지토리를 연결한다.

1. Railway 대시보드(https://railway.app/dashboard) 접속
2. 오른쪽 위 **`New Project`** 버튼 클릭
3. **`Deploy from GitHub repo`** 선택
4. GitHub 리포지토리 목록에서 **TAP 리포지토리** 선택
5. Railway가 자동으로 프로젝트를 생성하고 첫 번째 서비스를 만든다

> **참고**: 이 첫 번째 서비스가 Next.js 프론트엔드가 된다.

---

## Step 2: Next.js 서비스 설정

Railway가 자동 감지한 첫 번째 서비스를 Next.js로 설정한다.

### 2-1. 서비스 이름 변경

1. 생성된 서비스 클릭
2. **Settings** 탭 → Service Name을 `tap-frontend`로 변경

### 2-2. 빌드 설정 확인

**Settings** 탭에서 아래 항목을 확인한다:

| 항목 | 값 | 설명 |
|---|---|---|
| Root Directory | `/` | 프로젝트 루트 (package.json 위치) |
| Build Command | `npm run build` | Next.js 빌드 명령어 |
| Start Command | `npm run start` | Next.js 시작 명령어 |

> Railway의 Nixpacks 빌더가 `package.json`을 감지하여 자동으로 Node.js 환경을 구성한다.
> 대부분의 경우 별도 설정 없이 자동 감지된다.

### 2-3. 환경변수 추가

**Variables** 탭 → **`New Variable`** 클릭하여 아래 변수를 추가한다:

| 변수명 | 값 | 필수 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...your-anon-key` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...your-service-role-key` | ✅ |
| `NEXT_PUBLIC_API_URL` | *(Step 3 완료 후 FastAPI URL 입력)* | ✅ |

> **주의**: `NEXT_PUBLIC_API_URL`은 Step 3에서 FastAPI 서비스의 도메인을 생성한 후에 입력한다.

### 2-4. 도메인 생성

1. **Settings** 탭 → Networking 섹션
2. **`Generate Domain`** 클릭
3. `tap-frontend-xxx.up.railway.app` 형태의 URL이 생성된다
4. 이 URL을 메모해둔다 (Step 4에서 사용)

---

## Step 3: FastAPI 서비스 추가

같은 Railway 프로젝트 안에 두 번째 서비스로 FastAPI 백엔드를 추가한다.

### 3-1. 새 서비스 생성

1. 프로젝트 대시보드에서 **`+ New`** 버튼 클릭
2. **`GitHub Repo`** 선택
3. **같은 TAP 리포지토리**를 다시 선택

### 3-2. 서비스 이름 변경

1. 새로 생성된 서비스 클릭
2. **Settings** 탭 → Service Name을 `tap-backend`로 변경

### 3-3. 빌드 설정 변경

**Settings** 탭에서 아래 항목을 설정한다:

| 항목 | 값 | 설명 |
|---|---|---|
| Root Directory | `api` | FastAPI 코드가 있는 폴더 |
| Build Command | `pip install -r requirements.txt` | Python 의존성 설치 |
| Start Command | `uvicorn api.main:app --host 0.0.0.0 --port $PORT` | FastAPI 시작 |

> **중요**: Root Directory를 반드시 `api`로 설정해야 한다!
> 설정하지 않으면 Railway가 Node.js 프로젝트로 인식하여 빌드가 실패한다.

### 3-4. 환경변수 추가

**Variables** 탭에서 아래 변수를 추가한다:

| 변수명 | 값 | 필수 |
|---|---|---|
| `SUPABASE_URL` | `https://your-project.supabase.co` | ✅ |
| `SUPABASE_KEY` | `eyJ...your-service-role-key` | ✅ |
| `ALLOWED_ORIGINS` | *(Step 2에서 생성한 Next.js URL)* | ✅ |
| `NAVER_CLIENT_ID` | Naver 개발자 센터에서 발급 | 선택 |
| `NAVER_CLIENT_SECRET` | Naver 개발자 센터에서 발급 | 선택 |

> **Naver API 키가 없어도** Google News RSS로 자동 대체되므로 뉴스 기능은 동작한다.

### 3-5. 도메인 생성

1. **Settings** 탭 → Networking 섹션
2. **`Generate Domain`** 클릭
3. `tap-backend-xxx.up.railway.app` 형태의 URL이 생성된다
4. 이 URL을 메모해둔다

---

## Step 4: 도메인 & CORS 연결

두 서비스가 서로 통신할 수 있도록 URL을 교차 설정한다.

### 4-1. Next.js → FastAPI 연결

1. `tap-frontend` 서비스 클릭 → **Variables** 탭
2. `NEXT_PUBLIC_API_URL` 값을 FastAPI 도메인으로 설정:

```
https://tap-backend-xxx.up.railway.app
```

> **주의**: 끝에 `/`를 붙이지 않는다!

### 4-2. FastAPI → Next.js CORS 허용

1. `tap-backend` 서비스 클릭 → **Variables** 탭
2. `ALLOWED_ORIGINS` 값을 Next.js 도메인으로 설정:

```
https://tap-frontend-xxx.up.railway.app
```

### 4-3. 재배포

환경변수를 변경하면 Railway가 자동으로 재배포한다.
자동 재배포가 안 되면 각 서비스에서 **`Redeploy`** 버튼을 클릭한다.

---

## Step 5: Supabase Auth 리다이렉트 URL 설정

소셜 로그인(구글/카카오)이 Railway 도메인에서 동작하도록 Supabase를 설정한다.

### 5-1. Supabase 대시보드 설정

1. https://supabase.com → 프로젝트 선택
2. 왼쪽 메뉴 → **Authentication** → **URL Configuration**
3. 아래 항목 설정:

| 항목 | 값 |
|---|---|
| Site URL | `https://tap-frontend-xxx.up.railway.app` |
| Redirect URLs | `https://tap-frontend-xxx.up.railway.app/auth/callback` |

### 5-2. OAuth Provider 설정 (구글 예시)

1. Supabase → **Authentication** → **Providers**
2. **Google** 활성화
3. Google Cloud Console에서 OAuth 2.0 클라이언트 생성:
   - 승인된 리다이렉트 URI: `https://your-project.supabase.co/auth/v1/callback`
4. Client ID와 Client Secret을 Supabase에 입력

---

## 배포 확인 체크리스트

모든 설정이 끝나면 아래 항목을 확인한다:

### API 동작 확인

브라우저에서 직접 접속하여 확인:

```
# FastAPI 헬스 체크
https://tap-backend-xxx.up.railway.app/api/health
→ {"status":"ok","version":"1.0.0"} 이 나오면 성공

# FastAPI API 문서 (Swagger)
https://tap-backend-xxx.up.railway.app/docs
→ API 문서 페이지가 나오면 성공

# Next.js 메인 페이지
https://tap-frontend-xxx.up.railway.app
→ TAP 메인 페이지가 나오면 성공
```

### 전체 플로우 테스트

1. ✅ Next.js 메인 페이지 접속
2. ✅ 로그인 페이지 → 소셜 로그인 성공
3. ✅ 테마 추천 페이지 로딩 (API 연결 확인)
4. ✅ 종목 상세 페이지 → 차트 + 뉴스 표시
5. ✅ 바구니에 테마 추가 → 새로고침 후 유지

---

## 트러블슈팅

### CORS 에러가 발생할 때

**증상**: 브라우저 콘솔에 `Access-Control-Allow-Origin` 에러

**해결**:
1. `tap-backend` 서비스의 `ALLOWED_ORIGINS` 값 확인
2. Next.js 도메인과 **정확히 일치**하는지 확인 (끝에 `/` 없이)
3. `ALLOWED_ORIGINS`에 여러 도메인을 넣을 때는 쉼표로 구분:
   ```
   https://tap-frontend-xxx.up.railway.app,http://localhost:3000
   ```

### Supabase 인증 실패

**증상**: 로그인 후 빈 페이지 또는 에러

**해결**:
1. Supabase → Authentication → URL Configuration에서 Site URL과 Redirect URLs 확인
2. `https://`를 포함한 **전체 URL**을 입력했는지 확인
3. Redirect URL에 `/auth/callback` 경로가 포함되어 있는지 확인

### FastAPI 502 에러

**증상**: API 호출 시 502 Bad Gateway

**해결**:
1. Railway 대시보드에서 `tap-backend` 서비스의 로그 확인
2. Start Command에 `--port $PORT`가 있는지 확인 (Railway가 포트를 동적 할당)
3. Root Directory가 `api`로 설정되어 있는지 확인

### Next.js 빌드 실패

**증상**: Railway 배포 로그에서 빌드 에러

**해결**:
1. `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 설정되어 있는지 확인
2. 이 값이 없으면 빌드 시 Supabase 클라이언트 초기화에서 에러 발생
3. 로컬에서 `npm run build`가 성공하는지 먼저 확인

---

## 비용 안내

| 항목 | Railway 요금 |
|---|---|
| 무료 체험 | 가입 시 $5 크레딧 제공 (체험용) |
| Hobby Plan | $5/월 + 사용량 (소규모 서비스에 적합) |
| 예상 비용 | Next.js + FastAPI 2개 서비스 ≈ $5~15/월 |

> 무료 크레딧으로 약 500시간 사용 가능 (서비스 2개 기준 약 10일)
> 장기 운영 시 Hobby Plan($5/월) 구독 권장

---

## 요약 다이어그램

```
┌─────────────────────────────────────────────────┐
│                Railway 프로젝트                    │
│                                                   │
│  ┌──────────────────┐  ┌──────────────────────┐  │
│  │  tap-frontend     │  │  tap-backend          │  │
│  │  (Next.js)        │  │  (FastAPI)            │  │
│  │                   │  │                       │  │
│  │  Root: /          │  │  Root: api/           │  │
│  │  Port: 자동       │  │  Port: $PORT          │  │
│  │                   │  │                       │  │
│  │  NEXT_PUBLIC_     │  │  ALLOWED_ORIGINS      │  │
│  │  API_URL ─────────┼──┼→ (Next.js URL)       │  │
│  │  (FastAPI URL) ←──┼──┼─ 도메인               │  │
│  └──────────────────┘  └──────────────────────┘  │
│           │                       │               │
└───────────┼───────────────────────┼───────────────┘
            │                       │
            ▼                       ▼
     ┌──────────────────────────────────┐
     │         Supabase                  │
     │  (PostgreSQL + Auth)              │
     │                                   │
     │  - DB: 7개 테이블 + RLS          │
     │  - Auth: 구글/카카오 소셜 로그인  │
     └──────────────────────────────────┘
```
