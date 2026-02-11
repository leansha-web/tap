# Agent & Skill 설계서

**프로젝트**: Theme Analysis Program (TAP)
**버전**: v1.0
**작성일**: 2026-02-10
**목표**: TAP 시스템을 구성하는 4개 Agent와 19개 Skill의 상세 명세

---

## 1. 아키텍처 개요

### 1.1 시스템 구성도

```
┌─────────────────────────────────────────────────────────┐
│                    사용자 (PC / 모바일)                    │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│            Agent 1: Next.js Frontend Agent               │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│  │Skill1-1│ │Skill1-2│ │Skill1-3│ │Skill1-4│           │
│  │로그인UI│ │테마추천│ │테마검색│ │바구니  │           │
│  └────────┘ └────────┘ └────────┘ └────────┘           │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│  │Skill1-5│ │Skill1-6│ │Skill1-7│ │Skill1-8│           │
│  │종목테이블│ │종목차트│ │종목뉴스│ │레이아웃│           │
│  └────────┘ └────────┘ └────────┘ └────────┘           │
└──────────┬────────────────────────────┬─────────────────┘
           │                            │
           ▼                            ▼
┌─────────────────────┐    ┌─────────────────────────────┐
│  Agent 3: Supabase  │    │  Agent 2: FastAPI Backend   │
│  ┌───────┐ ┌──────┐ │    │  ┌───────┐ ┌───────┐       │
│  │Skill  │ │Skill │ │    │  │Skill  │ │Skill  │       │
│  │3-1 인증│ │3-2   │ │    │  │2-1 테마│ │2-2 종목│       │
│  └───────┘ │바구니 │ │    │  │수집   │ │수집   │       │
│  ┌───────┐ │CRUD  │ │    │  └───────┘ └───────┘       │
│  │Skill  │ └──────┘ │    │  ┌───────┐ ┌───────┐       │
│  │3-3 RLS│ ┌──────┐ │    │  │Skill  │ │Skill  │       │
│  └───────┘ │Skill │ │    │  │2-3 뉴스│ │2-4 정렬│       │
│  ┌───────┐ │3-4   │ │    │  └───────┘ └───────┘       │
│            │보고서 │ │    │  ┌───────┐                  │
│            └──────┘ │    │  │Skill  │                  │
│                     │    │  │2-5 에러│                  │
│                     │    │  └───────┘                  │
└─────────────────────┘    │  ┌─────────────────────┐    │
                           │  │ Agent 4: Scheduler  │    │
                           │  │ ┌───────┐ ┌───────┐ │    │
                           │  │ │Skill  │ │Skill  │ │    │
                           │  │ │4-1 갱신│ │4-2 삭제│ │    │
                           │  │ └───────┘ └───────┘ │    │
                           │  └─────────────────────┘    │
                           └─────────────────────────────┘
```

### 1.2 Agent 간 의존성

```
Agent 3 (Supabase 세팅)
  ├── Agent 1 (프론트엔드: 인증 UI, 바구니 CRUD)
  └── Agent 2 (백엔드: DB에 데이터 저장)
        └── Agent 4 (스케줄러: 백엔드 서비스 함수 재사용)
```

### 1.3 Agent 요약

| Agent | 역할 | 기술 스택 | Skill 수 |
|---|---|---|---|
| Agent 1 | 프론트엔드 UI/UX | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui | 8 |
| Agent 2 | 증권 데이터 API | Python FastAPI, pykrx, FinanceDataReader | 5 |
| Agent 3 | DB, 인증, 보안 | Supabase (PostgreSQL + Auth + RLS) | 4 |
| Agent 4 | 자동화 스케줄링 | APScheduler, Supabase Function | 2 |

---

## 2. Agent 1: Next.js Frontend Agent

### 2.1 개요

- **역할**: 사용자에게 보이는 모든 화면을 렌더링하고 인터랙션을 처리한다
- **기술**: Next.js 14 (App Router), TypeScript (strict), Tailwind CSS, shadcn/ui, Zustand, SWR
- **참조**: `docs/05_DesignSystem.md`, `docs/03_UserFlow.md`

---

