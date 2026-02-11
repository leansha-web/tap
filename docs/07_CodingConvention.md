# Coding Convention & AI Collaboration Guide

**프로젝트**: Theme Analysis Program (TAP)  
**버전**: v1.0  
**작성일**: 2026-02-10  
**목표**: AI 코딩 파트너가 고품질의 유지보수 가능하며 안전한 코드를 일관되게 생성하도록 돕는 핵심 규칙과 모범 사례 정의

---

## 1. 핵심 원칙

### "신뢰하되, 검증하라 (Trust, but Verify)"

AI가 생성한 코드는 항상 다음을 확인하세요:

- ✅ **보안 취약점**: API 키 노출, SQL 인젝션, XSS 공격 등
- ✅ **성능**: 불필요한 반복문, 비효율적 쿼리, 메모리 누수
- ✅ **접근성**: ARIA 라벨, 키보드 탐색, 색상 대비
- ✅ **에러 처리**: try-catch, 사용자 친화적 에러 메시지
- ✅ **타입 안정성**: TypeScript 타입 에러 없음

---

## 2. 프로젝트 설정 및 기술 스택

### 2.1 Next.js 설정

#### tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    },
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "incremental": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

#### package.json 스크립트

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

---

### 2.2 Python 설정

#### requirements.txt

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pykrx==1.0.40
python-dotenv==1.0.0
httpx==0.25.0
```

#### .env 예시

```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJxxx

# OpenAI (FEAT-3용)
OPENAI_API_KEY=sk-xxx

# Naver API (뉴스 검색용)
NAVER_CLIENT_ID=xxx
NAVER_CLIENT_SECRET=xxx
```

---

### 2.3 버전 관리 원칙

- **Node.js**: 18 이상 (LTS 권장)
- **Python**: 3.10 이상
- **의존성 업데이트**: 월 1회 `npm outdated`, `pip list --outdated` 확인
- **보안 패치**: 즉시 적용 (`npm audit fix`, `pip-audit`)

---

## 3. 아키텍처 및 모듈성

### 3.1 폴더 구조

```
tap/
├── app/                    # Next.js App Router
│   ├── themes/             # 테마 분석 페이지
│   ├── basket/             # 바구니 페이지
│   ├── stocks/[code]/      # 종목 상세 페이지
│   ├── login/              # 로그인 페이지
│   └── layout.tsx          # 공통 레이아웃
├── components/
│   ├── ui/                 # 재사용 UI 컴포넌트 (Button, Input, Card)
│   └── features/           # 기능별 컴포넌트 (StockTable, ThemeCard)
├── lib/
│   ├── supabase.ts         # Supabase 클라이언트
│   ├── api.ts              # API 호출 유틸리티
│   └── utils.ts            # 유틸리티 함수
├── api/                    # Python FastAPI
│   ├── main.py             # FastAPI 앱
│   ├── routers/            # API 라우터 (themes.py, stocks.py)
│   └── services/           # 비즈니스 로직 (stock_service.py)
├── public/                 # 정적 파일
└── docs/                   # 프로젝트 문서
```

---

### 3.2 컴포넌트 분리 원칙

#### UI 컴포넌트 (`components/ui/`)
- **목적**: 재사용 가능, 비즈니스 로직 없음
- **예시**: `Button.tsx`, `Input.tsx`, `Card.tsx`
- **규칙**: props로만 제어, 외부 상태 의존 금지

```tsx
// ✅ 좋은 예
export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}

// ❌ 나쁜 예 (외부 상태 의존)
export function Button({ children }: ButtonProps) {
  const { user } = useAuth(); // UI 컴포넌트에서 비즈니스 로직 사용 금지
  return <button>{user ? children : 'Login'}</button>;
}
```

#### 기능 컴포넌트 (`components/features/`)
- **목적**: 특정 기능에 종속, 비즈니스 로직 포함 가능
- **예시**: `StockTable.tsx`, `ThemeCard.tsx`
- **규칙**: 단일 책임 원칙, 하나의 기능만 담당

---

### 3.3 페이지 컴포넌트 (`app/`)
- **목적**: 라우팅, 데이터 페칭, 레이아웃 조합
- **규칙**: 비즈니스 로직은 최소화, `lib/` 또는 `components/features/`로 분리

```tsx
// ✅ 좋은 예
export default async function ThemesPage() {
  const themes = await fetchThemes(); // lib/api.ts에서 가져옴
  
  return (
    <div>
      <h1>테마 분석</h1>
      <ThemeList themes={themes} /> {/* components/features/ThemeList.tsx */}
    </div>
  );
}

