'use client';

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { OhlcvData } from '@/lib/types';
import { formatNumber } from '@/lib/utils';

/**
 * StockChart 컴포넌트 Props
 */
interface StockChartProps {
  history: OhlcvData[]; // OHLCV 히스토리 데이터
}

/**
 * 차트에 표시할 데이터 포인트
 * Recharts에서 사용할 수 있도록 가공한 데이터
 */
interface ChartDataPoint {
  date: string;    // 날짜
  close: number;   // 종가 (라인 차트)
  volume: number;  // 거래량 (바 차트)
  high: number;    // 고가
  low: number;     // 저가
}

/**
 * 주식 차트 컴포넌트 (Agent 1, Skill 1-6)
 *
 * 종가 라인 차트 + 거래량 바 차트를 표시한다.
 * Recharts의 ComposedChart를 사용하여 두 차트를 하나로 합친다.
 *
 * 참조: docs/01_PRD.md FEAT-2 (캔들스틱 차트)
 * 참고: 캔들스틱 차트는 Recharts에서 직접 지원하지 않으므로
 *       종가 라인 + 거래량 바 조합으로 대체한다.
 */
export default function StockChart({ history }: StockChartProps) {
  // 히스토리 데이터가 없으면 안내 메시지 표시
  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-secondary">
        <p>차트 데이터가 없습니다.</p>
      </div>
    );
  }

  // Recharts용 데이터 가공
  const chartData: ChartDataPoint[] = history.map((item) => ({
    date: item.date.slice(5), // "2026-01-15" → "01-15"
    close: item.close,
    volume: item.volume,
    high: item.high,
    low: item.low,
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          {/* 격자 */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#374151"
            opacity={0.5}
          />

          {/* X축: 날짜 */}
          <XAxis
            dataKey="date"
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#374151' }}
            interval="preserveStartEnd"
          />

          {/* Y축 (좌측): 종가 */}
          <YAxis
            yAxisId="price"
            orientation="left"
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#374151' }}
            tickFormatter={(value: number) => formatNumber(value)}
            domain={['auto', 'auto']}
          />

          {/* Y축 (우측): 거래량 */}
          <YAxis
            yAxisId="volume"
            orientation="right"
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#374151' }}
            tickFormatter={(value: number) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
              return String(value);
            }}
          />

          {/* 툴팁 */}
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F9FAFB',
              fontSize: '12px',
            }}
            formatter={(value: number | undefined, name: string | undefined) => {
              const val = value ?? 0;
              if (name === 'close') return [`${formatNumber(val)}원`, '종가'];
              if (name === 'volume') return [formatNumber(val), '거래량'];
              return [formatNumber(val), name ?? ''];
            }}
          />

          {/* 거래량 바 차트 */}
          <Bar
            yAxisId="volume"
            dataKey="volume"
            fill="#3B82F6"
            opacity={0.3}
            barSize={4}
          />

          {/* 종가 라인 차트 */}
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="close"
            stroke="#10B981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#10B981' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