### Skill 1-1: 소셜 로그인 UI

**목적**: 사용자가 구글 또는 카카오 계정으로 로그인할 수 있는 화면 제공

**파일**
- `app/login/page.tsx` — 로그인 페이지
- `app/auth/callback/route.ts` — OAuth 콜백 처리

**입력**: 없음 (페이지 진입)

**출력**: 로그인 성공 시 `/themes`로 리다이렉트, 실패 시 에러 메시지 표시

**동작 흐름**
1. 사용자가 `/login` 페이지에 접근한다
2. "구글로 로그인" 또는 "카카오로 로그인" 버튼을 클릭한다
3. `supabase.auth.signInWithOAuth({ provider })` 호출
4. OAuth 제공자 페이지에서 인증 후 `/auth/callback`으로 리다이렉트
5. 세션 생성 후 `/themes` 페이지로 이동

**에러 처리**
- OAuth 인증 실패: "로그인에 실패했습니다. 다시 시도해주세요." 메시지 표시
- 네트워크 오류: "인터넷 연결을 확인해주세요." 메시지 표시

**인수 조건**
- ✅ 구글/카카오 로그인 버튼이 Design System 스타일대로 렌더링된다
- ✅ 로그인 성공 시 `/themes`로 이동한다
- ✅ 실패 시 에러 메시지가 표시된다
- ✅ 새로고침 후에도 로그인 상태가 유지된다

**의존성**: Agent 3 Skill 3-1 (Supabase OAuth 설정 완료 필요)

**참조 문서**: `docs/03_UserFlow.md` 섹션 3.1, `docs/05_DesignSystem.md` 섹션 4.1

---

### Skill 1-2: 테마 추천 화면

**목적**: 거래량 또는 급등주 기준으로 상위 5개 테마를 카드 형태로 표시

**파일**
- `app/themes/page.tsx` — 테마 분석 페이지
- `components/features/ThemeCard.tsx` — 테마 카드 컴포넌트

**입력**: 사용자의 정렬 옵션 선택 (`volume` 또는 `surge`)

**출력**: 상위 5개 테마 카드 리스트

**동작 흐름**
1. 페이지 진입 시 기본값 `sort=volume`으로 API 호출
2. 라디오 버튼으로 정렬 기준 변경 가능
3. `GET /api/themes?sort={option}` 호출 (SWR로 캐싱)
4. 로딩 중: 스켈레톤 카드 5개 표시
5. 성공: ThemeCard 5개 렌더링 (테마명, 거래량, 급등주 수, "바구니 담기" 버튼)
6. 실패: 에러 메시지 + "다시 시도" 버튼

**에러 처리**
- API 타임아웃 (10초): "서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요."
- API 실패: "테마를 불러오는 데 실패했습니다. 다시 시도해주세요." + 재시도 버튼
- 데이터 없음: "추천할 테마가 없습니다. 수동으로 테마를 추가해보세요."

**인수 조건**
- ✅ 거래량/급등주 옵션 선택 시 테마 5개가 카드로 표시된다
- ✅ 로딩 상태에서 스켈레톤 UI가 표시된다
- ✅ "바구니 담기" 버튼 클릭 시 Supabase에 저장된다
- ✅ 모바일: 카드가 1열로 배치된다 (PC: 3열)

**의존성**: Agent 2 Skill 2-1 (`GET /api/themes` 엔드포인트)

**참조 문서**: `docs/03_UserFlow.md` 섹션 3.2, `docs/05_DesignSystem.md` 섹션 4.3

---

### Skill 1-3: 테마 검색 & 수동 추가

**목적**: 사용자가 원하는 테마를 직접 검색하여 바구니에 추가

**파일**
- `components/features/ThemeSearch.tsx` — 테마 검색 컴포넌트 (테마 페이지에 포함)

**입력**: 검색어 (테마명)

**출력**: 검색 결과 드롭다운 + "추가" 버튼

**동작 흐름**
1. 검색 입력 필드에 테마명 입력 (디바운스 300ms)
2. `GET /api/themes/search?q={query}` 호출
3. 검색 결과를 드롭다운으로 표시
4. "추가" 버튼 클릭 시 바구니에 저장

