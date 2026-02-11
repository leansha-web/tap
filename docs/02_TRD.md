# TRD (기술 요구사항 정의서)

**프로젝트**: Theme Analysis Program (TAP)  
**버전**: v1.0  
**작성일**: 2026-02-10

---

## 1. 시스템 아키텍처

```
┌─────────────────────────────────────────────────┐
│                   사용자                          │
│            (PC 브라우저 / 모바일 브라우저)          │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│              Next.js (프론트엔드)                  │
│  - 반응형 UI (PC/Mobile)                         │
│  - 트레이딩뷰 스타일 차트/표                        │
│  - Supabase Auth (소셜 로그인)                    │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────┐  ┌──────────────────────┐
│   Supabase   │  │  Python FastAPI      │
│   (DB)       │  │  (증권 데이터 처리)    │
│              │  │  - pykrx             │
│  - 테마      │  │  - 뉴스 API          │
│  - 바구니    │  │  - AI API (GPT)      │
│  - 보고서    │  └──────────────────────┘
└──────────────┘
        │
        ▼
┌──────────────────────────────────────────────────┐
│              Railway (배포)                       │
│  - Next.js + Python FastAPI 동시 배포             │
│  - 시간 제한 없음 (증권 API 호출에 유리)            │
└──────────────────────────────────────────────────┘
```

---

## 2. 권장 기술 스택

### 프론트엔드

| 항목 | 선택 | 선택 이유 | 대안 | 벤더 락인 리스크 |
|---|---|---|---|---|
| **프레임워크** | Next.js 14 (App Router) | 반응형 웹, SSR/CSR 혼합, 트레이딩뷰급 UI 구현 가능 | React + Vite | 낮음 (React 기반) |
| **UI 라이브러리** | shadcn/ui + Tailwind CSS | 다크 모드, 데이터 테이블 컴포넌트 풍부 | Material-UI | 낮음 (오픈소스) |
| **차트** | Recharts 또는 TradingView Lightweight Charts | 주식 차트 전문 라이브러리 | Chart.js | 낮음 |
| **상태 관리** | Zustand | 간단하고 빠름 | Redux Toolkit | 낮음 |

### 백엔드

| 항목 | 선택 | 선택 이유 | 대안 | 벤더 락인 리스크 |
|---|---|---|---|---|
| **프레임워크** | Python FastAPI | 한국 증권 API 라이브러리(pykrx) 호환, 빠른 API 개발 | Node.js Express | 낮음 |
| **증권 데이터** | pykrx, FinanceDataReader | 한국 주식 데이터 무료 제공 | 증권사 유료 API | 중간 (라이브러리 의존) |
| **뉴스 API** | Google News API 또는 Naver 검색 API | 무료/저렴, 한국어 지원 | NewsAPI.org | 낮음 |
| **AI API** | OpenAI GPT-4 또는 Google Gemini | 보고서 생성 품질 | Claude | 중간 (API 비용) |

### 데이터베이스

| 항목 | 선택 | 선택 이유 | 대안 | 벤더 락인 리스크 |
|---|---|---|---|---|
| **DB** | Supabase (PostgreSQL) | 무료 시작, 소셜 로그인 내장, 실시간 구독 가능 | Firebase, PlanetScale | 중간 (PostgreSQL 표준이라 마이그레이션 가능) |
| **인증** | Supabase Auth | 구글/카카오 소셜 로그인 내장 | Auth0, NextAuth | 중간 |

### 배포/호스팅

| 항목 | 선택 | 선택 이유 | 예상 비용 | 확장 전략 |
|---|---|---|---|---|
| **배포** | Railway | Next.js + Python 동시 배포, 시간 제한 없음 | 월 $5~20 (소규모) | 사용자 증가 시 플랜 업그레이드 |
| **대안** | Vercel (Next.js) + Render (Python) | 각각 최적화된 플랫폼 | Vercel 무료, Render $7/월 | 분리 배포로 독립 확장 |

### 외부 API/서비스

| 서비스 | 용도 | 대체 옵션 |
|---|---|---|
| pykrx | 한국 주식 데이터 | FinanceDataReader, KIS API |
| Google News API | 테마별 뉴스 검색 | Naver 검색 API |
| OpenAI GPT-4 | AI 보고서 생성 (FEAT-3) | Google Gemini, Claude |
| Supabase Auth | 소셜 로그인 | Auth0, Firebase Auth |

---

## 3. 비기능적 요구사항

### 성능
- 테마 추천 결과: 3초 이내 표시
- 종목 상세 데이터 로딩: 5초 이내
- 차트 렌더링: 2초 이내

### 보안
- 사용자 투자 데이터: AES-256 암호화 저장
- API 키: 환경 변수로 관리, 절대 클라이언트 노출 금지
- HTTPS 필수
- Supabase RLS (Row Level Security) 활성화

### 확장성
- 초기: 동시 접속 ~50명
- 확장: Supabase 플랜 업그레이드, Railway 인스턴스 증설
- 데이터베이스: 인덱싱 전략으로 쿼리 최적화

### 가용성
- 장 시간(09:00~15:30) 중 99% 가동률
- 증권 API 장애 시 대체 API 자동 전환
- 에러 로깅 및 모니터링 (Sentry 또는 Railway 로그)

---

## 4. 데이터베이스 요구사항

### 스키마 설계 원칙
- **정규화**: 3NF까지 적용
- **확장성**: 포트폴리오 추적, 백테스팅을 위한 테이블 구조 미리 고려
- **성능**: 자주 조회되는 컬럼에 인덱스 설정

### 인덱싱 전략

