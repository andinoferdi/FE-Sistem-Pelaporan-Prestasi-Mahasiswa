"use client";

import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/dashboard/ui/ui-chart";

import { Pie, PieChart } from "recharts";

const StatCard = React.memo(
  ({
    title,
    value,
    chartColor,
    filledPercentage,
    onClick,
  }: {
    title: string;
    value: string;
    chartColor: string;
    filledPercentage: number;
    onClick?: () => void;
  }) => {
    const chartData = [
      {
        name: "filled",
        value: filledPercentage,
        fill: chartColor,
      },
      {
        name: "empty",
        value: 100 - filledPercentage,
        fill: "rgba(0, 0, 0, 0.05)",
      },
    ];

    const chartConfig = {
      filled: {
        color: chartColor,
      },
      empty: {
        color: "rgba(0, 0, 0, 0.05)",
      },
    } satisfies ChartConfig;

    return (
      <Card
        className={`bg-card border border-border relative h-[120px] overflow-hidden rounded-2xl text-foreground shadow-lg transition-transform hover:scale-[1.02] ${
          onClick
            ? "focus:ring-opacity-50 cursor-pointer focus:ring-2 focus:ring-ring focus:outline-none"
            : ""
        }`}
        onClick={onClick}
        onKeyDown={(e) => {
          if (onClick && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onClick();
          }
        }}
        tabIndex={onClick ? 0 : undefined}
        role={onClick ? "button" : undefined}
        aria-label={onClick ? `Klik untuk melihat ${title}` : undefined}
      >
        <CardContent className="flex h-full items-center justify-between p-6">
          <div className="flex flex-col">
            <div className="mb-2 text-[40px] leading-none font-bold text-foreground">
              {value}
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              {title}
              {onClick && <span className="text-xs opacity-70">→</span>}
            </div>
          </div>
          <div className="h-20 w-20">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={24}
                  outerRadius={40}
                  strokeWidth={0}
                  startAngle={90}
                  endAngle={-270}
                />
              </PieChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = "StatCard";

export default function MetricCards({
  totalCount,
  submittedCount,
  verifiedCount,
  isLoading,
}: {
  totalCount: number;
  submittedCount: number;
  verifiedCount: number;
  isLoading: boolean;
}) {
  const calculatePercentage = (value: number, max: number = 100) => {
    return Math.min((value / max) * 100, 100);
  };

  const stats = [
    {
      title: "Total Prestasi",
      value: totalCount.toString().padStart(2, "0"),
      chartColor: "hsl(var(--chart-1))",
      filledPercentage: calculatePercentage(totalCount, 200),
      isLoading,
    },
    {
      title: "Prestasi Disubmit",
      value: submittedCount.toString().padStart(2, "0"),
      chartColor: "hsl(var(--chart-2))",
      filledPercentage: calculatePercentage(submittedCount, 100),
      isLoading,
    },
    {
      title: "Prestasi Terverifikasi",
      value: verifiedCount.toString().padStart(2, "0"),
      chartColor: "hsl(var(--chart-3))",
      filledPercentage: calculatePercentage(verifiedCount, 100),
      isLoading,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.isLoading ? "--" : stat.value}
          chartColor={stat.chartColor}
          filledPercentage={stat.isLoading ? 0 : stat.filledPercentage}
        />
      ))}
    </div>
  );
}
