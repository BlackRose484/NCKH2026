'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { QuizAnswer } from '@/types';

interface AnswerLengthProps {
  answers: QuizAnswer[];
}

export default function AnswerLengthChart({ answers }: AnswerLengthProps) {
  // Transform answers to chart data
  const chartData = answers
    .sort((a, b) => a.questionId - b.questionId)
    .map(answer => ({
      question: `Q${answer.questionId}`,
      questionId: answer.questionId,
      length: answer.answerText?.length || 0,
      category: answer.questionId <= 10 ? 'Gia đình' : 
                answer.questionId <= 20 ? 'Trường học' : 'Bản thân',
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-neutral-400">
        Chưa có dữ liệu
      </div>
    );
  }

  const avgLength = Math.round(
    chartData.reduce((sum, d) => sum + d.length, 0) / chartData.length
  );

  const getColor = (length: number) => {
    if (length >= avgLength * 1.5) return '#10B981'; // Green - detailed
    if (length >= avgLength) return '#3B82F6'; // Blue - average
    if (length >= avgLength * 0.5) return '#F59E0B'; // Orange - short
    return '#EF4444'; // Red - very short
  };

  return (
    <div>
      <div className="mb-2 text-xs text-neutral-600">
        Độ dài trung bình: <span className="font-bold">{avgLength} ký tự</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="question" 
            tick={{ fontSize: 10 }}
            interval={2}
          />
          <YAxis 
            label={{ value: 'Ký tự', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
            tick={{ fontSize: 10 }}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-2 border-2 border-slate-200 rounded-lg shadow-lg">
                    <p className="font-bold text-sm">{data.question}</p>
                    <p className="text-xs text-neutral-600">{data.category}</p>
                    <p className="text-xs font-bold">{data.length} ký tự</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="length" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.length)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
