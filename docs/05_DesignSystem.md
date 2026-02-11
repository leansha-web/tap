# Design System (기초 디자인 시스템)

**프로젝트**: Theme Analysis Program (TAP)  
**버전**: v1.0  
**작성일**: 2026-02-10  
**디자인 철학**: 트레이딩뷰/블룸버그 스타일 — 깔끔하고 데이터 중심, 다크 모드 기반

---

## 1. 색상 팔레트 (다크 모드 기반)

### 1.1 역할 기반 색상

| 역할 | 색상 코드 | CSS 변수 | 용도 |
|---|---|---|---|
| **Primary** | `#3B82F6` (Blue 500) | `--color-primary` | 주요 버튼, 링크, 강조 |
| **Secondary** | `#8B5CF6` (Violet 500) | `--color-secondary` | 보조 액션, 부가 기능 |
| **Surface** | `#1F2937` (Gray 800) | `--color-surface` | 카드, 패널 배경 |
| **Background** | `#111827` (Gray 900) | `--color-background` | 전체 배경 |
| **Text Primary** | `#F9FAFB` (Gray 50) | `--color-text-primary` | 주요 텍스트 |
| **Text Secondary** | `#9CA3AF` (Gray 400) | `--color-text-secondary` | 보조 텍스트, 설명 |
| **Border** | `#374151` (Gray 700) | `--color-border` | 테두리, 구분선 |

### 1.2 피드백 색상

| 역할 | 색상 코드 | CSS 변수 | 용도 |
|---|---|---|---|
| **Success** | `#10B981` (Green 500) | `--color-success` | 상승, 성공 메시지 |
| **Danger** | `#EF4444` (Red 500) | `--color-danger` | 하락, 에러 메시지 |
| **Warning** | `#F59E0B` (Amber 500) | `--color-warning` | 주의, 경고 |
| **Info** | `#3B82F6` (Blue 500) | `--color-info` | 정보 메시지 |

### 1.3 데이터 시각화 색상

| 용도 | 색상 코드 | CSS 변수 |
|---|---|---|
| **상승 (양봉)** | `#10B981` (Green 500) | `--color-chart-up` |
| **하락 (음봉)** | `#EF4444` (Red 500) | `--color-chart-down` |
| **거래량** | `#3B82F6` (Blue 500) | `--color-chart-volume` |
| **이동평균선** | `#F59E0B` (Amber 500) | `--color-chart-ma` |
| **보조 라인** | `#6B7280` (Gray 500) | `--color-chart-secondary` |

### 1.4 Tailwind CSS 설정

```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        surface: '#1F2937',
        background: '#111827',
        'text-primary': '#F9FAFB',
        'text-secondary': '#9CA3AF',
        border: '#374151',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
        'chart-up': '#10B981',
        'chart-down': '#EF4444',
        'chart-volume': '#3B82F6',
        'chart-ma': '#F59E0B',
      },
    },
  },
};
```

---

## 2. 타이포그래피

### 2.1 폰트 패밀리

| 용도 | 폰트 | CSS 변수 |
|---|---|---|
| **본문** | `'Inter', -apple-system, BlinkMacSystemFont, sans-serif` | `--font-body` |
| **숫자** | `'Roboto Mono', monospace` | `--font-mono` |
| **제목** | `'Inter', sans-serif` | `--font-heading` |

### 2.2 타이포그래피 스케일

| 레벨 | 크기 | 행간 | 굵기 | CSS 클래스 | 용도 |
|---|---|---|---|---|---|
| **H1** | 32px / 2rem | 1.2 | 700 | `text-4xl font-bold` | 페이지 제목 |
| **H2** | 24px / 1.5rem | 1.3 | 600 | `text-2xl font-semibold` | 섹션 제목 |
| **H3** | 20px / 1.25rem | 1.4 | 600 | `text-xl font-semibold` | 카드 제목 |
| **Body** | 16px / 1rem | 1.5 | 400 | `text-base` | 본문 |
| **Small** | 14px / 0.875rem | 1.5 | 400 | `text-sm` | 보조 정보 |
| **Tiny** | 12px / 0.75rem | 1.5 | 400 | `text-xs` | 캡션, 라벨 |

