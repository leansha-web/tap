# TASKS (AI 개발 파트너용 프롬프트 설계서)

**프로젝트**: Theme Analysis Program (TAP)  
**버전**: v1.0  
**작성일**: 2026-02-10  
**목표**: AI 코딩 파트너가 즉시 협업을 시작할 수 있도록 구체화되고 실행 가능한 단계별 개발 경로 제공

---

## 마일스톤 개요

| 마일스톤 | 목표 | 예상 기간 | 의존성 |
|---|---|---|---|
| **M0** | 프로젝트 초기화 및 기술 스택 설정 | 1일 | 없음 |
| **M1** | 핵심 UI 및 디자인 시스템 구축 | 2일 | M0 완료 |
| **M2** | 인증 및 사용자 관리 | 1일 | M0 완료 |
| **M3** | 핵심 기능 개발 (MVP) | 5일 | M1, M2 완료 |
| **M4** | 테스트 및 배포 | 2일 | M3 완료 |

**총 예상 기간**: 11일

---

## M0: 프로젝트 초기화 및 기술 스택 설정

### [] M0-1: Next.js 프로젝트 생성

**컨텍스트**  
TAP은 반응형 웹 기반 주식 테마 분석 도구입니다. Next.js 14 (App Router)를 사용하여 프로젝트를 초기화합니다. TRD 문서의 "프론트엔드" 섹션을 참조하세요.

**사용자 스토리**  
개발자로서, Next.js 프로젝트를 생성하고 기본 설정을 완료하여 개발을 시작하고 싶습니다.

**기술 명세**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- ESLint, Prettier

