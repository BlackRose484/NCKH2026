import { QuizResult } from '@/types';

// Calculate emotion distribution across all results
export interface EmotionDistribution {
  emotion: string;
  count: number;
  percentage: number;
  color: string;
}

export function calculateEmotionDistribution(results: QuizResult[]): EmotionDistribution[] {
  const emotionCounts: Record<string, number> = {};
  const emotionColors: Record<string, string> = {
    'Happiness': '#10B981',
    'Neutral': '#6B7280',
    'Sadness': '#3B82F6',
    'Anger': '#EF4444',
    'Fear': '#F59E0B',
    'Surprise': '#8B5CF6',
  };

  // Count emotions
  results.forEach(result => {
    const emotion = result.emotion.final_emotion;
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  });

  const total = results.length;
  
  return Object.entries(emotionCounts).map(([emotion, count]) => ({
    emotion,
    count,
    percentage: Math.round((count / total) * 100),
    color: emotionColors[emotion] || '#9CA3AF',
  }));
}

// Calculate completion rate distribution
export interface CompletionBucket {
  range: string;
  count: number;
  students: string[];
}

export function calculateCompletionDistribution(results: QuizResult[]): CompletionBucket[] {
  const buckets: CompletionBucket[] = [
    { range: '100%', count: 0, students: [] },
    { range: '80-99%', count: 0, students: [] },
    { range: '50-79%', count: 0, students: [] },
    { range: '<50%', count: 0, students: [] },
  ];

  results.forEach(result => {
    const rate = result.quizScore.completionRate;
    const name = result.studentInfo?.name || 'Unknown';
    
    if (rate === 100) {
      buckets[0].count++;
      buckets[0].students.push(name);
    } else if (rate >= 80) {
      buckets[1].count++;
      buckets[1].students.push(name);
    } else if (rate >= 50) {
      buckets[2].count++;
      buckets[2].students.push(name);
    } else {
      buckets[3].count++;
      buckets[3].students.push(name);
    }
  });

  return buckets;
}

// Calculate category-based statistics
export interface CategoryStats {
  category: string;
  emotions: Record<string, number>;
  avgCompletion: number;
  totalQuestions: number;
}

export function calculateCategoryStats(results: QuizResult[]): CategoryStats[] {
  const categories = ['Gia đình', 'Trường học – Bạn bè', 'Bản thân'];
  const questionRanges = {
    'Gia đình': { start: 1, end: 10 },
    'Trường học – Bạn bè': { start: 11, end: 20 },
    'Bản thân': { start: 21, end: 30 },
  };

  return categories.map(category => {
    const range = questionRanges[category as keyof typeof questionRanges];
    const emotions: Record<string, number> = {};
    let totalAnswered = 0;
    let totalPossible = 0;

    results.forEach(result => {
      // Get answers for this category
      const categoryAnswers = result.answers.filter(
        ans => ans.questionId >= range.start && ans.questionId <= range.end
      );

      // Count emotions
      categoryAnswers.forEach(ans => {
        if (ans.emotion) {
          const emotion = ans.emotion.final_emotion;
          emotions[emotion] = (emotions[emotion] || 0) + 1;
        }
        if (ans.isAnswered) totalAnswered++;
      });

      totalPossible += (range.end - range.start + 1);
    });

    return {
      category,
      emotions,
      avgCompletion: totalPossible > 0 ? Math.round((totalAnswered / totalPossible) * 100) : 0,
      totalQuestions: range.end - range.start + 1,
    };
  });
}

// Calculate class-based statistics
export interface ClassStats {
  className: string;
  studentCount: number;
  avgCompletion: number;
  emotions: Record<string, number>;
}

export function calculateClassStats(results: QuizResult[]): ClassStats[] {
  const classMap: Record<string, QuizResult[]> = {};

  // Group by class
  results.forEach(result => {
    const className = result.studentInfo?.class || 'Unknown';
    if (!classMap[className]) {
      classMap[className] = [];
    }
    classMap[className].push(result);
  });

  return Object.entries(classMap).map(([className, classResults]) => {
    const emotions: Record<string, number> = {};
    let totalCompletion = 0;

    classResults.forEach(result => {
      const emotion = result.emotion.final_emotion;
      emotions[emotion] = (emotions[emotion] || 0) + 1;
      totalCompletion += result.quizScore.completionRate;
    });

    return {
      className,
      studentCount: classResults.length,
      avgCompletion: Math.round(totalCompletion / classResults.length),
      emotions,
    };
  });
}

// Calculate overall statistics
export interface OverallStats {
  totalStudents: number;
  avgCompletionRate: number;
  mostCommonEmotion: string;
  avgQuestionsAnswered: number;
}

export function calculateOverallStats(results: QuizResult[]): OverallStats {
  if (results.length === 0) {
    return {
      totalStudents: 0,
      avgCompletionRate: 0,
      mostCommonEmotion: 'N/A',
      avgQuestionsAnswered: 0,
    };
  }

  const emotionCounts: Record<string, number> = {};
  let totalCompletion = 0;
  let totalAnswered = 0;

  results.forEach(result => {
    const emotion = result.emotion.final_emotion;
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    totalCompletion += result.quizScore.completionRate;
    totalAnswered += result.quizScore.completed;
  });

  const mostCommonEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0][0];

  return {
    totalStudents: results.length,
    avgCompletionRate: Math.round(totalCompletion / results.length),
    mostCommonEmotion,
    avgQuestionsAnswered: Math.round(totalAnswered / results.length),
  };
}