### 2.3 폰트 임포트

```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap');
```

---

## 3. 간격 (Spacing)

### 3.1 간격 스케일

| 토큰 | 값 | Tailwind 클래스 | 용도 |
|---|---|---|---|
| `xs` | 4px | `p-1`, `m-1` | 아이콘-텍스트 간격 |
| `sm` | 8px | `p-2`, `m-2` | 버튼 내부 패딩 |
| `md` | 16px | `p-4`, `m-4` | 카드 내부 패딩 |
| `lg` | 24px | `p-6`, `m-6` | 섹션 간격 |
| `xl` | 32px | `p-8`, `m-8` | 페이지 여백 |
| `2xl` | 48px | `p-12`, `m-12` | 큰 섹션 간격 |

### 3.2 레이아웃 간격 가이드

```
┌─────────────────────────────────────┐
│  [xl: 32px 페이지 여백]              │
│  ┌───────────────────────────────┐  │
│  │  [lg: 24px 섹션 간격]         │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │ [md: 16px 카드 패딩]    │  │  │
│  │  │  [sm: 8px 버튼 패딩]    │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 4. UI 컴포넌트

### 4.1 버튼

#### 기본 버튼

| 상태 | 스타일 | Tailwind 클래스 |
|---|---|---|
| **기본** | 파란색 배경, 흰색 텍스트 | `bg-primary text-white px-4 py-2 rounded-md font-medium` |
| **호버** | 진한 파란색 | `hover:bg-blue-600` |
| **포커스** | 링 표시 | `focus:ring-2 focus:ring-primary/50` |
| **비활성화** | 회색, 투명도 50% | `disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50` |
| **로딩** | 스피너 + 투명도 | `opacity-70 cursor-wait` |

#### 버튼 변형

```tsx
// Primary Button
<button className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-blue-600 focus:ring-2 focus:ring-primary/50">
  확인
</button>

// Secondary Button
<button className="bg-surface text-text-primary px-4 py-2 rounded-md font-medium hover:bg-gray-700 border border-border">
  취소
</button>

// Danger Button
<button className="bg-danger text-white px-4 py-2 rounded-md font-medium hover:bg-red-600">
  삭제
</button>

// Ghost Button (투명 배경)
<button className="text-primary px-4 py-2 rounded-md font-medium hover:bg-primary/10">
  더보기
</button>
```

---

### 4.2 입력 필드

| 상태 | 스타일 | Tailwind 클래스 |
|---|---|---|
| **기본** | 어두운 배경, 테두리 | `bg-surface border border-border text-text-primary px-3 py-2 rounded-md` |
| **포커스** | 파란색 테두리, 링 | `focus:border-primary focus:ring-2 focus:ring-primary/20` |
| **에러** | 빨간색 테두리, 링 | `border-danger focus:ring-danger/20` |
| **비활성화** | 회색, 투명도 | `disabled:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50` |

#### 입력 필드 예시

```tsx
// 기본 입력
<input 
  type="text" 
  placeholder="테마 검색..."
  className="bg-surface border border-border text-text-primary px-3 py-2 rounded-md focus:border-primary focus:ring-2 focus:ring-primary/20 w-full"
/>

// 에러 상태
<input 
  type="text" 
  className="bg-surface border border-danger text-text-primary px-3 py-2 rounded-md focus:ring-2 focus:ring-danger/20 w-full"