// ❌ 나쁜 예 (페이지에 비즈니스 로직 직접 작성)
export default function ThemesPage() {
  const [themes, setThemes] = useState([]);
  
  useEffect(() => {
    fetch('/api/themes').then(res => res.json()).then(setThemes); // 이 로직은 lib/api.ts로 분리
  }, []);
  
  return <div>{/* ... */}</div>;
}
```

---

## 4. AI 소통 원칙 (프롬프트 엔지니어링)

### 4.1 효과적인 지시 방법

#### ❌ 나쁜 예
> "테마 페이지 만들어줘"

#### ✅ 좋은 예
> "PRD의 FEAT-1과 User Flow 문서를 참조하여, `/app/themes/page.tsx`에 테마 추천 페이지를 만들어줘. 거래량/급등주 옵션을 라디오 버튼으로 제공하고, FastAPI `/api/themes` 엔드포인트를 호출하여 추천 테마 5개를 카드 형태로 표시해. Design System의 카드 스타일을 따르고, 로딩 상태도 추가해줘."

---

### 4.2 프롬프트 체크리스트

- ✅ **참조 문서 명시**: PRD, TRD, User Flow, Design System 등
- ✅ **구체적 요구사항**: 파일 경로, 컴포넌트 이름, API 엔드포인트
- ✅ **디자인 가이드**: Design System 참조
- ✅ **예외 처리**: 에러 상황, 로딩 상태
- ✅ **테스트 조건**: 인수 조건 명시

---

### 4.3 반복 개선 전략

1. **첫 번째 시도**: 기본 기능 구현
2. **검토**: 인수 조건 확인
3. **개선**: 에러 처리, 접근성, 성능 최적화
4. **최종 확인**: 모든 요구사항 충족

---

## 5. 코드 품질 및 보안

### 5.1 보안 체크리스트

#### 환경 변수 관리

```bash
# ✅ 좋은 예: 서버 전용 환경 변수
SUPABASE_SERVICE_ROLE_KEY=eyJxxx  # 클라이언트 노출 금지

# ❌ 나쁜 예: 클라이언트에 노출되는 환경 변수
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJxxx  # NEXT_PUBLIC_ 접두사 사용 금지
```

#### SQL 인젝션 방지

```typescript
// ✅ 좋은 예: 파라미터화된 쿼리
const { data } = await supabase
  .from('stocks')
  .select('*')
  .eq('code', stockCode); // Supabase가 자동으로 이스케이프 처리

// ❌ 나쁜 예: 직접 문자열 조합
const query = `SELECT * FROM stocks WHERE code = '${stockCode}'`; // SQL 인젝션 위험
```

#### XSS 방지

```tsx
// ✅ 좋은 예: React가 자동으로 이스케이프 처리
<p>{userInput}</p>

// ❌ 나쁜 예: dangerouslySetInnerHTML 사용
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // XSS 위험
```

#### CORS 설정

```python
# FastAPI CORS 설정
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://tap.vercel.app"],  # 허용된 도메인만
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

---

### 5.2 에러 처리

#### 프론트엔드 (Next.js)

```tsx
// ✅ 좋은 예: try-catch + 사용자 친화적 메시지
async function fetchThemes() {
  try {
    const response = await fetch('/api/themes');
    if (!response.ok) {
      throw new Error('테마를 불러오는 데 실패했습니다.');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    toast.error('테마를 불러오는 데 실패했습니다. 다시 시도해주세요.');
    return [];
  }
}

// ❌ 나쁜 예: 에러 무시
async function fetchThemes() {
  const response = await fetch('/api/themes');
  return await response.json(); // 에러 발생 시 앱 크래시
}
```

#### 백엔드 (FastAPI)

```python
# ✅ 좋은 예: HTTPException + 명확한 메시지
from fastapi import HTTPException

@app.get("/api/themes")
async def get_themes(sort: str = "volume"):
    try:
        themes = fetch_themes_from_api(sort)
        return themes
    except Exception as e:
        raise HTTPException(status_code=500, detail="테마 데이터를 불러오는 데 실패했습니다.")

# ❌ 나쁜 예: 에러 무시
@app.get("/api/themes")
async def get_themes(sort: str = "volume"):
    themes = fetch_themes_from_api(sort)  # 에러 발생 시 500 에러만 반환
    return themes
```

