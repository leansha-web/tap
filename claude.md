# TAP (Theme Analysis Program) - AI 코딩 가이드

## 프로젝트 개요

- **프로젝트명**: Theme Analysis Program (TAP)
- **목적**: 주식 투자자를 위한 테마별 종목 흐름 분석 도구
- **한 줄 요약**: 테마별 종목을 11개 지표로 다중 정렬·비교하여 대장주를 빠르게 식별하는 웹 서비스

---

## 코딩 규칙 (필수 준수)

### 1. 한국어 주석 사용

- 모든 주석은 **한국어**로 작성한다
- 변수명, 함수명은 영어를 사용하되, 주석으로 한국어 설명을 반드시 달아야 한다
- JSDoc / Python docstring도 한국어로 작성한다

```typescript
// ✅ 좋은 예
/**
 * 테마 목록을 서버에서 가져오는 함수
 * @param sort - 정렬 기준 ('volume': 거래량, 'surge': 급등주)
 * @returns 테마 배열 (최대 5개)
 */
async function fetchThemes(sort: 'volume' | 'surge'): Promise<Theme[]> {
  // API 서버에 테마 목록 요청
  const response = await fetch(`/api/themes?sort=${sort}`);
  // JSON 형태로 변환하여 반환
  return await response.json();
}
```

```python
# ✅ 좋은 예
async def get_themes(sort: str = "volume"):
    """
    테마 목록을 거래량 또는 급등주 기준으로 조회하는 함수

    Args:
        sort: 정렬 기준 ('volume' = 거래량, 'surge' = 급등주)

    Returns:
        상위 5개 테마 리스트
    """
    # pykrx에서 테마 데이터 가져오기
    themes = fetch_themes_from_api(sort)
    return themes
```

### 2. 초보자가 이해하기 쉬운 코드 작성

- 변수명과 함수명은 **의미가 명확하게** 작성한다 (약어 사용 금지)
- 한 함수는 **하나의 역할만** 수행한다 (단일 책임 원칙)
- 복잡한 로직은 **작은 단계로 분리**하여 가독성을 높인다
- **삼항 연산자 중첩 금지** — if/else를 사용한다
- **any 타입 사용 금지** — 반드시 구체적 타입을 정의한다

```typescript
// ✅ 좋은 예: 의미 있는 변수명과 단순한 구조
const themeList = await fetchThemes('volume');  // 거래량 기준 테마 목록
const topFiveThemes = themeList.slice(0, 5);    // 상위 5개만 추출

// ❌ 나쁜 예: 약어와 복잡한 표현
const t = await f('v');
const r = t.slice(0, 5);
```

### 3. 코드마다 설명 주석 달기

- **모든 함수** 위에 JSDoc/docstring으로 설명을 작성한다
- **복잡한 로직**에는 단계별 인라인 주석을 단다
- **왜(Why)** 이 코드가 필요한지 설명한다 (무엇(What)보다 중요)
- **타입 정의**에도 각 필드별 주석을 단다

```typescript
// ✅ 좋은 예: 타입에 주석 달기
interface Theme {
  id: number;              // 테마 고유 ID
  name: string;            // 테마 이름 (예: "2차전지", "AI")
  trading_volume: number;  // 테마 전체 거래량 (합산)
  surge_stock_count: number; // 급등주 개수 (전일 대비 상승 종목 수)
}
```

---

## 기술 스택

### 프론트엔드

| 항목 | 기술 | 용도 |
|---|---|---|
| 프레임워크 | Next.js 14 (App Router) | 반응형 웹 애플리케이션 |
| 언어 | TypeScript (strict 모드) | 타입 안정성 |
| 스타일 | Tailwind CSS + shadcn/ui | 다크 모드 기반 UI |
| 차트 | Recharts 또는 TradingView Lightweight Charts | 주식 차트 |
| 상태 관리 | Zustand | 클라이언트 상태 관리 |
| 데이터 페칭 | SWR 또는 React Query | API 캐싱 및 데이터 동기화 |

### 백엔드

