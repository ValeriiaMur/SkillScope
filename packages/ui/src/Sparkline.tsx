"use client";
import React from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function Sparkline({
  data,
  color = "#6366f1",
  width = 100,
  height = 30,
}: SparklineProps) {
  const chartData = data.map((v, i) => ({ i, v }));

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
