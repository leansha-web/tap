/**
 * TAP 프로젝트 공통 타입 정의 파일
 *
 * 프론트엔드에서 사용하는 모든 데이터 타입을 여기서 정의한다.
 * 참조: docs/04_DatabaseDesign.md
 */

// ============================================
// 테마 관련 타입
// ============================================

/** 테마 정보 */
export interface Theme {
  id: number;                // 테마 고유 ID
  code: string;              // 테마 코드 (pykrx 티커)
  name: string;              // 테마 이름 (예: "2차전지", "AI")
  trading_volume: number;    // 테마 전체 거래량 (합산)
  surge_stock_count: number; // 급등주 개수 (전일 대비 2% 이상 상승 종목 수)
  updated_at: string;        // 마지막 업데이트 시간 (ISO 8601)
}

/** 테마 목록 API 응답 */
export interface ThemesResponse {
  themes: Theme[];
  sort: string;
}

/** 테마 검색 API 응답 */
export interface ThemeSearchResponse {
  themes: Theme[];
  query: string;
}

// ============================================
// 종목 관련 타입
// ============================================

/** 종목 기본 정보 */
export interface Stock {
  code: string;              // 종목 코드 (예: "005930")
  name: string;              // 종목명 (예: "삼성전자")
  price: number;             // 현재가
  trading_volume: number;    // 거래량
  market_cap: number;        // 시가총액
  type: 'stock' | 'ETF';    // 종목 유형
  updated_at: string;        // 마지막 업데이트 시간
}

/** 종목 상세 정보 (11개 지표) */
export interface StockDetail extends Stock {
  foreign_trading: number;       // 외국인 거래량
  institution_trading: number;   // 기관 거래량
  individual_trading: number;    // 개인 거래량
  per: number | null;            // PER (주가수익비율)
  pbr: number | null;            // PBR (주가순자산비율)
  industry_per: number | null;   // 동일업종 PER
  dividend_yield: number | null; // 배당수익률 (%)
}

/** OHLCV (캔들스틱 차트용) */
export interface OhlcvData {
  date: string;   // 날짜 (YYYY-MM-DD)
  open: number;   // 시가
  high: number;   // 고가
  low: number;    // 저가
  close: number;  // 종가
  volume: number; // 거래량
}

/** 테마별 종목 목록 API 응답 */
export interface ThemeStocksResponse {
  theme_code: string;
  stocks: Stock[];
  etfs: Stock[];
}

/** 종목 상세 API 응답 */
export interface StockDetailResponse {
  code: string;
  detail: StockDetail | null;
  history: OhlcvData[];
}

// ============================================
// 뉴스 관련 타입
// ============================================

/** 뉴스 항목 */
export interface NewsItem {
  title: string;        // 뉴스 제목
  link: string;         // 뉴스 링크
  description: string;  // 뉴스 요약
  published_at: string; // 발행일
  source: string;       // 출처 (Naver 또는 Google News)
}

/** 종목 뉴스 API 응답 */
export interface StockNewsResponse {
  code: string;
  stock_name: string;
  news: NewsItem[];
}

// ============================================
// 바구니 관련 타입
// ============================================

/** 바구니 정보 */
export interface Basket {
  id: number;          // 바구니 ID
  user_id: string;     // 소유자 ID (UUID)
  name: string;        // 바구니 이름
  created_at: string;  // 생성일
  updated_at: string;  // 수정일
}

/** 바구니에 담긴 테마 */
export interface BasketTheme {
  id: number;        // 매핑 ID
  basket_id: number; // 바구니 ID
  theme_id: number;  // 테마 ID
  added_at: string;  // 추가일
  theme?: Theme;     // 조인된 테마 정보 (선택)
}

// ============================================
// 정렬 관련 타입
// ============================================

/** 정렬 설정 (다중 컬럼 정렬) */
export interface SortConfig {
  column: string;           // 정렬 컬럼
  direction: 'asc' | 'desc'; // 정렬 방향
}
