"use client";
import React from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface RadarDataPoint {
  metric: string;
  value: number;
  fullMark?: number;
}

interface ScoreRadarProps {
  data: RadarDataPoint[];
  compareData?: RadarDataPoint[];
  color?: string;
  compareColor?: string;
  height?: number;
}

export function ScoreRadar({
  data,
  compareData,
  color = "#6366f1",
  compareColor = "#f59e0b",
  height = 300,
}: ScoreRadarProps) {
  const merged = data.map((d, i) => ({
    metric: d.metric,
    primary: d.value,
    compare: compareData?.[i]?.value,
    fullMark: d.fullMark || 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={merged}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis dataKey="metric" tick={{ fill: "#9ca3af", fontSize: 12 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#6b7280" }} />
        <Radar
          name="Score"
          dataKey="primary"
          stroke={color}
          fill={color}
          fillOpacity={0.3}
        />
        {compareData && (
          <Radar
            name="Compare"
            dataKey="compare"
            stroke={compareColor}
            fill={compareColor}
            fillOpacity={0.2}
          />
        )}
        {compareData && <Legend />}
      </RadarChart>
    </ResponsiveContainer>
  );
}