**에러 처리**
- 검색 결과 없음: "일치하는 테마가 없습니다."
- API 실패: 조용히 실패 (콘솔 로그만 기록)

**인수 조건**
- ✅ 검색어 입력 시 300ms 디바운스 후 결과 표시
- ✅ 검색 결과에서 "추가" 클릭 시 바구니에 저장
- ✅ 이미 바구니에 있는 테마는 중복 추가 불가

**의존성**: Agent 2 (`GET /api/themes/search`)

**참조 문서**: `docs/03_UserFlow.md` 섹션 3.2

---

### Skill 1-4: 바구니 관리

**목적**: 사용자가 담은 테마 목록을 관리하고, 종목 분석으로 이동

**파일**
- `app/basket/page.tsx` — 바구니 페이지
- `components/features/BasketList.tsx` — 바구니 목록 컴포넌트

**입력**: Supabase에서 사용자의 바구니 데이터 조회

**출력**: 테마 목록 (이름, 거래량, 삭제 버튼, 클릭 시 종목 분석 이동)

**동작 흐름**
1. 페이지 진입 시 Supabase에서 `basket_themes` JOIN `themes` 조회
2. 테마 목록 표시 (각 항목: 테마명, 거래량, "삭제" 버튼)
3. 테마 클릭 시 해당 테마의 종목 분석 화면으로 이동
4. "삭제" 클릭 시 `basket_themes`에서 해당 레코드 삭제

**에러 처리**
- 바구니 비어있음: "아직 담긴 테마가 없습니다. 테마를 추가해보세요." + 테마 분석 페이지 링크
- 삭제 실패: 토스트 메시지 "삭제에 실패했습니다."

**인수 조건**
- ✅ 사용자의 바구니에 담긴 테마 목록이 표시된다
- ✅ "삭제" 클릭 시 즉시 목록에서 제거된다
- ✅ 테마 클릭 시 종목 분석 화면으로 이동한다
- ✅ 빈 바구니 상태가 적절히 처리된다

**의존성**: Agent 3 Skill 3-2 (Supabase 바구니 CRUD)

**참조 문서**: `docs/03_UserFlow.md` 섹션 3.3

---

### Skill 1-5: 종목 데이터 테이블

**목적**: 테마별 종목을 11개 지표로 표시하고, 엑셀처럼 다중 정렬 가능한 테이블 제공

**파일**
- `components/features/StockTable.tsx` — 종목 테이블 컴포넌트

**입력**: 종목 배열 (대장주 5 + ETF 3, 각 11개 지표 포함)

**출력**: 다중 정렬 가능한 데이터 테이블

**11개 지표 컬럼**
1. 미니 차트 (스파크라인)
2. 기준가 (현재가) — `font-mono`, 상승 초록 / 하락 빨강
3. 거래량 — `font-mono`
4. 시가총액 — `font-mono`
5. 외국인 거래량 — `font-mono`
6. 기관 거래량 — `font-mono`
7. 개인 거래량 — `font-mono`
8. PER — `font-mono`
9. PBR — `font-mono`
10. 동일업종 PER — `font-mono`
11. 배당수익률 — `font-mono`

**정렬 로직**
- 헤더 클릭: 단일 정렬 (오름차순 → 내림차순 → 정렬 해제)
- Shift + 헤더 클릭: 다중 정렬 (기존 정렬에 추가)
- 정렬 상태: `sortColumns: Array<{ key: string, direction: 'asc' | 'desc' }>`
- 정렬 아이콘: ↑ (오름차순), ↓ (내림차순)

**에러 처리**
- 데이터 로딩 실패: 테이블 영역에 에러 메시지 표시
- 데이터 없음: "이 테마에 속한 종목이 없습니다."

**인수 조건**
- ✅ 11개 지표 컬럼이 모두 표시된다
- ✅ 헤더 클릭으로 단일 정렬이 작동한다
- ✅ Shift + 클릭으로 다중 정렬이 작동한다
- ✅ 숫자 데이터에 `Roboto Mono` 폰트가 적용된다
- ✅ 모바일: 가로 스크롤 + 첫 번째 열(종목명) 고정
- ✅ 행 클릭 시 `/stocks/[code]`로 이동한다

