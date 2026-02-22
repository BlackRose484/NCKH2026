'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CategoryStats } from '@/lib/analytics';

interface CategoryChartProps {
  data: CategoryStats[];
}

const EMOTION_COLORS: Record<string, string> = {
  'Happiness': '#10B981',
  'Neutral': '#6B7280',
  'Sadness': '#3B82F6',
  'Anger': '#EF4444',
  'Fear': '#F59E0B',
  'Surprise': '#8B5CF6',
};

export default function CategoryAnalysisChart({ data }: CategoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400">
        Chưa có dữ liệu
      </div>
    );
  }

  // Transform data for grouped bar chart
  const chartData = data.map(cat => {
    const transformed: any = { category: cat.category };
    Object.entries(cat.emotions).forEach(([emotion, count]) => {
      transformed[emotion] = count;
    });
    return transformed;
  });

  // Get all unique emotions
  const allEmotions = new Set<string>();
  data.forEach(cat => {
    Object.keys(cat.emotions).forEach(emotion => allEmotions.add(emotion));
  });

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis label={{ value: 'Số lượng', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        {Array.from(allEmotions).map(emotion => (
          <Bar 
            key={emotion}
            dataKey={emotion}
            fill={EMOTION_COLORS[emotion] || '#9CA3AF'}
            radius={[8, 8, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