| 항목 | 기술 | 용도 |
|---|---|---|
| 프레임워크 | Python FastAPI | 증권 데이터 API 서버 |
| 증권 데이터 | pykrx, FinanceDataReader | 한국 주식 데이터 수집 |
| 뉴스 API | Google News API / Naver 검색 API | 테마·종목 뉴스 |
| AI API | OpenAI GPT-4 또는 Google Gemini | AI 보고서 생성 (FEAT-3, 후순위) |

### 인프라

| 항목 | 기술 | 용도 |
|---|---|---|
| 데이터베이스 | Supabase (PostgreSQL) | 데이터 저장, RLS 보안 |
| 인증 | Supabase Auth | 구글/카카오 소셜 로그인 |
| 배포 | Railway | Next.js + FastAPI 동시 배포 |

---

## 폴더 구조

```
tap/
├── app/                    # Next.js App Router (페이지)
│   ├── themes/             # 테마 분석 페이지
│   ├── basket/             # 바구니 페이지
│   ├── stocks/[code]/      # 종목 상세 페이지
│   ├── login/              # 로그인 페이지
│   └── layout.tsx          # 공통 레이아웃 (Navbar 포함)
├── components/
│   ├── ui/                 # 재사용 UI 컴포넌트 (Button, Input, Card)
│   └── features/           # 기능별 컴포넌트 (StockTable, ThemeCard)
├── lib/
│   ├── supabase.ts         # Supabase 클라이언트 초기화
│   ├── api.ts              # FastAPI 호출 유틸리티 함수
│   └── utils.ts            # 공통 유틸리티 함수
├── api/                    # Python FastAPI 백엔드
│   ├── main.py             # FastAPI 앱 진입점
│   ├── routers/            # API 라우터 (themes.py, stocks.py)
│   └── services/           # 비즈니스 로직 (stock_service.py)
├── public/                 # 정적 파일 (이미지, 아이콘)
└── docs/                   # 프로젝트 문서 (PRD, TRD 등)
```

---

## 디자인 시스템 (다크 모드 기반)

### 색상 팔레트

| 역할 | 색상 코드 | CSS 변수 | 용도 |
|---|---|---|---|
| Primary | `#3B82F6` | `--color-primary` | 주요 버튼, 링크 |
| Secondary | `#8B5CF6` | `--color-secondary` | 보조 액션 |
| Surface | `#1F2937` | `--color-surface` | 카드, 패널 배경 |
| Background | `#111827` | `--color-background` | 전체 배경 |
| Text Primary | `#F9FAFB` | `--color-text-primary` | 주요 텍스트 |
| Text Secondary | `#9CA3AF` | `--color-text-secondary` | 보조 텍스트 |
| Border | `#374151` | `--color-border` | 테두리, 구분선 |
| Success (상승) | `#10B981` | `--color-success` | 주가 상승, 양봉 |
| Danger (하락) | `#EF4444` | `--color-danger` | 주가 하락, 음봉 |
| Warning | `#F59E0B` | `--color-warning` | 경고, 이동평균선 |

### 타이포그래피

- **본문**: `Inter` (sans-serif)
- **숫자/코드**: `Roboto Mono` (monospace) — 주가, 거래량 등 숫자 데이터에 사용
- **크기**: H1(32px) > H2(24px) > H3(20px) > Body(16px) > Small(14px) > Tiny(12px)

### 반응형 브레이크포인트

| 이름 | 최소 너비 | Tailwind 접두사 |
|---|---|---|
| Mobile | 0px | (기본) |
| Tablet | 640px | `sm:` |
| Desktop | 1024px | `lg:` |
| Large Desktop | 1280px | `xl:` |

---

## 데이터베이스 스키마 (Supabase PostgreSQL)

### 테이블 구조

- **users**: 사용자 정보 (Supabase Auth 연동, UUID PK)
- **themes**: 테마 정보 (이름, 거래량, 급등주 수)
- **stocks**: 종목 정보 (종목코드 PK, 테마 FK, 현재가, 거래량, 시가총액, type: stock/ETF)
- **stock_details**: 종목 상세 지표 (외국인/기관/개인 거래량, PER, PBR, 동일업종PER, 배당수익률)
- **baskets**: 사용자 바구니 (user_id FK)
- **basket_themes**: 바구니-테마 매핑 (N:M 관계, UNIQUE(basket_id, theme_id))
- **reports**: AI 보고서 (90일 후 자동 삭제, FEAT-3 후순위)