**의존성**: Agent 2 Skill 2-2 (`GET /api/themes/{id}/stocks`)

**참조 문서**: `docs/05_DesignSystem.md` 섹션 4.4, `docs/01_PRD.md` 섹션 4 (FEAT-2)

---

### Skill 1-6: 종목 상세 차트

**목적**: 선택한 종목의 캔들스틱 차트 (기준가 + 이동평균선 + 거래량) 표시

**파일**
- `app/stocks/[code]/page.tsx` — 종목 상세 페이지
- `components/features/StockChart.tsx` — 차트 컴포넌트

**입력**: 종목 코드 (URL 파라미터), OHLCV 히스토리 데이터

**출력**: 인터랙티브 캔들스틱 차트

**차트 구성**
- 캔들스틱: 양봉 `#10B981`, 음봉 `#EF4444`
- 이동평균선: 5일/20일/60일 — `#F59E0B`
- 거래량: 하단 막대 차트 (상승일 초록, 하락일 빨강, 투명도 50%)
- 그리드: `#374151`
- 기간 선택 버튼: 1일, 1주, 1개월, 3개월

**기술 구현**
- `next/dynamic`으로 동적 임포트 (`ssr: false`)
- Recharts 또는 TradingView Lightweight Charts 사용
- 반응형: width 100%, 높이는 뷰포트에 맞춰 조정

**에러 처리**
- 차트 데이터 로딩 실패: 스켈레톤 UI 유지 + "차트를 불러올 수 없습니다." 메시지
- 데이터 부족 (상장 초기): 가용한 기간만 표시

**인수 조건**
- ✅ 캔들스틱 + 이동평균선 + 거래량이 Design System 색상대로 표시된다
- ✅ 기간 변경 시 차트가 즉시 업데이트된다
- ✅ 모바일에서도 반응형으로 표시된다
- ✅ 차트 로딩 시 스켈레톤 UI가 표시된다 (SSR 비활성화)

**의존성**: Agent 2 Skill 2-2 (`GET /api/stocks/{code}`)

**참조 문서**: `docs/05_DesignSystem.md` 섹션 10

---

### Skill 1-7: 종목 뉴스 표시

**목적**: 종목 관련 최신 뉴스 5건을 리스트로 표시

**파일**
- `components/features/StockNews.tsx` — 뉴스 리스트 컴포넌트

**입력**: 종목 코드

**출력**: 뉴스 5건 리스트 (제목, 출처, 날짜, 외부 링크)

**동작 흐름**
1. `GET /api/stocks/{code}/news` 호출
2. 뉴스 5건을 리스트로 표시
3. 각 항목: 제목 (링크), 출처 배지, 상대 시간 (예: "2시간 전")
4. 클릭 시 새 탭에서 원문 열기 (`target="_blank" rel="noopener noreferrer"`)

**에러 처리**
- 뉴스 없음: "관련 뉴스가 없습니다."
- API 실패: "뉴스를 불러올 수 없습니다."

**인수 조건**
- ✅ 최신 뉴스 5건이 표시된다
- ✅ 클릭 시 새 탭에서 원문이 열린다
- ✅ 뉴스가 없을 때 적절한 메시지가 표시된다

**의존성**: Agent 2 Skill 2-3 (`GET /api/stocks/{code}/news`)

**참조 문서**: `docs/03_UserFlow.md` 섹션 3.4

---

### Skill 1-8: 반응형 레이아웃

**목적**: 모든 페이지에 공통 적용되는 레이아웃, 네비게이션, 보호된 라우트 제공

**파일**
- `app/layout.tsx` — 공통 레이아웃
- `components/Navbar.tsx` — 네비게이션 바
- `middleware.ts` — 라우트 보호

**레이아웃 구성**
- 데스크톱 (≥1024px): 상단 고정 Navbar + 수평 링크
- 모바일 (<1024px): 햄버거 아이콘 + 슬라이드 아웃 드로어
- 링크: "테마 분석" (`/themes`), "바구니" (`/basket`)
- 현재 페이지 하이라이트: `--color-primary` 밑줄
- 바구니 아이템 수 배지 (Zustand 상태)
- 로그아웃 버튼