| 테이블 | 인덱스 컬럼 | 이유 |
|---|---|---|
| `themes` | `trading_volume`, `created_at` | 거래량 정렬, 최신 테마 조회 |
| `stocks` | `theme_id`, `trading_volume`, `price` | 테마별 종목 조회, 대장주 정렬 |
| `baskets` | `user_id`, `created_at` | 사용자별 바구니 조회 |
| `basket_themes` | `basket_id`, `theme_id` | 바구니-테마 매핑 |
| `reports` | `user_id`, `created_at`, `expires_at` | 사용자별 보고서 조회, 만료 삭제 |

---

## 5. 접근제어·권한 모델

### 역할 정의
- **사용자 (User)**: 본인의 바구니·보고서만 CRUD 가능
- **관리자 (Admin)**: 모든 데이터 조회 가능 (1인 운영이므로 본인만)

### 권한 정책 (Supabase RLS)

```sql
-- 사용자는 본인 데이터만 접근
CREATE POLICY "Users can only access their own baskets"
ON baskets FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own reports"
ON reports FOR ALL
USING (auth.uid() = user_id);

-- 테마와 종목 데이터는 모두 읽기 가능
CREATE POLICY "Anyone can read themes"
ON themes FOR SELECT
USING (true);

CREATE POLICY "Anyone can read stocks"
ON stocks FOR SELECT
USING (true);
```

---

## 6. 데이터 생명주기

### 수집 원칙
- **개인정보 최소 수집**: 이메일, 닉네임만 (소셜 로그인)
- **투자 데이터**: 바구니 내역, 보고서만 저장 (실제 매수 내역은 저장 안 함)
- **동의 기반**: 소셜 로그인 시 데이터 수집 동의 명시

### 보존 기간
- **바구니**: 사용자 삭제 시까지 무기한 보존
- **보고서**: 생성 후 90일 (자동 삭제)
- **로그**: 30일 (디버깅 목적)

### 삭제/익명화 경로
- **사용자 탈퇴 시**: 모든 개인 데이터 즉시 삭제 (GDPR 준수)
- **익명화**: 통계 목적으로 사용 시 `user_id`를 해시 처리
- **자동 삭제**: Supabase Function으로 만료된 보고서 자동 삭제

```sql
-- 90일 지난 보고서 자동 삭제 (Supabase Function)
DELETE FROM reports
WHERE expires_at < NOW();
```

---

## 7. API 설계 원칙

### RESTful API 구조

| 엔드포인트 | 메서드 | 설명 | 응답 시간 목표 |
|---|---|---|---|
| `/api/themes` | GET | 테마 추천 (거래량/급등주) | 3초 |
| `/api/themes/{id}/stocks` | GET | 테마별 종목 목록 | 5초 |
| `/api/stocks/{code}` | GET | 종목 상세 정보 | 2초 |
| `/api/stocks/{code}/news` | GET | 종목 뉴스 | 3초 |
| `/api/reports` | POST | AI 보고서 생성 (FEAT-3) | 10초 |

### 에러 처리

```json
{
  "error": {
    "code": "THEME_NOT_FOUND",
    "message": "요청한 테마를 찾을 수 없습니다.",
    "details": "theme_id: 999"
  }
}
```

---

## 8. 기술 스택 선택 근거 요약

### Next.js + Python FastAPI 조합을 선택한 이유

| 요구사항 | Next.js | Python FastAPI |
|---|---|---|
| **반응형 웹** | ✅ 완벽한 반응형 지원 | - |
| **증권 데이터** | - | ✅ pykrx 라이브러리 활용 |
| **트레이딩뷰급 UI** | ✅ 자유로운 커스터마이징 | - |
| **빠른 개발** | ✅ App Router로 생산성 향상 | ✅ 자동 문서화, 빠른 API 개발 |
| **배포 편의성** | ✅ Railway에서 동시 배포 | ✅ Railway에서 동시 배포 |

### Streamlit을 선택하지 않은 이유
- 트레이딩뷰 같은 세련된 디자인 구현 어려움
- 모바일 최적화 제한적
- 확장성 한계 (사용자 증가 시)

---

## 9. 개발 환경 설정

### 필수 소프트웨어
- **Node.js**: 18 이상
- **Python**: 3.10 이상
- **Git**: 버전 관리
- **VS Code**: 권장 에디터

### 환경 변수 템플릿

```bash
# .env.local (Next.js)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx  # 서버 전용
NEXT_PUBLIC_API_URL=http://localhost:8000

# .env (Python FastAPI)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJxxx
OPENAI_API_KEY=sk-xxx
NAVER_CLIENT_ID=xxx
NAVER_CLIENT_SECRET=xxx
```

---

## 10. 배포 전략

### 단계별 배포 계획

1. **개발 환경**: 로컬 (Next.js dev server + FastAPI uvicorn)
2. **스테이징**: Railway Preview 환경
3. **프로덕션**: Railway 메인 브랜치 자동 배포

### CI/CD 파이프라인
- **Git Push** → Railway 자동 빌드 → 배포
- **환경 변수**: Railway 대시보드에서 관리
- **롤백**: Railway에서 이전 버전으로 즉시 복구 가능

---

## 11. 모니터링 및 로깅

### 모니터링 도구
- **Railway 로그**: 서버 에러, API 응답 시간
- **Supabase 대시보드**: DB 쿼리 성능, 사용량
- **Sentry** (선택): 프론트엔드 에러 추적

### 알림 설정
- API 응답 시간 > 10초: 슬랙 알림
- 서버 다운: 이메일 알림
- DB 사용량 > 80%: 경고 알림