### RLS 정책 원칙

- themes, stocks, stock_details → **모든 사용자 읽기 가능**
- baskets, basket_themes, reports → **본인 데이터만 CRUD 가능** (`auth.uid() = user_id`)

---

## API 엔드포인트 (FastAPI)

| 엔드포인트 | 메서드 | 설명 | 응답 시간 목표 |
|---|---|---|---|
| `/api/themes` | GET | 테마 추천 (sort=volume 또는 surge) | 3초 이내 |
| `/api/themes/{id}/stocks` | GET | 테마별 종목 목록 (대장주 5 + ETF 3) | 5초 이내 |
| `/api/stocks/{code}` | GET | 종목 상세 정보 (11개 지표) | 2초 이내 |
| `/api/stocks/{code}/news` | GET | 종목 관련 뉴스 | 3초 이내 |
| `/api/reports` | POST | AI 보고서 생성 (FEAT-3, 후순위) | 10초 이내 |

---

## 핵심 기능 (MVP 범위)

### FEAT-1: 테마 분석 & 추천

- 거래량/급등주 기준으로 상위 5개 테마 자동 추천
- 수동 테마 추가 (검색)
- 바구니에 담기 (Supabase 클라우드 저장, 기기 간 동기화)

### FEAT-2: 종목 심층 분석 & 비교

- 테마별 대장주 5개 + ETF 3개 추천
- 11개 지표 데이터 테이블 (다중 정렬: 헤더 클릭 + Shift 클릭)
- 종목 상세 페이지: 캔들스틱 차트 (기준가, 이동평균선, 거래량) + 뉴스

### 11개 상세 지표

1. 그래프 (기준가, 이동평균선, 거래량)
2. 기준가 (현재가)
3. 거래량
4. 시가총액
5. 외국인 거래량
6. 기관 거래량
7. 개인 거래량
8. PER, PBR
9. 동일업종 PER
10. 배당수익률
11. 종목뉴스

### 제외 (후순위 v2.0)

- FEAT-3: AI 트렌드 보고서
- 포트폴리오 추적
- 백테스팅
- 알림 기능

---

## 보안 규칙

### 환경 변수

- **서버 전용 키**는 절대 `NEXT_PUBLIC_` 접두사를 붙이지 않는다
- API 키는 `.env.local` (Next.js) 또는 `.env` (Python)에만 저장한다
- `.gitignore`에 `.env*` 파일을 반드시 포함한다

### SQL 인젝션 방지

- Supabase 클라이언트의 파라미터화된 쿼리만 사용한다
- 직접 문자열 조합으로 SQL을 작성하지 않는다

### XSS 방지

- `dangerouslySetInnerHTML` 사용을 금지한다
- 사용자 입력은 React가 자동 이스케이프하도록 `{userInput}` 형태로 렌더링한다

### CORS 설정

- FastAPI에 `CORSMiddleware`를 추가하고, 허용 도메인만 명시한다
- 와일드카드(`*`) 사용을 금지한다

### Supabase RLS

- 모든 사용자 데이터 테이블에 RLS를 활성화한다
- 배포 전 RLS 정책이 정상 작동하는지 반드시 테스트한다

---

## 에러 처리 패턴

### 프론트엔드 (TypeScript)

```typescript
// 모든 API 호출은 try-catch로 감싸고, 사용자 친화적 메시지를 표시한다
async function fetchThemes(sort: 'volume' | 'surge'): Promise<Theme[]> {
  try {
    // API 서버에 테마 목록 요청
    const response = await fetch(`${API_URL}/api/themes?sort=${sort}`);

    // 응답 상태가 실패인 경우 에러 발생
    if (!response.ok) {
      throw new Error('테마를 불러오는 데 실패했습니다.');
    }

    // JSON으로 변환하여 반환
    return await response.json();
  } catch (error) {
    // 콘솔에 에러 기록 (디버깅용)
    console.error('테마 조회 실패:', error);
    // 빈 배열 반환 (UI가 깨지지 않도록)
    return [];
  }
}
```

