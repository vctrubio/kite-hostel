"use client";

import { Card, CardContent } from "@/components/ui/card";

interface StatItem {
  value: string | number;
  description: string;
}

interface StatsBarProps {
  stats: [StatItem, StatItem, StatItem];
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-sm">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
