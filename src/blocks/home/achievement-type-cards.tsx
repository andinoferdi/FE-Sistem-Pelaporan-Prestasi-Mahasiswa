'use client';

import * as React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { type ChartConfig, ChartContainer } from '@/components/ui/chart';
import { useStatistics } from '@/services/reports';
import type { AchievementType } from '@/types/achievement';

import { Pie, PieChart } from 'recharts';

const StatCard = React.memo(
  ({
    title,
    value,
    bgColor,
    filledPercentage,
  }: {
    title: string;
    value: string;
    bgColor: string;
    filledPercentage: number;
  }) => {
    const chartData = [
      { name: 'filled', value: filledPercentage, fill: 'rgba(255, 255, 255, 0.8)' },
      { name: 'empty', value: 100 - filledPercentage, fill: 'rgba(255, 255, 255, 0.2)' }
    ];

    const chartConfig = {
      filled: {
        color: 'rgba(255, 255, 255, 0.8)'
      },
      empty: {
        color: 'rgba(255, 255, 255, 0.2)'
      }
    } satisfies ChartConfig;

    return (
      <Card
        className={`${bgColor} relative h-[120px] overflow-hidden rounded-2xl border-0 text-white shadow-lg transition-transform hover:scale-[1.02]`}
        role="article"
        aria-label={`${title}: ${value}`}>
        <CardContent className='flex h-full items-center justify-between p-6'>
          <div className='flex flex-col'>
            <div className='mb-2 text-[40px] leading-none font-bold'>{value}</div>
            <div className='flex items-center gap-2 text-sm font-medium opacity-90'>
              {title}
            </div>
          </div>
          <div className='h-20 w-20'>
            <ChartContainer config={chartConfig} className='h-full w-full'>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey='value'
                  nameKey='name'
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

StatCard.displayName = 'StatCard';

const achievementTypeConfig: Record<AchievementType, { label: string; color: string }> = {
  academic: { label: 'Akademik', color: 'bg-blue-500' },
  competition: { label: 'Kompetisi', color: 'bg-green-500' },
  organization: { label: 'Organisasi', color: 'bg-orange-500' },
  publication: { label: 'Publikasi', color: 'bg-purple-500' },
  certification: { label: 'Sertifikasi', color: 'bg-pink-500' },
  other: { label: 'Lainnya', color: 'bg-slate-600' },
};

export default function AchievementTypeCards() {
  const { data, isLoading, error } = useStatistics();

  const calculatePercentage = (value: number, max: number) => {
    if (max === 0) return 0;
    return Math.min((value / max) * 100, 100);
  };

  const stats = React.useMemo(() => {
    if (!data?.byType) return [];

    const byType = data.byType;
    const total = Object.values(byType).reduce((sum, count) => sum + count, 0);
    const maxCount = Math.max(...Object.values(byType), 1);

    return Object.entries(achievementTypeConfig).map(([type, config]) => {
      const count = byType[type] || 0;
      return {
        type: type as AchievementType,
        title: config.label,
        value: count.toString().padStart(2, '0'),
        bgColor: config.color,
        filledPercentage: calculatePercentage(count, maxCount),
        count,
      };
    });
  }, [data]);

  if (error) {
    return (
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        <div className='col-span-full rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center'>
          <p className='text-sm text-destructive'>
            Gagal memuat data statistik. Silakan coba lagi.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className='h-[120px] animate-pulse rounded-2xl bg-gray-200'
            aria-label="Loading"
          />
        ))}
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        <div className='col-span-full rounded-lg border p-4 text-center'>
          <p className='text-sm text-muted-foreground'>
            Belum ada data prestasi untuk ditampilkan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
      {stats.map((stat) => (
        <StatCard
          key={stat.type}
          title={stat.title}
          value={stat.value}
          bgColor={stat.bgColor}
          filledPercentage={stat.filledPercentage}
        />
      ))}
    </div>
  );
}