**보호된 라우트**
- `middleware.ts`에서 세션 확인
- 미인증 시 `/login`으로 리다이렉트
- 허용 경로: `/login`, `/auth/callback`

**인수 조건**
- ✅ Navbar가 모든 페이지에 표시된다
- ✅ 현재 페이지가 하이라이트된다
- ✅ 모바일에서 햄버거 메뉴가 작동한다
- ✅ 미인증 사용자가 보호된 페이지 접근 시 `/login`으로 이동한다

**의존성**: Agent 3 Skill 3-1 (세션 관리)

**참조 문서**: `docs/05_DesignSystem.md` 섹션 7, `docs/03_UserFlow.md` 섹션 7

---

## 3. Agent 2: FastAPI Backend Agent

### 3.1 개요

- **역할**: 증권 데이터를 수집·가공하여 RESTful API로 제공한다
- **기술**: Python FastAPI, pykrx, FinanceDataReader, httpx
- **참조**: `docs/02_TRD.md`, `docs/04_DatabaseDesign.md`

---

### Skill 2-1: 테마 수집

**목적**: pykrx를 사용하여 한국 증시 테마 데이터를 수집하고 정렬하여 제공

**파일**
- `api/routers/themes.py` — 테마 라우터
- `api/services/theme_service.py` — 테마 수집 비즈니스 로직

**엔드포인트**
| 경로 | 메서드 | 파라미터 | 설명 | 응답 시간 |
|---|---|---|---|---|
| `/api/themes` | GET | `sort=volume\|surge` | 상위 5개 테마 | 3초 이내 |
| `/api/themes/search` | GET | `q={검색어}` | 테마 검색 | 2초 이내 |

**응답 형식**
```json
{
  "themes": [
    {
      "id": 1,
      "name": "2차전지",
      "code": "TH001",
      "trading_volume": 15234567890,
      "surge_stock_count": 8,
      "updated_at": "2026-02-10T15:30:00"
    }
  ]
}
```

**에러 응답**
```json
{
  "error": {
    "code": "THEME_FETCH_FAILED",
    "message": "테마 데이터를 불러오는 데 실패했습니다.",
    "details": "pykrx API timeout"
  }
}
```

**대체 전략**: pykrx 실패 시 → FinanceDataReader로 자동 전환

**인수 조건**
- ✅ `sort=volume`: 거래량 상위 5개 테마 반환
- ✅ `sort=surge`: 급등주 많은 5개 테마 반환
- ✅ 응답 시간 3초 이내
- ✅ pykrx 실패 시 FinanceDataReader로 대체

**참조 문서**: `docs/02_TRD.md` 섹션 7

---

### Skill 2-2: 종목 수집

**목적**: 테마별 대장주 5개 + ETF 3개를 11개 지표와 함께 수집

**파일**
- `api/routers/stocks.py` — 종목 라우터
- `api/services/stock_service.py` — 종목 수집 비즈니스 로직

**엔드포인트**
| 경로 | 메서드 | 설명 | 응답 시간 |
|---|---|---|---|
| `/api/themes/{id}/stocks` | GET | 테마별 종목 (대장주 5 + ETF 3) | 5초 이내 |
| `/api/stocks/{code}` | GET | 종목 상세 + OHLCV 히스토리 | 2초 이내 |

**11개 지표 수집 방법 (pykrx)**
| 지표 | pykrx 함수 |
|---|---|
| 기준가, 거래량 | `stock.get_market_ohlcv_by_date()` |
| 시가총액 | `stock.get_market_cap_by_ticker()` |
| 외국인/기관/개인 거래량 | `stock.get_market_trading_value_by_investor()` |
| PER, PBR, 배당수익률 | `stock.get_market_fundamental_by_ticker()` |
| 동일업종 PER | 업종 분류 후 평균 계산 |

