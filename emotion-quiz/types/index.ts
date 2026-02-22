// Core type definitions for the emotion quiz app

export interface Question {
  id: number;
  question: string;
  category?: string;
  placeholder?: string; // Placeholder text for input field
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
  answerText: string; // User's text answer
  isAnswered: boolean; // Whether question was answered
  timestamp: string;
  emotion?: EmotionResult; // Per-question emotion (critical for correlation)
  videoFilename?: string; // Reference to video file
  textSentiment?: TextSentimentScore;  // NEW: LLM sentiment analysis
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
  quizSetId: string; // ID of the quiz set (e.g., 'psychology-v1')
  studentInfo?: StudentInfo; // Optional for backward compatibility
  quizScore: QuizScore;
  emotion: EmotionResult;
  answers: QuizAnswer[];
  videoRecorded: boolean;
  videosFolder?: string; // Folder containing all question videos
}

export interface CameraState {
  isRecording: boolean;
  hasPermission: boolean;
  error: string | null;
  videoBlob: Blob | null;
}