/>
<p className="text-danger text-sm mt-1">필수 입력 항목입니다.</p>
```

---

### 4.3 카드

| 요소 | 스타일 | Tailwind 클래스 |
|---|---|---|
| **배경** | 어두운 회색 | `bg-surface` |
| **테두리** | 회색 테두리 | `border border-border` |
| **모서리** | 둥근 모서리 | `rounded-lg` |
| **패딩** | 중간 패딩 | `p-4` 또는 `p-6` |
| **그림자** | 부드러운 그림자 | `shadow-lg` |
| **호버** | 살짝 밝아짐 | `hover:bg-gray-700 transition-colors` |

#### 카드 예시

```tsx
// 기본 카드
<div className="bg-surface border border-border rounded-lg p-6 shadow-lg">
  <h3 className="text-xl font-semibold text-text-primary mb-2">2차전지</h3>
  <p className="text-text-secondary text-sm">거래량: 1,234,567</p>
</div>

// 인터랙티브 카드
<div className="bg-surface border border-border rounded-lg p-6 shadow-lg hover:bg-gray-700 transition-colors cursor-pointer">
  <h3 className="text-xl font-semibold text-text-primary mb-2">AI</h3>
  <p className="text-text-secondary text-sm">급등주: 12개</p>
</div>
```

---

### 4.4 데이터 테이블

| 요소 | 스타일 | Tailwind 클래스 |
|---|---|---|
| **테이블** | 전체 너비 | `w-full` |
| **헤더** | 어두운 배경, 굵은 글씨, 상단 고정 | `bg-gray-700 font-semibold sticky top-0` |
| **행 (짝수)** | 기본 배경 | `bg-surface` |
| **행 (홀수)** | 조금 더 어두운 배경 | `bg-gray-800` |
| **행 호버** | 밝아짐 | `hover:bg-gray-700` |
| **셀 패딩** | 중간 패딩 | `px-4 py-3` |
| **정렬 아이콘** | 헤더에 화살표 | `cursor-pointer select-none` |

#### 테이블 예시

```tsx
<table className="w-full">
  <thead className="bg-gray-700 text-text-primary sticky top-0">
    <tr>
      <th className="px-4 py-3 text-left cursor-pointer select-none">
        종목명 ↓
      </th>
      <th className="px-4 py-3 text-right cursor-pointer select-none">
        현재가
      </th>
      <th className="px-4 py-3 text-right cursor-pointer select-none">
        거래량
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="bg-surface hover:bg-gray-700">
      <td className="px-4 py-3 text-text-primary">삼성전자</td>
      <td className="px-4 py-3 text-right font-mono text-text-primary">71,500</td>
      <td className="px-4 py-3 text-right font-mono text-text-secondary">1,234,567</td>
    </tr>
    <tr className="bg-gray-800 hover:bg-gray-700">
      <td className="px-4 py-3 text-text-primary">SK하이닉스</td>
      <td className="px-4 py-3 text-right font-mono text-text-primary">123,000</td>
      <td className="px-4 py-3 text-right font-mono text-text-secondary">987,654</td>
    </tr>
  </tbody>
</table>
```

---

### 4.5 배지 (Badge)

| 타입 | 스타일 | Tailwind 클래스 |
|---|---|---|
| **기본** | 파란색 배경 | `bg-primary/20 text-primary px-2 py-1 rounded text-xs font-medium` |
| **성공** | 초록색 배경 | `bg-success/20 text-success px-2 py-1 rounded text-xs font-medium` |
| **위험** | 빨간색 배경 | `bg-danger/20 text-danger px-2 py-1 rounded text-xs font-medium` |
| **경고** | 노란색 배경 | `bg-warning/20 text-warning px-2 py-1 rounded text-xs font-medium` |

#### 배지 예시

```tsx
<span className="bg-success/20 text-success px-2 py-1 rounded text-xs font-medium">
  상승
</span>
<span className="bg-danger/20 text-danger px-2 py-1 rounded text-xs font-medium">
  하락
