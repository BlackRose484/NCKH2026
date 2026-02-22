'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { EmotionDistribution } from '@/lib/analytics';

interface EmotionChartProps {
  data: EmotionDistribution[];
}

export default function EmotionDistributionChart({ data }: EmotionChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400">
        Chưa có dữ liệu
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry: any) => `${entry.emotion} (${entry.percentage}%)`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="count"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: any) => [`${value} học sinh`, 'Số lượng']}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
