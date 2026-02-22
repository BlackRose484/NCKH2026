'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { QuizAnswer } from '@/types';

interface EmotionTimelineProps {
  answers: QuizAnswer[];
}

const EMOTION_COLORS: Record<string, string> = {
  'Happiness': '#10B981',
  'Neutral': '#6B7280',
  'Sadness': '#3B82F6',
  'Anger': '#EF4444',
  'Fear': '#F59E0B',
  'Surprise': '#8B5CF6',
};

const EMOTION_VALUES: Record<string, number> = {
  'Happiness': 5,
  'Surprise': 4,
  'Neutral': 3,
  'Fear': 2,
  'Sadness': 1,
  'Anger': 0,
};

export default function EmotionTimelineChart({ answers }: EmotionTimelineProps) {
  // Transform answers to chart data
  const chartData = answers
    .sort((a, b) => a.questionId - b.questionId)
    .map(answer => ({
      question: `Q${answer.questionId}`,
      questionId: answer.questionId,
      emotion: answer.emotion?.final_emotion || 'Neutral',
      value: EMOTION_VALUES[answer.emotion?.final_emotion || 'Neutral'] || 3,
      confidence: answer.emotion?.confidence ? Math.round(answer.emotion.confidence * 100) : 0,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-neutral-400">
        Chưa có dữ liệu
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="question" 
          tick={{ fontSize: 10 }}
          interval={2}
        />
        <YAxis 
          domain={[0, 5]}
          ticks={[0, 1, 2, 3, 4, 5]}
          tickFormatter={(value) => {
            const emotions = ['Anger', 'Sadness', 'Fear', 'Neutral', 'Surprise', 'Happiness'];
            return emotions[value] || '';
          }}
          tick={{ fontSize: 10 }}
        />
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-white p-2 border-2 border-slate-200 rounded-lg shadow-lg">
                  <p className="font-bold text-sm">{data.question}</p>
                  <p className="text-xs" style={{ color: EMOTION_COLORS[data.emotion] }}>
                    {data.emotion} ({data.confidence}%)
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#8B5CF6" 
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
