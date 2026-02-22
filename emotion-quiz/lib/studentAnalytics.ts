import { QuizAnswer } from '@/types';

interface StudentAnalytics {
  emotionBreakdown: Record<string, number>;
  categoryStats: {
    category: string;
    answered: number;
    total: number;
    avgLength: number;
    dominantEmotion: string;
  }[];
  redFlags: string[];
  insights: string[];
}

export function calculateStudentAnalytics(answers: QuizAnswer[]): StudentAnalytics {
  const emotionBreakdown: Record<string, number> = {};
  const categoryRanges = {
    'Gia đình': { start: 1, end: 10 },
    'Trường học – Bạn bè': { start: 11, end: 20 },
    'Bản thân': { start: 21, end: 30 },
  };

  // Count emotions
  answers.forEach(answer => {
    if (answer.emotion) {
      const emotion = answer.emotion.final_emotion;
      emotionBreakdown[emotion] = (emotionBreakdown[emotion] || 0) + 1;
    }
  });

  // Calculate category stats
  const categoryStats = Object.entries(categoryRanges).map(([category, range]) => {
    const categoryAnswers = answers.filter(
      ans => ans.questionId >= range.start && ans.questionId <= range.end
    );

    const answered = categoryAnswers.filter(a => a.isAnswered).length;
    const total = range.end - range.start + 1;
    const avgLength = categoryAnswers.length > 0
      ? Math.round(categoryAnswers.reduce((sum, a) => sum + (a.answerText?.length || 0), 0) / categoryAnswers.length)
      : 0;

    // Find dominant emotion
    const emotions: Record<string, number> = {};
    categoryAnswers.forEach(a => {
      if (a.emotion) {
        emotions[a.emotion.final_emotion] = (emotions[a.emotion.final_emotion] || 0) + 1;
      }
    });
    const dominantEmotion = Object.entries(emotions).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return { category, answered, total, avgLength, dominantEmotion };
  });

  // Detect red flags
  const redFlags: string[] = [];
  const insights: string[] = [];

  // Check for negative emotions
  const negativeCount = (emotionBreakdown['Sadness'] || 0) + (emotionBreakdown['Anger'] || 0);
  const totalEmotions = Object.values(emotionBreakdown).reduce((sum, count) => sum + count, 0);
  
  if (negativeCount > totalEmotions * 0.4) {
    redFlags.push('⚠️ Tỷ lệ cảm xúc tiêu cực cao (>40%)');
    insights.push('Học sinh có thể đang gặp khó khăn về tâm lý');
  }

  // Check for very short answers
  const shortAnswers = answers.filter(a => a.isAnswered && a.answerText.length < 10).length;
  if (shortAnswers > answers.length * 0.3) {
    redFlags.push('⚠️ Nhiều câu trả lời quá ngắn');
    insights.push('Học sinh có thể thiếu động lực hoặc không thoải mái chia sẻ');
  }

  // Check category-specific issues
  categoryStats.forEach(cat => {
    if (cat.dominantEmotion === 'Sadness' || cat.dominantEmotion === 'Anger') {
      redFlags.push(`⚠️ Cảm xúc tiêu cực ở chủ đề "${cat.category}"`);
      insights.push(`Cần quan tâm đến vấn đề ${cat.category.toLowerCase()}`);
    }
    
    if (cat.answered < cat.total * 0.5) {
      redFlags.push(`⚠️ Ít câu trả lời ở chủ đề "${cat.category}"`);
      insights.push(`Học sinh có thể ngại chia sẻ về ${cat.category.toLowerCase()}`);
    }
  });

  // Positive insights
  if (emotionBreakdown['Happiness'] > totalEmotions * 0.6) {
    insights.push('✅ Học sinh có tâm trạng tích cực');
  }

  const completionRate = (answers.filter(a => a.isAnswered).length / answers.length) * 100;
  if (completionRate >= 90) {
    insights.push('✅ Tỷ lệ hoàn thành cao, học sinh tích cực tham gia');
  }

  return {
    emotionBreakdown,
    categoryStats,
    redFlags,
    insights,
  };
}
