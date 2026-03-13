"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface BarDataPoint {
  name: string;
  primary: number;
  compare?: number;
}

interface ScoreBarProps {
  data: BarDataPoint[];
  color?: string;
  compareColor?: string;
  height?: number;
}

export function ScoreBar({
  data,
  color = "#6366f1",
  compareColor = "#f59e0b",
  height = 300,
}: ScoreBarProps) {
  const hasCompare = data.some((d) => d.compare !== undefined);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1f2937",
            border: "1px solid #374151",
            borderRadius: "8px",
            color: "#f3f4f6",
          }}
        />
        <Bar dataKey="primary" fill={color} radius={[4, 4, 0, 0]} name="Score" />
        {hasCompare && (
          <Bar
            dataKey="compare"
            fill={compareColor}
            radius={[4, 4, 0, 0]}
            name="Compare"
          />
        )}
        {hasCompare && <Legend />}
      </BarChart>
    </ResponsiveContainer>
  );
}