---

### 5.3 타입 안정성 (TypeScript)

```typescript
// ✅ 좋은 예: 명시적 타입 정의
interface Theme {
  id: number;
  name: string;
  trading_volume: number;
  surge_stock_count: number;
}

async function fetchThemes(): Promise<Theme[]> {
  const response = await fetch('/api/themes');
  return await response.json();
}

// ❌ 나쁜 예: any 타입 사용
async function fetchThemes(): Promise<any> {
  const response = await fetch('/api/themes');
  return await response.json();
}
```

---

## 6. 테스트 및 디버깅

### 6.1 검증 워크플로우

1. **로컬 테스트**: `npm run dev`, `uvicorn api.main:app --reload`
2. **타입 체크**: `npm run type-check`
3. **린트**: `npm run lint`
4. **빌드 테스트**: `npm run build` (배포 전 필수)

---

### 6.2 디버깅 팁

#### Next.js
- **console.log보다 React DevTools 사용**
- **Network 탭에서 API 호출 확인**
- **에러 바운더리 사용**:
  ```tsx
  <ErrorBoundary fallback={<ErrorPage />}>
    <App />
  </ErrorBoundary>
  ```

#### FastAPI
- **print보다 logging 모듈 사용**:
  ```python
  import logging
  
  logging.basicConfig(level=logging.INFO)
  logger = logging.getLogger(__name__)
  
  logger.info(f"Fetching themes with sort={sort}")
  ```

#### Supabase
- **SQL Editor에서 쿼리 직접 테스트**
- **RLS 정책 확인**: `SELECT * FROM pg_policies;`

---

## 7. 성능 최적화

### 7.1 프론트엔드 최적화

#### 이미지 최적화

```tsx
// ✅ 좋은 예: Next.js Image 컴포넌트
import Image from 'next/image';

<Image 
  src="/logo.png" 
  alt="TAP Logo" 
  width={200} 
  height={50} 
  priority 
/>

// ❌ 나쁜 예: 일반 img 태그
<img src="/logo.png" alt="TAP Logo" />
```

#### 지연 로딩

```tsx
// ✅ 좋은 예: 동적 임포트
import dynamic from 'next/dynamic';

const StockChart = dynamic(() => import('@/components/StockChart'), {
  loading: () => <Skeleton />,
  ssr: false, // 차트는 클라이언트에서만 렌더링
});
```

#### 캐싱

```typescript
// ✅ 좋은 예: SWR 또는 React Query 사용
import useSWR from 'swr';

function ThemesPage() {
  const { data, error } = useSWR('/api/themes', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1분간 캐싱
  });
  
  if (error) return <ErrorPage />;
  if (!data) return <Loading />;
  
  return <ThemeList themes={data} />;
}
```

---

### 7.2 백엔드 최적화

#### 데이터베이스 쿼리 최적화

```python
# ✅ 좋은 예: 필요한 컬럼만 선택
SELECT code, name, price, trading_volume 
FROM stocks 
WHERE theme_id = 1 
ORDER BY trading_volume DESC 
LIMIT 5;

# ❌ 나쁜 예: 모든 컬럼 선택
SELECT * FROM stocks WHERE theme_id = 1;
```

#### 비동기 처리

```python
# ✅ 좋은 예: 비동기 함수 사용
import asyncio

async def fetch_themes():
    themes = await fetch_from_api()
    return themes

# ❌ 나쁜 예: 동기 함수 (블로킹)
def fetch_themes():
    themes = fetch_from_api()  # API 응답 대기 중 다른 요청 처리 불가
    return themes
```

---

## 8. 1인 운영 자동화 전략

### 8.1 자동화할 작업

#### 데이터 업데이트 (Cron Job)

```python
# Python FastAPI에서 스케줄러 사용
from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()

def update_themes():
    # 증권 API에서 테마 데이터 가져와서 DB 업데이트
    pass

# 매일 장 마감 후 실행 (15:30)
scheduler.add_job(update_themes, 'cron', hour=15, minute=30)
scheduler.start()
```

#### 보고서 자동 삭제 (Supabase Function)

```sql
-- 매일 자정에 만료된 보고서 삭제
CREATE OR REPLACE FUNCTION delete_expired_reports()
RETURNS void AS $$
BEGIN
  DELETE FROM reports WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Supabase 대시보드에서 Cron Job 설정
-- 매일 00:00에 실행
```

