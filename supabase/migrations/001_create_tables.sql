-- ============================================================
-- TAP (Theme Analysis Program) 데이터베이스 초기화 스크립트
-- 버전: v1.0
-- 작성일: 2026-02-10
-- 참조: docs/04_DatabaseDesign.md
-- ============================================================

-- ============================================================
-- 1. 테이블 생성 (외래 키 의존성 순서대로)
-- ============================================================

-- 1-1. USERS (사용자)
-- Supabase Auth의 사용자 정보를 동기화하는 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,                              -- Supabase Auth의 user id
  email VARCHAR(255) UNIQUE NOT NULL,               -- 이메일 (소셜 로그인)
  nickname VARCHAR(50),                             -- 사용자 닉네임 (선택)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 가입일
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  -- 수정일
);

-- 1-2. THEMES (테마)
-- 증권 API에서 가져온 테마 정보를 저장하는 테이블
CREATE TABLE IF NOT EXISTS themes (
  id SERIAL PRIMARY KEY,                            -- 테마 고유 ID (자동 증가)
  name VARCHAR(100) NOT NULL,                       -- 테마 이름 (예: "2차전지", "AI")
  code VARCHAR(20) UNIQUE,                          -- 테마 코드 (증권사 API 코드)
  trading_volume BIGINT DEFAULT 0,                  -- 테마 전체 거래량 (합산)
  surge_stock_count INT DEFAULT 0,                  -- 급등주 개수 (전일 대비 상승 종목 수)
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- 마지막 데이터 업데이트 시간
);

-- 1-3. STOCKS (종목)
-- 테마별 종목 정보를 저장하는 테이블
CREATE TABLE IF NOT EXISTS stocks (
  code VARCHAR(10) PRIMARY KEY,                     -- 종목 코드 (예: "005930")
  theme_id INT REFERENCES themes(id) ON DELETE CASCADE, -- 소속 테마 ID
  name VARCHAR(100) NOT NULL,                       -- 종목명 (예: "삼성전자")
  price DECIMAL(10,2) NOT NULL DEFAULT 0,           -- 현재가
  trading_volume BIGINT DEFAULT 0,                  -- 거래량
  market_cap BIGINT DEFAULT 0,                      -- 시가총액
  type VARCHAR(10) DEFAULT 'stock',                 -- 종목 유형: 'stock' 또는 'ETF'
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- 마지막 업데이트 시간
);

-- 1-4. STOCK_DETAILS (종목 상세 지표)
-- 종목의 11개 분석 지표를 저장하는 테이블
CREATE TABLE IF NOT EXISTS stock_details (
  id SERIAL PRIMARY KEY,                            -- 상세 정보 ID (자동 증가)
  stock_code VARCHAR(10) REFERENCES stocks(code) ON DELETE CASCADE, -- 종목 코드
  foreign_trading BIGINT DEFAULT 0,                 -- 외국인 거래량
  institution_trading BIGINT DEFAULT 0,             -- 기관 거래량
  individual_trading BIGINT DEFAULT 0,              -- 개인 거래량
  per DECIMAL(10,2),                                -- PER (주가수익비율)
  pbr DECIMAL(10,2),                                -- PBR (주가순자산비율)
  industry_per DECIMAL(10,2),                       -- 동일업종 PER
  dividend_yield DECIMAL(5,2),                      -- 배당수익률 (%)
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- 마지막 업데이트 시간
);

-- 1-5. BASKETS (바구니)
-- 사용자가 생성한 테마 바구니 테이블
CREATE TABLE IF NOT EXISTS baskets (
  id SERIAL PRIMARY KEY,                            -- 바구니 ID (자동 증가)
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- 소유자 ID
  name VARCHAR(100) DEFAULT '내 바구니',              -- 바구니 이름
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 생성일
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  -- 수정일
);

-- 1-6. BASKET_THEMES (바구니-테마 매핑)
-- 바구니에 담긴 테마 목록 (N:M 관계)
CREATE TABLE IF NOT EXISTS basket_themes (
  id SERIAL PRIMARY KEY,                            -- 매핑 ID (자동 증가)
  basket_id INT REFERENCES baskets(id) ON DELETE CASCADE, -- 바구니 ID
  theme_id INT REFERENCES themes(id) ON DELETE CASCADE,   -- 테마 ID
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  -- 추가일
  UNIQUE(basket_id, theme_id)                       -- 같은 테마 중복 추가 방지
);

-- 1-7. REPORTS (AI 보고서) — FEAT-3 후순위
-- AI가 생성한 테마/종목 분석 보고서 저장 테이블
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,                            -- 보고서 ID (자동 증가)
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- 생성자 ID
  theme_id INT REFERENCES themes(id),               -- 테마 보고서인 경우
  stock_code VARCHAR(10) REFERENCES stocks(code),   -- 종목 보고서인 경우
  report_type VARCHAR(10) NOT NULL,                 -- 보고서 유형: 'theme' 또는 'stock'
  content TEXT NOT NULL,                            -- 보고서 내용 (Markdown 형식)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 생성일
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days') -- 만료일 (90일 후 자동 삭제)
);


-- ============================================================
-- 2. 체크 제약조건
-- ============================================================

-- stocks 테이블: type은 'stock' 또는 'ETF'만 허용
ALTER TABLE stocks
ADD CONSTRAINT chk_stocks_type
CHECK (type IN ('stock', 'ETF'));

-- reports 테이블: report_type은 'theme' 또는 'stock'만 허용
ALTER TABLE reports
ADD CONSTRAINT chk_reports_type
CHECK (report_type IN ('theme', 'stock'));