**인수 조건**
- ✅ 테마별 대장주 5개 + ETF 3개 반환
- ✅ 각 종목에 11개 지표 포함
- ✅ 종목 상세에 OHLCV 히스토리 데이터 포함 (차트용)
- ✅ 응답 시간: 테마별 5초, 종목 상세 2초

**참조 문서**: `docs/04_DatabaseDesign.md` 섹션 2.3, 2.4

---

### Skill 2-3: 뉴스 수집

**목적**: 종목별 최신 뉴스를 외부 API에서 수집하여 제공

**파일**
- `api/routers/news.py` — 뉴스 라우터
- `api/services/news_service.py` — 뉴스 수집 비즈니스 로직

**엔드포인트**
| 경로 | 메서드 | 설명 | 응답 시간 |
|---|---|---|---|
| `/api/stocks/{code}/news` | GET | 종목 관련 뉴스 5건 | 3초 이내 |

**수집 전략**
1. **Primary**: Naver 검색 API (`openapi.naver.com/v1/search/news.json`)
   - 쿼리: 종목명 (예: "삼성전자")
   - 환경 변수: `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`
2. **Fallback**: Google News RSS (`news.google.com/rss/search?q={종목명}`)
   - `feedparser` 라이브러리로 파싱

**응답 형식**
```json
{
  "news": [
    {
      "title": "삼성전자, AI 반도체 투자 확대",
      "link": "https://...",
      "description": "삼성전자가 AI 반도체에 10조원...",
      "published_at": "2026-02-10T10:30:00",
      "source": "한국경제"
    }
  ]
}
```

**인수 조건**
- ✅ 최신 뉴스 5건 반환
- ✅ Naver API 실패 시 Google News로 대체
- ✅ 응답 시간 3초 이내

**참조 문서**: `docs/02_TRD.md` 섹션 2

---

### Skill 2-4: 데이터 정렬·필터링

**목적**: 서버 측에서 종목 데이터를 다중 컬럼으로 정렬하고 필터링

**파일**
- `api/services/sort_service.py` — 정렬·필터링 서비스

**기능**
- 다중 컬럼 정렬: `sort_by=volume,price&order=desc,asc`
- 종목 타입 필터: `type=stock` 또는 `type=ETF`
- 테마별 필터: `theme_id={id}`

**인수 조건**
- ✅ 다중 컬럼 정렬 파라미터가 올바르게 처리된다
- ✅ 종목 타입 필터가 작동한다

**참조 문서**: `docs/04_DatabaseDesign.md` 섹션 5

---

### Skill 2-5: 에러 핸들링 & 대체 API

**목적**: 모든 API 엔드포인트의 에러를 일관된 형식으로 처리하고, 장애 시 대체 API로 전환

**파일**
- `api/middleware/error_handler.py` — 글로벌 에러 핸들러