**작업 단계**
1. `npx create-next-app@latest tap --typescript --tailwind --app --eslint` 실행
2. `cd tap` 이동
3. `package.json`에서 의존성 확인
4. `npm run dev`로 로컬 서버 실행 (http://localhost:3000)

**인수 조건**
- ✅ `app/` 디렉토리 구조 확인
- ✅ `npm run dev`로 로컬 서버 실행 확인
- ✅ 브라우저에서 기본 페이지 표시 확인

**자가 수정 지침**  
만약 설치 중 오류가 발생하면, Node.js 버전을 18 이상으로 업데이트하세요. `node -v`로 버전 확인 후 필요 시 [nodejs.org](https://nodejs.org)에서 최신 LTS 버전 설치.

---

### [] M0-2: Supabase 프로젝트 생성 및 연결

**컨텍스트**  
Supabase를 데이터베이스 및 인증 서비스로 사용합니다. TRD의 "데이터베이스" 섹션과 Database Design 문서를 참조하세요.

**사용자 스토리**  
개발자로서, Supabase 프로젝트를 생성하고 Next.js와 연결하여 데이터베이스를 사용할 준비를 하고 싶습니다.

**기술 명세**
- Supabase 프로젝트 생성 (https://supabase.com)
- `@supabase/supabase-js` 설치
- 환경 변수 설정 (`.env.local`)

**작업 단계**
1. Supabase 대시보드에서 새 프로젝트 생성
2. 프로젝트 설정에서 API URL과 anon key 복사
3. `npm install @supabase/supabase-js` 실행
4. `.env.local` 파일 생성:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
   ```
5. `lib/supabase.ts` 파일 생성:
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   
   export const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   );
   ```

**인수 조건**
- ✅ Supabase 프로젝트 생성 완료
- ✅ 환경 변수 설정 완료
- ✅ Supabase 클라이언트 초기화 코드 작성 완료

**자가 수정 지침**  
연결 테스트를 위해 간단한 쿼리를 실행해 보세요. 예: `const { data } = await supabase.from('users').select('*').limit(1);`

---

### [] M0-3: Python FastAPI 프로젝트 생성

**컨텍스트**  
증권 데이터 처리를 위해 Python FastAPI를 사용합니다. TRD의 "백엔드" 섹션을 참조하세요.

**사용자 스토리**  
개발자로서, FastAPI 프로젝트를 생성하고 증권 데이터 라이브러리(pykrx)를 설치하여 API 개발을 시작하고 싶습니다.

**기술 명세**
- Python 3.10+
- FastAPI
- pykrx, FinanceDataReader
- uvicorn (서버)

**작업 단계**
1. 프로젝트 루트에 `api/` 디렉토리 생성
2. `api/requirements.txt` 작성:
   ```
   fastapi==0.104.1
   uvicorn[standard]==0.24.0
   pykrx==1.0.40
   python-dotenv==1.0.0
   ```
3. `api/main.py` 작성:
   ```python
   from fastapi import FastAPI
   
   app = FastAPI()
   
   @app.get("/")
   def read_root():
       return {"message": "TAP API is running"}
   ```
4. `pip install -r api/requirements.txt` 실행
5. `uvicorn api.main:app --reload` 실행

**인수 조건**
- ✅ `api/` 디렉토리 생성 완료
- ✅ `requirements.txt` 작성 완료
- ✅ `uvicorn api.main:app --reload`로 서버 실행 확인
- ✅ http://localhost:8000 접속 시 응답 확인

**자가 수정 지침**  
pykrx 설치 시 오류가 발생하면, `pip install --upgrade pip`를 먼저 실행하세요.

---

## M1: 핵심 UI 및 디자인 시스템 구축

### [] M1-1: Design System 토큰 정의

**컨텍스트**  
Design System 문서를 참조하여 색상, 타이포그래피, 간격을 Tailwind CSS 설정에 반영합니다.

**사용자 스토리**  
개발자로서, 디자인 시스템 토큰을 Tailwind 설정에 추가하여 일관된 스타일을 사용하고 싶습니다.

**기술 명세**
- `tailwind.config.ts` 수정
- Design System 문서의 색상, 폰트, 간격 토큰 반영

**작업 단계**
1. `tailwind.config.ts` 파일 열기
2. Design System 문서의 "색상 팔레트" 섹션을 참조하여 `colors` 추가
3. `fontFamily` 설정 추가
4. `globals.css`에 폰트 임포트 추가

**인수 조건**
- ✅ `colors`, `fontFamily`, `spacing` 커스텀 설정 완료
- ✅ 다크 모드 기본 설정 (`darkMode: 'class'`)
- ✅ 간단한 컴포넌트를 만들어 색상이 제대로 적용되는지 확인

**자가 수정 지침**  
설정 후 간단한 컴포넌트를 만들어 색상이 제대로 적용되는지 확인하세요. 예: `<div className="bg-primary text-white p-4">테스트</div>`

---

### [] M1-2: 공통 UI 컴포넌트 생성

**컨텍스트**  
Design System 문서의 "UI 컴포넌트" 섹션을 참조하여 버튼, 입력 필드, 카드 컴포넌트를 생성합니다.

**사용자 스토리**  
개발자로서, 재사용 가능한 UI 컴포넌트를 만들어 개발 속도를 높이고 싶습니다.

**기술 명세**
- `components/ui/` 디렉토리 생성
- `Button.tsx`, `Input.tsx`, `Card.tsx` 컴포넌트 작성
- 상태별 스타일 (기본, 호버, 비활성화) 구현

**작업 단계**
1. `components/ui/Button.tsx` 생성 (Design System 문서의 버튼 스타일 참조)
2. `components/ui/Input.tsx` 생성
3. `components/ui/Card.tsx` 생성
4. 각 컴포넌트에 TypeScript 타입 정의

**인수 조건**
- ✅ 각 컴포넌트가 Design System 스타일을 따름
- ✅ 간단한 테스트 페이지에서 확인 가능
- ✅ TypeScript 타입 에러 없음

**자가 수정 지침**  
접근성 체크리스트를 확인하여 포커스 링, ARIA 라벨을 추가하세요.

---

### [] M1-3: 레이아웃 및 네비게이션 구조

**컨텍스트**  
TAP의 주요 페이지는 "테마 분석", "바구니", "보고서"입니다. User Flow 문서를 참조하세요.

**사용자 스토리**  
사용자로서, 상단 네비게이션 바를 통해 주요 페이지 간 이동하고 싶습니다.

**기술 명세**
- `app/layout.tsx`에 공통 레이아웃 작성
- 네비게이션 바 컴포넌트 (`components/Navbar.tsx`)
- 페이지: `/themes`, `/basket`, `/reports`

**작업 단계**
1. `components/Navbar.tsx` 생성 (Design System의 네비게이션 스타일 참조)
2. `app/layout.tsx`에 Navbar 추가
3. `app/themes/page.tsx`, `app/basket/page.tsx`, `app/reports/page.tsx` 생성 (빈 페이지)
4. 현재 페이지 하이라이트 기능 추가

**인수 조건**
- ✅ 네비게이션 바가 모든 페이지에 표시됨
- ✅ 현재 페이지가 하이라이트됨
- ✅ 모바일에서 햄버거 메뉴로 전환됨 (반응형)

**자가 수정 지침**  
모바일 화면에서 네비게이션이 제대로 작동하는지 확인하세요. 브라우저 개발자 도구의 반응형 모드 사용.

---

## M2: 인증 및 사용자 관리

### [] M2-1: Supabase Auth 소셜 로그인 설정

**컨텍스트**  
TRD의 "외부 API/서비스" 섹션을 참조하여 구글/카카오 소셜 로그인을 설정합니다.

**사용자 스토리**  
사용자로서, 구글 또는 카카오 계정으로 간편하게 로그인하고 싶습니다.

**기술 명세**
- Supabase 대시보드에서 구글/카카오 OAuth 설정
- `app/login/page.tsx` 로그인 페이지 작성
- Supabase Auth 메서드 사용 (`signInWithOAuth`)

**작업 단계**
1. Supabase 대시보드 → Authentication → Providers에서 Google, Kakao 활성화
2. OAuth 클라이언트 ID/Secret 설정
3. `app/login/page.tsx` 생성:
   ```typescript
   import { supabase } from '@/lib/supabase';
   
   async function handleGoogleLogin() {
     await supabase.auth.signInWithOAuth({ provider: 'google' });
   }
   ```
4. 로그인 버튼 UI 작성 (Design System의 버튼 스타일 참조)

**인수 조건**
- ✅ 구글/카카오 로그인 버튼 클릭 시 OAuth 플로우 시작
- ✅ 로그인 성공 시 `/themes` 페이지로 리다이렉트
- ✅ 세션 유지 확인 (새로고침 후에도 로그인 상태 유지)

**자가 수정 지침**  
OAuth 리다이렉트 URL이 Supabase 대시보드와 일치하는지 확인하세요. 기본값: `http://localhost:3000/auth/callback`

---

### [] M2-2: 사용자 세션 관리 및 보호된 라우트

**컨텍스트**  
PRD의 "비기능적 요구사항" 섹션을 참조하여 인증되지 않은 사용자는 로그인 페이지로 리다이렉트합니다.

**사용자 스토리**  
개발자로서, 로그인하지 않은 사용자가 보호된 페이지에 접근하지 못하도록 하고 싶습니다.

**기술 명세**
- `middleware.ts`에서 세션 확인
- 보호된 라우트: `/themes`, `/basket`, `/reports`
- 로그아웃 기능 구현

**작업 단계**
1. `middleware.ts` 생성:
   ```typescript
   import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
   import { NextResponse } from 'next/server';
   
   export async function middleware(req) {
     const res = NextResponse.next();
     const supabase = createMiddlewareClient({ req, res });
     const { data: { session } } = await supabase.auth.getSession();
     
     if (!session && req.nextUrl.pathname.startsWith('/themes')) {
       return NextResponse.redirect(new URL('/login', req.url));
     }
     
     return res;
   }
   ```
2. Navbar에 로그아웃 버튼 추가

**인수 조건**
- ✅ 로그인하지 않은 사용자가 보호된 페이지 접근 시 `/login`으로 리다이렉트
- ✅ 로그아웃 버튼 클릭 시 세션 종료 및 `/login`으로 이동

**자가 수정 지침**  
세션 만료 시 자동 로그아웃 처리를 추가하세요.

---

## M3: 핵심 기능 개발 (MVP)

### [] M3-1: Database 스키마 생성

**컨텍스트**  
Database Design 문서를 참조하여 Supabase에 테이블을 생성합니다.

**사용자 스토리**  
개발자로서, 데이터베이스 스키마를 생성하여 데이터를 저장할 준비를 하고 싶습니다.

**기술 명세**
- Supabase SQL Editor에서 테이블 생성
- 테이블: `users`, `themes`, `stocks`, `stock_details`, `baskets`, `basket_themes`, `reports`
- RLS (Row Level Security) 정책 설정

**작업 단계**
1. Supabase 대시보드 → SQL Editor 열기
2. Database Design 문서의 ERD를 참조하여 테이블 생성 SQL 작성
3. 인덱스 생성 (Database Design 문서의 "인덱싱 전략" 참조)
4. RLS 정책 생성 (Database Design 문서의 "RLS 정책" 참조)

**인수 조건**
- ✅ 모든 테이블 생성 완료
- ✅ RLS 정책: 사용자는 본인 데이터만 접근 가능
- ✅ 인덱스 설정 완료

**자가 수정 지침**  
RLS 정책이 제대로 작동하는지 테스트 쿼리로 확인하세요.

---

### [] M3-2: FEAT-1 - 테마 분석 & 추천 (백엔드)

**컨텍스트**  
PRD의 "사용자 스토리 FEAT-1"과 워크플로 문서를 참조하세요. 증권 API(pykrx)를 사용하여 테마 데이터를 가져옵니다.

**사용자 스토리**  
사용자로서, 거래량 또는 급등주 기준으로 상위 5개 테마를 추천받고 싶습니다.

**기술 명세**
- FastAPI 엔드포인트: `GET /api/themes?sort=volume` 또는 `sort=surge`
- pykrx를 사용하여 테마 데이터 수집
- 거래량 또는 급등주 수 기준으로 정렬

**작업 단계**
1. `api/routers/themes.py` 생성
2. pykrx로 테마 데이터 가져오기
3. 거래량/급등주 기준 정렬 로직 구현
4. FastAPI 라우터 등록

**인수 조건**
- ✅ `/api/themes?sort=volume` 호출 시 거래량 상위 5개 테마 반환
- ✅ `/api/themes?sort=surge` 호출 시 급등주 많은 5개 테마 반환
- ✅ 응답 시간 3초 이내

**자가 수정 지침**  
pykrx 데이터가 없을 경우 대체 API(FinanceDataReader)를 사용하세요.

---

### [] M3-3: FEAT-1 - 테마 분석 & 추천 (프론트엔드)

**컨텍스트**  
User Flow 문서를 참조하여 테마 추천 화면을 구현합니다.

**사용자 스토리**  
사용자로서, 거래량/급등주 옵션을 선택하여 테마를 추천받고, 바구니에 담고 싶습니다.

**기술 명세**
- `app/themes/page.tsx` 페이지 작성
- 옵션 선택 UI (라디오 버튼: 거래량 / 급등주)
- FastAPI `/api/themes` 호출
- 추천 테마 카드 표시 + "바구니 담기" 버튼

**작업 단계**
1. `app/themes/page.tsx` 생성
2. 옵션 선택 UI 작성 (Design System의 입력 필드 스타일 참조)
3. API 호출 로직 작성 (`fetch` 또는 `axios`)
4. 로딩 상태 표시 (Design System의 스피너 참조)
5. 추천 테마 카드 표시 (Design System의 카드 스타일 참조)
6. "바구니 담기" 버튼 클릭 시 Supabase `baskets`, `basket_themes` 테이블에 저장

**인수 조건**
- ✅ 옵션 선택 시 추천 테마 5개 표시
- ✅ "바구니 담기" 클릭 시 Supabase에 저장
- ✅ 수동 테마 추가 기능 (검색 입력 필드)

**자가 수정 지침**  
로딩 상태를 표시하여 사용자 경험을 개선하세요.

---

### [] M3-4: FEAT-2 - 종목 심층 분석 (백엔드)

**컨텍스트**  
PRD의 "사용자 스토리 FEAT-2"와 워크플로 문서를 참조하세요. 테마별 대장주 5개 + ETF 3개를 추천합니다.

**사용자 스토리**  
사용자로서, 선택한 테마의 대장주와 ETF를 추천받고, 11개 지표를 확인하고 싶습니다.

**기술 명세**
- FastAPI 엔드포인트: `GET /api/stocks?theme_id={id}`
- pykrx로 종목 데이터 수집
- 거래량 기준 상위 5개 종목 + ETF 3개 반환
- 11개 지표 포함

**작업 단계**
1. `api/routers/stocks.py` 생성
2. pykrx로 종목 데이터 가져오기
3. 11개 지표 수집 로직 구현
4. FastAPI 라우터 등록

**인수 조건**
- ✅ `/api/stocks?theme_id=1` 호출 시 대장주 5개 + ETF 3개 반환
- ✅ 각 종목에 11개 지표 포함
- ✅ 응답 시간 5초 이내

**자가 수정 지침**  
뉴스 데이터는 Google News API 또는 Naver 검색 API를 사용하세요.

---

### [] M3-5: FEAT-2 - 종목 심층 분석 (프론트엔드)

**컨텍스트**  
User Flow 문서를 참조하여 종목 상세 표를 구현합니다. Design System의 "데이터 테이블" 스타일을 따르세요.

**사용자 스토리**  
사용자로서, 종목을 11개 지표로 비교하고, 엑셀처럼 다중 정렬하고 싶습니다.

**기술 명세**
- `app/basket/[id]/page.tsx` 페이지 작성
- 데이터 테이블 컴포넌트 (`components/StockTable.tsx`)
- 헤더 클릭 시 정렬 기능 (오름차순/내림차순)
- 다중 정렬 지원 (Shift + 클릭)

**작업 단계**
1. `components/StockTable.tsx` 생성
2. 11개 지표 컬럼 표시
3. 정렬 로직 구현 (React state 사용)
4. 다중 정렬 로직 구현
5. 모바일 반응형 처리 (가로 스크롤)

**인수 조건**
- ✅ 테이블에 11개 지표 컬럼 표시
- ✅ 헤더 클릭 시 정렬 작동
- ✅ Shift + 클릭으로 다중 정렬 가능
- ✅ 모바일에서 가로 스크롤 가능

**자가 수정 지침**  
정렬 상태를 URL 쿼리 파라미터로 저장하여 공유 가능하게 하세요.

---

### [] M3-6: 종목 상세 페이지 (차트 + 뉴스)

**컨텍스트**  
User Flow 문서를 참조하여 종목 상세 페이지를 구현합니다. Design System의 차트 색상을 사용하세요.

**사용자 스토리**  
사용자로서, 종목을 클릭하여 그래프(기준가, 이동평균선, 거래량)와 뉴스를 확인하고 싶습니다.

**기술 명세**
- `app/stocks/[code]/page.tsx` 페이지 작성
- Recharts 또는 TradingView Lightweight Charts 사용
- 뉴스 목록 표시

**작업 단계**
1. `app/stocks/[code]/page.tsx` 생성
2. 차트 라이브러리 설치 (`npm install recharts`)
3. 차트 컴포넌트 작성 (Design System의 차트 스타일 참조)
4. 뉴스 목록 표시

**인수 조건**
- ✅ 차트에 기준가, 이동평균선, 거래량 표시
- ✅ 뉴스 최신 5개 표시
- ✅ 모바일에서도 차트가 반응형으로 표시됨

**자가 수정 지침**  
차트 로딩 시간이 길면 스켈레톤 UI를 추가하세요.

---

## M4: 테스트 및 배포

### [] M4-1: Railway 배포 설정

**컨텍스트**  
TRD의 "배포/호스팅" 섹션을 참조하여 Railway에 Next.js + Python FastAPI를 배포합니다.

**사용자 스토리**  
개발자로서, TAP을 Railway에 배포하여 실제 사용자가 접근할 수 있도록 하고 싶습니다.

**기술 명세**
- Railway 프로젝트 생성
- Next.js와 FastAPI를 각각 서비스로 배포
- 환경 변수 설정 (Supabase, API 키)

**작업 단계**
1. Railway 계정 생성 (https://railway.app)
2. GitHub 리포지토리 연결
3. Next.js 서비스 생성
4. FastAPI 서비스 생성
5. 환경 변수 설정

**인수 조건**
- ✅ Next.js 앱이 Railway에서 실행됨
- ✅ FastAPI 앱이 Railway에서 실행됨
- ✅ 두 앱이 서로 통신 가능 (CORS 설정)

**자가 수정 지침**  
CORS 오류가 발생하면 FastAPI에 `CORSMiddleware`를 추가하세요.

---

### [] M4-2: 통합 테스트 및 버그 수정

**컨텍스트**  
PRD의 "성공 지표" 섹션을 참조하여 핵심 시나리오를 테스트합니다.

**사용자 스토리**  
개발자로서, 사용자 시나리오를 테스트하여 버그를 발견하고 수정하고 싶습니다.

**테스트 시나리오**
1. 로그인 → 테마 추천 → 바구니 담기 → 종목 분석 → 정렬 → 상세 페이지
2. 모바일에서 동일 시나리오 반복
3. 로그아웃 후 재로그인하여 바구니 유지 확인

**인수 조건**
- ✅ 모든 시나리오가 오류 없이 작동
- ✅ 모바일 반응형 확인
- ✅ 성능 기준 충족 (테마 추천 3초, 종목 분석 5초)

**자가 수정 지침**  
버그 발견 시 우선순위를 정하여 수정하세요 (크리티컬 > 중요 > 개선).

---

## 참조 문서 매핑

각 태스크는 다음 문서들을 참조합니다:

| 태스크 | 참조 문서 |
|---|---|
| M0-1, M0-2, M0-3 | TRD (기술 스택) |
| M1-1, M1-2 | Design System |
| M1-3 | User Flow, Design System |
| M2-1, M2-2 | TRD (인증), PRD (비기능적 요구사항) |
| M3-1 | Database Design |
| M3-2, M3-3 | PRD (FEAT-1), User Flow, 워크플로 |
| M3-4, M3-5, M3-6 | PRD (FEAT-2), User Flow, Design System |
| M4-1 | TRD (배포) |
| M4-2 | PRD (성공 지표), User Flow |

---

## 진행 상황 추적

각 태스크 완료 시 체크박스를 체크하세요:

- [ ] M0-1
- [ ] M0-2
- [ ] M0-3
- [ ] M1-1
- [ ] M1-2
- [ ] M1-3
- [ ] M2-1
- [ ] M2-2
- [ ] M3-1
- [ ] M3-2
- [ ] M3-3
- [ ] M3-4
- [ ] M3-5
- [ ] M3-6
- [ ] M4-1
- [ ] M4-2