-- reports 테이블: 보고서 유형에 맞는 참조가 있어야 함
ALTER TABLE reports
ADD CONSTRAINT chk_reports_reference
CHECK (
  (report_type = 'theme' AND theme_id IS NOT NULL AND stock_code IS NULL) OR
  (report_type = 'stock' AND stock_code IS NOT NULL AND theme_id IS NULL)
);


-- ============================================================
-- 3. 인덱스 생성 (쿼리 성능 최적화)
-- ============================================================

-- users 인덱스
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- themes 인덱스 (거래량/급등주 기준 정렬 최적화)
CREATE INDEX IF NOT EXISTS idx_themes_trading_volume ON themes(trading_volume DESC);
CREATE INDEX IF NOT EXISTS idx_themes_surge_count ON themes(surge_stock_count DESC);
CREATE INDEX IF NOT EXISTS idx_themes_updated_at ON themes(updated_at DESC);

-- stocks 인덱스
CREATE INDEX IF NOT EXISTS idx_stocks_theme_id ON stocks(theme_id);
CREATE INDEX IF NOT EXISTS idx_stocks_trading_volume ON stocks(trading_volume DESC);
CREATE INDEX IF NOT EXISTS idx_stocks_price ON stocks(price DESC);
CREATE INDEX IF NOT EXISTS idx_stocks_type ON stocks(type);
-- 복합 인덱스: 테마별 대장주 조회 최적화
CREATE INDEX IF NOT EXISTS idx_stocks_theme_volume ON stocks(theme_id, trading_volume DESC);

-- stock_details 인덱스
CREATE INDEX IF NOT EXISTS idx_stock_details_code ON stock_details(stock_code);
CREATE INDEX IF NOT EXISTS idx_stock_details_updated_at ON stock_details(updated_at DESC);

-- baskets 인덱스
CREATE INDEX IF NOT EXISTS idx_baskets_user_id ON baskets(user_id);
CREATE INDEX IF NOT EXISTS idx_baskets_created_at ON baskets(created_at DESC);

-- basket_themes 인덱스
CREATE INDEX IF NOT EXISTS idx_basket_themes_basket_id ON basket_themes(basket_id);
CREATE INDEX IF NOT EXISTS idx_basket_themes_theme_id ON basket_themes(theme_id);

-- reports 인덱스
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_expires_at ON reports(expires_at);


-- ============================================================
-- 4. RLS (Row Level Security) 정책
-- ============================================================

-- 4-1. RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE baskets ENABLE ROW LEVEL SECURITY;
ALTER TABLE basket_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 4-2. users 테이블 정책
-- 사용자는 본인 정보만 조회 가능
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- 사용자는 본인 정보만 수정 가능
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- 4-3. themes 테이블 정책
-- 모든 사용자(로그인한)가 테마 조회 가능
CREATE POLICY "Anyone can read themes"
ON themes FOR SELECT
USING (true);

-- 4-4. stocks 테이블 정책
-- 모든 사용자(로그인한)가 종목 조회 가능
CREATE POLICY "Anyone can read stocks"
ON stocks FOR SELECT
USING (true);

-- 4-5. stock_details 테이블 정책
-- 모든 사용자(로그인한)가 종목 상세 정보 조회 가능
CREATE POLICY "Anyone can read stock details"
ON stock_details FOR SELECT
USING (true);

-- 4-6. baskets 테이블 정책
-- 사용자는 본인 바구니만 CRUD 가능
CREATE POLICY "Users can manage own baskets"
ON baskets FOR ALL
USING (auth.uid() = user_id);

-- 4-7. basket_themes 테이블 정책
-- 사용자는 본인 바구니의 테마만 관리 가능
CREATE POLICY "Users can manage own basket themes"
ON basket_themes FOR ALL
USING (
  basket_id IN (
    SELECT id FROM baskets WHERE user_id = auth.uid()
  )
);

-- 4-8. reports 테이블 정책
-- 사용자는 본인 보고서만 CRUD 가능
CREATE POLICY "Users can manage own reports"
ON reports FOR ALL
USING (auth.uid() = user_id);


-- ============================================================
-- 5. 자동 삭제 함수 (만료된 보고서)
-- ============================================================

-- 만료된 보고서를 삭제하는 함수
-- Supabase pg_cron 또는 대시보드에서 매일 자정에 실행
CREATE OR REPLACE FUNCTION delete_expired_reports()
RETURNS void AS $$
BEGIN
  DELETE FROM reports WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 6. 자동 updated_at 갱신 트리거
-- ============================================================

-- updated_at 컬럼을 자동으로 현재 시간으로 갱신하는 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- users 테이블에 updated_at 트리거 적용
CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- themes 테이블에 updated_at 트리거 적용
CREATE TRIGGER trigger_themes_updated_at
BEFORE UPDATE ON themes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- stocks 테이블에 updated_at 트리거 적용
CREATE TRIGGER trigger_stocks_updated_at
BEFORE UPDATE ON stocks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- stock_details 테이블에 updated_at 트리거 적용
CREATE TRIGGER trigger_stock_details_updated_at
BEFORE UPDATE ON stock_details
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- baskets 테이블에 updated_at 트리거 적용
CREATE TRIGGER trigger_baskets_updated_at
BEFORE UPDATE ON baskets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 7. 신규 사용자 자동 등록 트리거
-- Supabase Auth에서 새 사용자가 가입하면 users 테이블에 자동으로 추가
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nickname)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users 테이블에 INSERT 트리거 연결
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();