**에러 응답 표준**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자에게 보여줄 메시지",
    "details": "디버깅용 상세 정보"
  }
}
```

**대체 API 전략**
| 주요 API | 대체 API | 전환 조건 |
|---|---|---|
| pykrx | FinanceDataReader | 응답 시간 > 5초 또는 에러 |
| Naver 검색 API | Google News RSS | API 에러 또는 할당량 초과 |

**CORS 설정**
```python
allow_origins=["http://localhost:3000", "https://{railway-domain}"]
# 와일드카드(*) 사용 금지
```

**인수 조건**
- ✅ 모든 에러가 표준 JSON 형식으로 반환된다
- ✅ pykrx 장애 시 FinanceDataReader로 자동 전환된다
- ✅ CORS가 허용된 도메인만 접근 가능하다

**참조 문서**: `docs/02_TRD.md` 섹션 7, `docs/07_CodingConvention.md` 섹션 5.2

---

## 4. Agent 3: Supabase Agent

### 4.1 개요

- **역할**: 데이터베이스, 인증, 행 수준 보안(RLS)을 관리한다
- **기술**: Supabase (PostgreSQL + Auth + RLS + Functions)
- **참조**: `docs/04_DatabaseDesign.md`, `docs/02_TRD.md`

---

### Skill 3-1: 소셜 인증

**목적**: 구글/카카오 OAuth를 통한 소셜 로그인 및 세션 관리

**구현 위치**
- Supabase Dashboard: Authentication > Providers
- `app/auth/callback/route.ts` — OAuth 콜백

**설정 항목**
| 제공자 | 필요 설정 |
|---|---|
| Google | Google Cloud Console에서 OAuth 2.0 클라이언트 ID/Secret 생성 |
| Kakao | Kakao Developers에서 앱 생성, 로그인 활성화, REST API 키 설정 |

**리다이렉트 URL**: `{SUPABASE_URL}/auth/v1/callback`

**인수 조건**
- ✅ 구글 로그인이 정상 작동한다
- ✅ 카카오 로그인이 정상 작동한다
- ✅ 로그인 후 `users` 테이블에 사용자 정보가 저장된다
- ✅ 세션이 유지된다 (새로고침 후에도)

**참조 문서**: `docs/02_TRD.md` 섹션 5

---

### Skill 3-2: 바구니 CRUD

**목적**: 사용자 바구니의 생성, 조회, 테마 추가/삭제를 Supabase 클라이언트로 처리

**구현 위치**: `lib/supabase.ts`를 통해 클라이언트에서 직접 호출

**CRUD 연산**
| 연산 | SQL | 설명 |
|---|---|---|
| 바구니 생성 | `INSERT INTO baskets (user_id, name)` | 첫 로그인 시 자동 생성 |
| 테마 추가 | `INSERT INTO basket_themes (basket_id, theme_id)` | 중복 방지 UNIQUE 제약 |
| 목록 조회 | `SELECT ... FROM basket_themes JOIN themes` | 바구니의 테마 목록 |
| 테마 삭제 | `DELETE FROM basket_themes WHERE ...` | 바구니에서 테마 제거 |

**인수 조건**
- ✅ RLS에 의해 본인 바구니만 접근 가능하다
- ✅ 같은 테마를 중복 추가할 수 없다
- ✅ 바구니 삭제 시 `basket_themes`도 CASCADE 삭제된다

**참조 문서**: `docs/04_DatabaseDesign.md` 섹션 2.5, 2.6

---

### Skill 3-3: RLS 보안

**목적**: 행 수준 보안(RLS)으로 사용자 데이터를 보호

**구현 위치**: Supabase SQL Editor

**RLS 정책 요약**
| 테이블 | 정책 | 조건 |
|---|---|---|
| `users` | 본인 조회/수정 | `auth.uid() = id` |
| `themes` | 모든 사용자 읽기 | `true` |
| `stocks` | 모든 사용자 읽기 | `true` |
| `stock_details` | 모든 사용자 읽기 | `true` |
| `baskets` | 본인 CRUD | `auth.uid() = user_id` |
| `basket_themes` | 본인 바구니만 | `basket_id IN (SELECT id FROM baskets WHERE user_id = auth.uid())` |
| `reports` | 본인 CRUD | `auth.uid() = user_id` |

**인수 조건**
- ✅ 미인증 사용자가 바구니/보고서에 접근 불가
- ✅ 다른 사용자의 바구니/보고서에 접근 불가
- ✅ 테마/종목 데이터는 누구나 읽을 수 있다

**참조 문서**: `docs/04_DatabaseDesign.md` 전체, `docs/02_TRD.md` 섹션 5

---

### Skill 3-4: 보고서 저장 (FEAT-3 준비)

**목적**: AI 보고서 저장을 위한 DB 스키마를 미리 생성 (v2.0 대비)

**구현 위치**: Supabase SQL Editor

**테이블**: `reports`
- `expires_at`: 생성일 + 90일
- 자동 삭제 함수: `delete_expired_reports()` (Agent 4 Skill 4-2에서 실행)

**인수 조건**
- ✅ `reports` 테이블이 생성된다
- ✅ RLS 정책이 적용된다 (본인 보고서만)
- ✅ `delete_expired_reports()` 함수가 생성된다

**참조 문서**: `docs/04_DatabaseDesign.md` 섹션 2.7

---

## 5. Agent 4: Scheduler Agent

### 5.1 개요

- **역할**: 증권 데이터를 주기적으로 갱신하고, 만료 데이터를 자동 삭제한다
- **기술**: APScheduler (Python), Supabase Function (pg_cron)
- **참조**: `docs/04_DatabaseDesign.md` 섹션 3, `docs/07_CodingConvention.md` 섹션 8

---

### Skill 4-1: 주기적 데이터 갱신

**목적**: 장중에는 5분마다, 장마감 후에는 1회 최종 데이터를 갱신

**파일**
- `api/scheduler.py` — 스케줄러 설정

**스케줄 규칙**
| 시간대 | 주기 | 작업 |
|---|---|---|
| 09:00~15:30 (장중) | 5분 간격 | 테마 거래량, 종목 가격/거래량/시가총액 업데이트 |
| 15:40 (장마감 후) | 1회 | 최종 데이터 + PER/PBR/배당수익률/투자자별 거래량 업데이트 |

**구현 예시**
```python
from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()