</span>
```

---

### 4.6 모달 (Modal)

| 요소 | 스타일 | Tailwind 클래스 |
|---|---|---|
| **오버레이** | 반투명 검정 | `fixed inset-0 bg-black/50 z-40` |
| **모달 컨테이너** | 중앙 정렬 | `fixed inset-0 flex items-center justify-center z-50` |
| **모달 박스** | 카드 스타일 | `bg-surface border border-border rounded-lg p-6 max-w-md w-full` |

#### 모달 예시

```tsx
<div className="fixed inset-0 bg-black/50 z-40" onClick={closeModal}></div>
<div className="fixed inset-0 flex items-center justify-center z-50">
  <div className="bg-surface border border-border rounded-lg p-6 max-w-md w-full shadow-2xl">
    <h2 className="text-2xl font-semibold text-text-primary mb-4">확인</h2>
    <p className="text-text-secondary mb-6">정말 삭제하시겠습니까?</p>
    <div className="flex gap-3 justify-end">
      <button className="bg-surface text-text-primary px-4 py-2 rounded-md border border-border">
        취소
      </button>
      <button className="bg-danger text-white px-4 py-2 rounded-md">
        삭제
      </button>
    </div>
  </div>
</div>
```

---

## 5. 아이콘

### 5.1 아이콘 라이브러리

**추천**: [Heroicons](https://heroicons.com/) 또는 [Lucide Icons](https://lucide.dev/)

### 5.2 아이콘 크기

| 크기 | 값 | Tailwind 클래스 | 용도 |
|---|---|---|---|
| **Small** | 16px | `w-4 h-4` | 버튼 내부, 인라인 |
| **Medium** | 20px | `w-5 h-5` | 기본 아이콘 |
| **Large** | 24px | `w-6 h-6` | 헤더, 강조 |

### 5.3 아이콘 색상

```tsx
// 기본 아이콘
<svg className="w-5 h-5 text-text-secondary" />

// 강조 아이콘
<svg className="w-5 h-5 text-primary" />

// 성공 아이콘
<svg className="w-5 h-5 text-success" />
```

---

## 6. 그림자 (Shadow)

| 레벨 | Tailwind 클래스 | 용도 |
|---|---|---|
| **Small** | `shadow-sm` | 입력 필드 |
| **Medium** | `shadow-md` | 버튼 |
| **Large** | `shadow-lg` | 카드 |
| **Extra Large** | `shadow-2xl` | 모달 |

---

## 7. 반응형 디자인

### 7.1 브레이크포인트

| 이름 | 최소 너비 | Tailwind 접두사 | 용도 |
|---|---|---|---|
| **Mobile** | 0px | (기본) | 스마트폰 |
| **Tablet** | 640px | `sm:` | 태블릿 세로 |
| **Desktop** | 1024px | `lg:` | PC, 태블릿 가로 |
| **Large Desktop** | 1280px | `xl:` | 큰 모니터 |

### 7.2 반응형 레이아웃 예시

```tsx
// 모바일: 1열, 태블릿: 2열, PC: 3열
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="bg-surface p-4 rounded-lg">카드 1</div>
  <div className="bg-surface p-4 rounded-lg">카드 2</div>
  <div className="bg-surface p-4 rounded-lg">카드 3</div>
</div>

// 모바일: 숨김, PC: 표시
<div className="hidden lg:block">
  <p>PC에서만 보이는 내용</p>
</div>
```

---

## 8. 접근성 (Accessibility)

### 8.1 접근성 체크리스트

- ✅ **대비비**: 모든 텍스트는 WCAG AA 기준 (4.5:1) 충족
- ✅ **포커스 링**: 키보드 탐색 시 `ring-2` 표시
- ✅ **키보드 탐색**: 모든 인터랙티브 요소는 Tab 키로 접근 가능
- ✅ **ARIA 라벨**: 아이콘 버튼에 `aria-label` 추가
- ✅ **색상 의존 금지**: 색상만으로 정보 전달하지 않음 (예: 상승/하락에 아이콘 추가)

### 8.2 접근성 예시

```tsx
// 아이콘 버튼에 ARIA 라벨
<button aria-label="바구니에 추가" className="...">
  <svg className="w-5 h-5" />