---

### 8.2 유지보수 체크리스트 (주 1회)

- ✅ Railway 로그 확인 (에러, 응답 시간)
- ✅ Supabase 사용량 확인 (DB 크기, API 호출 수)
- ✅ API 키 만료일 확인
- ✅ 의존성 보안 업데이트 (`npm audit`, `pip-audit`)

---

## 9. Git 워크플로우

### 9.1 브랜치 전략

```
main (프로덕션)
  ↑
develop (개발)
  ↑
feature/feat-1 (기능 개발)
```

### 9.2 커밋 메시지 규칙

```
feat: 테마 추천 기능 추가
fix: 종목 정렬 버그 수정
docs: PRD 문서 업데이트
style: 코드 포맷팅
refactor: API 호출 로직 리팩토링
test: 테마 추천 테스트 추가
chore: 의존성 업데이트
```

---

## 10. 코드 리뷰 체크리스트

### 10.1 기능 구현

- ✅ 인수 조건 충족
- ✅ 에러 처리 완료
- ✅ 로딩 상태 표시

### 10.2 코드 품질

- ✅ TypeScript 타입 에러 없음
- ✅ ESLint 경고 없음
- ✅ 중복 코드 제거

### 10.3 보안

- ✅ API 키 노출 없음
- ✅ SQL 인젝션 방지
- ✅ XSS 방지

### 10.4 성능

- ✅ 불필요한 리렌더링 없음
- ✅ 이미지 최적화
- ✅ 캐싱 적용

### 10.5 접근성

- ✅ ARIA 라벨 추가
- ✅ 키보드 탐색 가능
- ✅ 색상 대비 충족

---

## 11. 문서화 규칙

### 11.1 함수 주석

```typescript
/**
 * 테마 목록을 가져옵니다.
 * @param sort - 정렬 기준 ('volume' 또는 'surge')
 * @returns 테마 목록 (최대 5개)
 * @throws 네트워크 오류 시 에러 발생
 */
async function fetchThemes(sort: 'volume' | 'surge'): Promise<Theme[]> {
  // ...
}
```

### 11.2 README 작성

```markdown
# TAP (Theme Analysis Program)

주식 투자자를 위한 테마별 종목 분석 도구

## 시작하기

1. 의존성 설치: `npm install`
2. 환경 변수 설정: `.env.local` 파일 생성
3. 개발 서버 실행: `npm run dev`

## 기술 스택

- Next.js 14
- Python FastAPI
- Supabase
- Railway
```

---

## 12. AI 협업 시 주의사항

### 12.1 AI가 잘하는 것

- ✅ 반복적인 코드 작성 (CRUD, UI 컴포넌트)
- ✅ 타입 정의
- ✅ 테스트 코드 작성
- ✅ 문서화

### 12.2 AI가 실수하기 쉬운 것

- ❌ 보안 (API 키 노출, SQL 인젝션)
- ❌ 성능 (불필요한 반복문, 비효율적 쿼리)
- ❌ 접근성 (ARIA 라벨 누락)
- ❌ 에러 처리 (예외 상황 고려 부족)

### 12.3 검증 필수 항목

1. **보안**: 환경 변수, SQL 쿼리, 사용자 입력 처리
2. **성능**: 반복문, 데이터베이스 쿼리, 이미지 로딩
3. **접근성**: ARIA 라벨, 키보드 탐색, 색상 대비
4. **에러 처리**: try-catch, 사용자 친화적 메시지

---

## 13. 최종 체크리스트 (배포 전)

### 13.1 기능

- ✅ 모든 인수 조건 충족
- ✅ 에러 처리 완료
- ✅ 로딩 상태 표시

### 13.2 보안

- ✅ 환경 변수 확인
- ✅ HTTPS 적용
- ✅ CORS 설정

### 13.3 성능

- ✅ Lighthouse 점수 80점 이상
- ✅ 이미지 최적화
- ✅ 캐싱 적용

### 13.4 접근성

- ✅ WCAG AA 기준 충족
- ✅ 키보드 탐색 가능
- ✅ 스크린 리더 지원

### 13.5 문서

- ✅ README 작성
- ✅ API 문서 작성
- ✅ 배포 가이드 작성

---

## 14. 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [Supabase 공식 문서](https://supabase.com/docs)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [WCAG 접근성 가이드](https://www.w3.org/WAI/WCAG21/quickref/)
