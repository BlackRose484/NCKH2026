'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CompletionBucket } from '@/lib/analytics';

interface CompletionChartProps {
  data: CompletionBucket[];
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

export default function CompletionRateChart({ data }: CompletionChartProps) {
  if (data.every(d => d.count === 0)) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400">
        Chưa có dữ liệu
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" label={{ value: 'Số học sinh', position: 'insideBottom', offset: -5 }} />
        <YAxis dataKey="range" type="category" />
        <Tooltip 
          formatter={(value: any) => [`${value} học sinh`, 'Số lượng']}
          labelFormatter={(label) => `Tỷ lệ hoàn thành: ${label}`}
        />
        <Bar dataKey="count" radius={[0, 8, 8, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
