// Core type definitions for the emotion quiz app

export interface Question {
  id: number;
  question: string;
  category?: string;
  placeholder?: string;
  type?: 'text' | 'multiple-choice'; // default 'text'
  options?: string[];               // MC answer choices
}

export interface TextSentimentScore {
  score: 0 | 1 | 2;  // 0: positive, 1: neutral, 2: negative
  confidence?: number;
  reasoning?: string;
  provider: string;
  source: 'llm' | 'fallback';
  analyzedAt: string;
  error?: string;
  teacherOverride?: {
    originalScore: 0 | 1 | 2;
    newScore: 0 | 1 | 2;
    overriddenBy: string;
    overriddenAt: string;
    reason?: string;
  };
}

export interface QuizAnswer {
  questionId: number;
  answerText: string;
  selectedOption?: number;          // index of selected MC option
  isAnswered: boolean;
  timestamp: string;
  emotion?: EmotionResult;
  videoFilename?: string;
  textSentiment?: TextSentimentScore;
  engagementScore?: EngagementScore; // engagement API result
}

export interface EngagementScore {
  level: number | null;             // engagement level from API
  raw?: Record<string, unknown>;    // raw API response
  analyzedAt: string;
}

export type EmotionType = 
  | 'Surprise' 
  | 'Fear' 
  | 'Disgust' 
  | 'Happiness' 
  | 'Sadness' 
  | 'Anger' 
  | 'Neutral';

export interface EmotionResult {
  final_emotion: EmotionType;
  confidence?: number;
}

export interface QuizScore {
  total: number; // Total questions (30)
  completed: number; // Number of answered questions
  completionRate: number; // Percentage of completion (0-100)
  unanswered: number; // Number of skipped questions
}

export interface StudentInfo {
  name: string;
  class: string;
}

export interface QuizResult {
  timestamp: string;
  quizSetId: string;
  studentInfo?: StudentInfo;
  quizScore: QuizScore;
  emotion: EmotionResult;
  physicalLevel?: string | number | null;
  engagementLevel?: string | number | null; // for emotion-mastery quiz
  answers: QuizAnswer[];
  videoRecorded: boolean;
  videosFolder?: string;
}

export interface CameraState {
  isRecording: boolean;
  hasPermission: boolean;
  error: string | null;
  videoBlob: Blob | null;
}