### 백엔드 (Python)

```python
# 모든 API 엔드포인트는 try-except로 감싸고, HTTPException으로 에러를 반환한다
@app.get("/api/themes")
async def get_themes(sort: str = "volume"):
    """테마 목록을 조회하는 API 엔드포인트"""
    try:
        # 증권 API에서 테마 데이터 가져오기
        themes = fetch_themes_from_api(sort)
        return themes
    except Exception as e:
        # 로그에 에러 기록
        logger.error(f"테마 조회 실패: {e}")
        # 클라이언트에 에러 메시지 반환
        raise HTTPException(
            status_code=500,
            detail="테마 데이터를 불러오는 데 실패했습니다."
        )
```

---

## 성능 최적화 규칙

- **차트 지연 로딩**: `next/dynamic`으로 차트 컴포넌트를 동적 임포트한다 (SSR 비활성화)
- **데이터 캐싱**: SWR/React Query로 API 응답을 캐싱한다 (테마 목록: 5분)
- **이미지 최적화**: `next/image` 컴포넌트만 사용한다 (`<img>` 태그 사용 금지)
- **DB 쿼리 최적화**: `SELECT *` 금지, 필요한 컬럼만 선택한다
- **인덱스 활용**: 자주 조회되는 컬럼(trading_volume, theme_id 등)에 인덱스를 설정한다

---

## 컴포넌트 작성 규칙

### UI 컴포넌트 (`components/ui/`)

- 비즈니스 로직을 포함하지 않는다
- props로만 제어한다 (외부 상태 의존 금지)
- 접근성 속성(aria-label, focus ring)을 반드시 포함한다

### 기능 컴포넌트 (`components/features/`)

- 하나의 기능만 담당한다 (단일 책임)
- 로딩 상태와 에러 상태를 반드시 처리한다

### 페이지 컴포넌트 (`app/`)

- 데이터 페칭과 레이아웃 조합만 담당한다
- 비즈니스 로직은 `lib/` 또는 `components/features/`로 분리한다

---

## 접근성 (필수)

- 모든 인터랙티브 요소에 **키보드 탐색** 지원 (Tab 키)
- 아이콘 버튼에 **`aria-label`** 추가
- 색상 대비 **WCAG AA 기준 (4.5:1)** 충족
- 색상만으로 정보를 전달하지 않는다 (상승/하락에 아이콘도 함께 사용)
- 포커스 시 **`ring-2`** 시각적 표시

---

## Git 규칙

### 브랜치 전략

```
main (프로덕션) ← develop (개발) ← feature/feat-1 (기능 개발)
```

### 커밋 메시지

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅 (기능 변경 없음)
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드, 의존성 업데이트
```

---

## 마일스톤 (개발 순서)

1. **M0**: 프로젝트 초기화 — Next.js + Supabase + FastAPI 세팅
2. **M1**: 디자인 시스템 + 공통 UI + 레이아웃/네비게이션
3. **M2**: Supabase Auth 소셜 로그인 + 보호된 라우트
4. **M3**: 핵심 기능 — DB 스키마 → FEAT-1(테마 추천) → FEAT-2(종목 분석·차트)
5. **M4**: Railway 배포 + 통합 테스트

---

## 참조 문서

| 문서 | 경로 | 내용 |
|---|---|---|
| PRD | `docs/01_PRD.md` | 제품 요구사항, 사용자 스토리, MVP 범위 |
| TRD | `docs/02_TRD.md` | 기술 스택, 아키텍처, 비기능적 요구사항 |
| User Flow | `docs/03_UserFlow.md` | 사용자 흐름도, 화면별 플로우, 에러 처리 |
| Database Design | `docs/04_DatabaseDesign.md` | ERD, 테이블 상세, 인덱싱 전략, RLS 정책 |
| Design System | `docs/05_DesignSystem.md` | 색상, 타이포그래피, UI 컴포넌트 스타일 |
| Tasks | `docs/06_TASKS.md` | 마일스톤별 상세 태스크, 인수 조건 |
| Coding Convention | `docs/07_CodingConvention.md` | 코딩 규칙, 보안, 성능, AI 협업 가이드 |
