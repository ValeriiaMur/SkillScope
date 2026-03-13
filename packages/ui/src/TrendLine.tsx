"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface TrendDataPoint {
  label: string;
  value: number;
}

interface TrendLineProps {
  data: TrendDataPoint[];
  color?: string;
  height?: number;
  yDomain?: [number, number];
}

export function TrendLine({
  data,
  color = "#6366f1",
  height = 200,
  yDomain = [0, 100],
}: TrendLineProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <YAxis domain={yDomain} tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1f2937",
            border: "1px solid #374151",
            borderRadius: "8px",
            color: "#f3f4f6",
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