# 장중 5분마다 실행
scheduler.add_job(
    refresh_market_data,
    'interval',
    minutes=5,
    start_date='09:00',
    end_date='15:30'
)

# 장마감 후 1회 실행
scheduler.add_job(
    refresh_final_data,
    'cron',
    hour=15,
    minute=40
)
```

**인수 조건**
- ✅ 장중 5분 간격으로 데이터가 갱신된다
- ✅ 장마감 후 최종 데이터가 업데이트된다
- ✅ Agent 2의 서비스 함수를 재사용한다

**의존성**: Agent 2 Skills 2-1, 2-2 (서비스 함수)

**참조 문서**: `docs/04_DatabaseDesign.md` 섹션 3.1

---

### Skill 4-2: 만료 데이터 삭제

**목적**: 90일이 지난 보고서를 자동 삭제

**구현 위치**: Supabase SQL Function + pg_cron

**실행 주기**: 매일 00:00 (자정)

**SQL 함수**
```sql
CREATE OR REPLACE FUNCTION delete_expired_reports()
RETURNS void AS $$
BEGIN
  DELETE FROM reports WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

**인수 조건**
- ✅ 만료된 보고서가 자동 삭제된다
- ✅ 매일 자정에 실행된다

**참조 문서**: `docs/04_DatabaseDesign.md` 섹션 2.7, `docs/07_CodingConvention.md` 섹션 8.1

---

## 6. 구현 순서 (마일스톤 매핑)

| 마일스톤 | Agent | Skills | 산출물 |
|---|---|---|---|
| M0 | 1, 2, 3 | - | 프로젝트 초기화, 폴더 구조 |
| M1 | 1 | 1-8 (부분) | 디자인 토큰, UI 컴포넌트, Navbar, 레이아웃 |
| M2 | 1, 3 | 1-1, 1-8, 3-1 | 소셜 로그인, 보호된 라우트 |
| M3 | 1, 2, 3, 4 | 전체 19개 | DB, API, 프론트엔드, 스케줄러 |
| M4 | 전체 | 전체 | 통합 테스트, Railway 배포 |

---

## 7. Agent 간 통신 규약

### 7.1 Frontend ↔ Backend (HTTP REST)

- **프로토콜**: HTTP/HTTPS
- **형식**: JSON
- **인증**: 없음 (MVP 단계, 추후 JWT 추가 가능)
- **타임아웃**: 10초
- **CORS**: 허용 도메인만 (`localhost:3000`, Railway 도메인)

### 7.2 Frontend ↔ Supabase (클라이언트 SDK)

- **프로토콜**: HTTPS (Supabase SDK)
- **인증**: Supabase Auth 세션 토큰 (자동 관리)
- **RLS**: 모든 요청에 사용자 세션 기반 접근 제어 적용

### 7.3 Backend ↔ Supabase (서버 SDK)

- **프로토콜**: HTTPS (supabase-py)
- **인증**: `service_role` 키 (서버 전용, RLS 우회)
- **용도**: 스케줄러에서 데이터 일괄 업데이트

### 7.4 Scheduler → Backend (내부 함수 호출)

- **방식**: 같은 Python 프로세스 내 직접 함수 호출
- **Agent 4는 Agent 2의 서비스 함수를 import하여 사용**