</button>

// 포커스 링
<button className="... focus:ring-2 focus:ring-primary/50 focus:outline-none">
  클릭
</button>

// 스크린 리더 전용 텍스트
<span className="sr-only">현재 페이지: 테마 분석</span>
```

---

## 9. 애니메이션 및 트랜지션

### 9.1 트랜지션 속도

| 속도 | 값 | Tailwind 클래스 | 용도 |
|---|---|---|---|
| **Fast** | 150ms | `transition duration-150` | 버튼 호버 |
| **Normal** | 300ms | `transition duration-300` | 카드 호버 |
| **Slow** | 500ms | `transition duration-500` | 모달 등장 |

### 9.2 애니메이션 예시

```tsx
// 버튼 호버 애니메이션
<button className="bg-primary hover:bg-blue-600 transition duration-150">
  클릭
</button>

// 카드 호버 애니메이션
<div className="bg-surface hover:bg-gray-700 transition-colors duration-300">
  카드
</div>

// 페이드 인 애니메이션
<div className="animate-fade-in">
  내용
</div>
```

---

## 10. 차트 스타일 가이드

### 10.1 캔들스틱 차트

| 요소 | 색상 | 설명 |
|---|---|---|
| **양봉** | `#10B981` (Green) | 상승일 |
| **음봉** | `#EF4444` (Red) | 하락일 |
| **거래량 (상승)** | `#10B981` 투명도 50% | 상승일 거래량 |
| **거래량 (하락)** | `#EF4444` 투명도 50% | 하락일 거래량 |
| **이동평균선** | `#F59E0B` (Amber) | 5일, 20일, 60일 |
| **그리드** | `#374151` (Gray 700) | 배경 그리드 |

### 10.2 차트 설정 예시 (Recharts)

```tsx
<LineChart data={data}>
  <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
  <XAxis stroke="#9CA3AF" />
  <YAxis stroke="#9CA3AF" />
  <Line type="monotone" dataKey="price" stroke="#3B82F6" strokeWidth={2} />
  <Line type="monotone" dataKey="ma5" stroke="#F59E0B" strokeWidth={1} />
</LineChart>
```

---

## 11. 로딩 상태

### 11.1 스피너

```tsx
// 기본 스피너
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>

// 버튼 내부 스피너
<button className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2" disabled>
  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
  로딩 중...
</button>
```

### 11.2 스켈레톤 UI

```tsx
// 카드 스켈레톤
<div className="bg-surface border border-border rounded-lg p-6 animate-pulse">
  <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
</div>
```

---

## 12. 에러 상태

### 12.1 에러 메시지

```tsx
// 인라인 에러
<div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded-md flex items-start gap-2">
  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" />
  <div>
    <p className="font-medium">오류가 발생했습니다</p>
    <p className="text-sm mt-1">서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.</p>
  </div>
</div>

// 전체 화면 에러
<div className="flex flex-col items-center justify-center min-h-screen">
  <svg className="w-16 h-16 text-danger mb-4" />
  <h2 className="text-2xl font-semibold text-text-primary mb-2">페이지를 불러올 수 없습니다</h2>
  <p className="text-text-secondary mb-6">인터넷 연결을 확인해주세요.</p>
  <button className="bg-primary text-white px-4 py-2 rounded-md">다시 시도</button>
</div>
```

---

## 13. 디자인 토큰 요약

```css
/* globals.css */
:root {
  /* Colors */
  --color-primary: #3B82F6;
  --color-secondary: #8B5CF6;
  --color-surface: #1F2937;
  --color-background: #111827;
  --color-text-primary: #F9FAFB;
  --color-text-secondary: #9CA3AF;
  --color-border: #374151;
  --color-success: #10B981;
  --color-danger: #EF4444;
  --color-warning: #F59E0B;
  
  /* Typography */
  --font-body: 'Inter', -apple-system, sans-serif;
  --font-mono: 'Roboto Mono', monospace;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```
