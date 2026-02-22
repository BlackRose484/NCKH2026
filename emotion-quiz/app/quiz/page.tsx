'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import CameraRecorder from '@/components/CameraRecorder';
import QuizQuestion from '@/components/QuizQuestion';
import ProgressBar from '@/components/ProgressBar';
import { useSoundPlayer } from '@/components/SoundPlayer';
import { getQuizSetById, defaultQuizSet } from '@/lib/quizSets';
import { getSentimentAnalyzer } from '@/lib/llm/analyzer';
import { QuizAnswer, StudentInfo, EmotionResult, EmotionType, Question } from '@/types';

export default function QuizPage() {
  const router = useRouter();
  const { playFinish } = useSoundPlayer();
  
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [quizSetId, setQuizSetId] = useState<string>('');
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  
  // Per-question video recording
  const [isRecording, setIsRecording] = useState(false);
  const [questionVideos, setQuestionVideos] = useState<Map<number, string>>(new Map());
  const [processingEmotion, setProcessingEmotion] = useState(false);
  
  const [showFinish, setShowFinish] = useState(false);
  const [resultId, setResultId] = useState<string>('');

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1;
  const MIN_ANSWER_LENGTH = 3;

  // Load student info and quiz set from sessionStorage
  useEffect(() => {
    const storedInfo = sessionStorage.getItem('studentInfo');
    if (storedInfo) {
      setStudentInfo(JSON.parse(storedInfo));
    }
    
    // Load selected quiz set
    const selectedQuizSetId = sessionStorage.getItem('selectedQuizSetId');
    const quizSet = selectedQuizSetId 
      ? getQuizSetById(selectedQuizSetId) || defaultQuizSet
      : defaultQuizSet;
    
    setQuizSetId(quizSet.id);
    setQuizQuestions(quizSet.questions);
    console.log(`[Quiz] Loaded quiz set: ${quizSet.name} (${quizSet.id})`);
    
    // Get or create result ID
    let storedResultId = sessionStorage.getItem('currentResultId');
    if (!storedResultId) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      storedResultId = `result_${timestamp}`;
      sessionStorage.setItem('currentResultId', storedResultId);
      console.log(`[Quiz] Created NEW resultId: ${storedResultId}`);
    } else {
      console.log(`[Quiz] Reusing EXISTING resultId: ${storedResultId}`);
    }
    setResultId(storedResultId);
  }, []);

  // Start recording when question loads
  useEffect(() => {
    if (currentQuestion && !processingEmotion) {
      // CRITICAL: Add delay to ensure previous recording is fully stopped and saved
      // This prevents race condition where new recording starts before old one finishes
      const startDelay = setTimeout(() => {
        console.log(`[Quiz] Starting recording for question ${currentQuestion.id}`);
        setIsRecording(true);
      }, 200); // Reduced to 200ms for faster transitions
      
      setCurrentAnswer(''); // Reset answer for new question
      
      return () => clearTimeout(startDelay);
    }
  }, [currentQuestionIndex, processingEmotion, currentQuestion]);

  // Analyze emotion with timeout
  const analyzeEmotionWithTimeout = async (
    blob: Blob,
    questionId: number
  ): Promise<EmotionResult> => {
    const TIMEOUT_MS = 5000; // 5 seconds

    try {
      const formData = new FormData();
      formData.append('video', blob, `question_${questionId}.webm`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch('/api/analyze-emotion', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return {
          final_emotion: (data.final_emotion || 'Neutral') as EmotionType,
          confidence: data.confidence,
        };
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Emotion analysis timed out, using Neutral');
      } else {
        console.log('Emotion analysis failed:', error);
      }
    }

    // Fallback to Neutral
    return {
      final_emotion: 'Neutral',
      confidence: 0,
    };
  };

  // Handle video recording complete
  const handleRecordingComplete = async (blob: Blob, questionId: number) => {
    console.log(`Video recorded for question ${questionId}, size: ${blob.size} bytes`);
    
    // Save video immediately to server
    const filename = `q${questionId}.webm`;
    const formData = new FormData();
    formData.append('video', blob, filename);
    formData.append('filename', filename);
    formData.append('resultId', resultId);

    try {
      const response = await fetch('/api/save-video', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Video saved: ${data.filepath}`);
        setQuestionVideos(prev => new Map(prev).set(questionId, data.filepath));
      }
    } catch (error) {
      console.error(`Failed to save video for question ${questionId}:`, error);
    }
  };

  // Handle answer submission
  const handleAnswerSubmit = async () => {
    if (processingEmotion || currentAnswer.trim().length < MIN_ANSWER_LENGTH) return;
    
    console.log(`[Quiz] Answer submitted for question ${currentQuestion.id}`);
    setProcessingEmotion(true);

    // Stop recording and wait for video to be saved
    console.log(`[Quiz] Stopping recording for question ${currentQuestion.id}`);
    setIsRecording(false);
    
    // Create a promise that resolves when video is saved
    const waitForVideo = new Promise<string>((resolve) => {
      const checkInterval = setInterval(() => {
        const videoPath = questionVideos.get(currentQuestion.id);
        if (videoPath) {
          console.log(`[Quiz] Video saved for question ${currentQuestion.id}: ${videoPath}`);
          clearInterval(checkInterval);
          resolve(videoPath);
        }
      }, 50); // Check every 50ms for faster response
      
      // Timeout after 2 seconds (reduced from 3s)
      setTimeout(() => {
        clearInterval(checkInterval);
        const fallbackPath = `videos/${resultId}/q${currentQuestion.id}.webm`;
        console.warn(`[Quiz] Video save timeout for question ${currentQuestion.id}, using fallback: ${fallbackPath}`);
        resolve(fallbackPath);
      }, 2000);
    });
    
    const finalVideoPath = await waitForVideo;
    
    // Analyze emotion from video (CRITICAL for correlation analysis)
    let emotion: EmotionResult = { final_emotion: 'Neutral', confidence: 0 };

    // NEW: Analyze text sentiment with LLM (background, don't block)
    const analyzer = getSentimentAnalyzer();
    const textSentimentPromise = analyzer.analyze({
      questionId: currentQuestion.id,
      questionText: currentQuestion.question,
      answerText: currentAnswer.trim(),
      category: currentQuestion.category,
    }).catch(error => {
      console.error(`[Quiz] Text sentiment analysis failed for Q${currentQuestion.id}:`, error);
      // Return fallback
      return {
        score: 1 as 0 | 1 | 2,
        provider: 'Error',
        source: 'fallback' as const,
        analyzedAt: new Date().toISOString(),
        error: error.message,
      };
    });

    // Wait for sentiment analysis (with timeout)
    const textSentiment = await Promise.race([
      textSentimentPromise,
      new Promise<any>(resolve => setTimeout(() => {
        console.warn(`[Quiz] Text sentiment timeout for Q${currentQuestion.id}`);
        resolve({
          score: 1,
          provider: 'Timeout',
          source: 'fallback',
          analyzedAt: new Date().toISOString(),
        });
      }, 5000)), // 5 second timeout
    ]);

    console.log(`[Quiz] Text sentiment for Q${currentQuestion.id}:`, textSentiment.score, `(${textSentiment.provider})`);

    // Create answer with text and emotion
    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      answerText: currentAnswer.trim(),
      isAnswered: true,
      timestamp: new Date().toISOString(),
      emotion,
      videoFilename: finalVideoPath,
      textSentiment,  // NEW: Include LLM analysis
    };

    setAnswers(prev => [...prev, answer]);
    console.log(`[Quiz] Answer saved for question ${currentQuestion.id}`);

    // Move to next question or finish immediately
    if (isLastQuestion) {
      finishQuiz();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setProcessingEmotion(false);
    }
  };

  // Finish quiz and save everything
  const finishQuiz = async () => {
    setShowFinish(true);
    playFinish();
    setProcessingEmotion(true);

    console.log(`[Quiz] Finishing quiz, videos saved for ${questionVideos.size} questions`);

    // Calculate overall emotion (most common)
    const emotionCounts = answers.reduce((acc, a) => {
      if (a.emotion) {
        acc[a.emotion.final_emotion] = (acc[a.emotion.final_emotion] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const overallEmotion = Object.entries(emotionCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0] as EmotionType || 'Neutral';

    // Calculate completion stats
    const completed = answers.filter(a => a.isAnswered).length;
    const total = quizQuestions.length;
    const quizScore = {
      total,
      completed,
      completionRate: Math.round((completed / total) * 100),
      unanswered: total - completed,
    };

    // Save result
    const resultTimestamp = new Date().toISOString();
    const result = {
      timestamp: resultTimestamp,
      quizSetId, // Include quiz set ID
      studentInfo: studentInfo || undefined,
      quizScore,
      emotion: { final_emotion: overallEmotion },
      answers,
      videoRecorded: true,
      videosFolder: resultId,
    };

    try {
      await fetch('/api/save-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
    } catch (error) {
      console.error('Failed to save results:', error);
    }

    // Store for results page
    sessionStorage.setItem('quizAnswers', JSON.stringify(answers));
    sessionStorage.setItem('quizScore', JSON.stringify(quizScore));
    sessionStorage.setItem('overallEmotion', JSON.stringify({ final_emotion: overallEmotion }));
    if (studentInfo) {
      sessionStorage.setItem('studentInfoForResults', JSON.stringify(studentInfo));
    }

    // Clear currentResultId
    sessionStorage.removeItem('currentResultId');

    // Navigate to results
    setTimeout(() => {
      router.push('/results');
    }, 3000);
  };

  const canSubmit = currentAnswer.trim().length >= MIN_ANSWER_LENGTH && !processingEmotion;

  // Show loading while quiz questions are being loaded
  if (quizQuestions.length === 0 || !currentQuestion) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-sky-500 rounded-full animate-spin mb-4"></div>
          <p className="text-neutral-600">Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Student Info Card */}
        {studentInfo && (
          <div className="card mb-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <Image src="/boy.svg" alt="Student" width={40} height={40} />
              <div>
                <p className="text-sm text-neutral-600">
                  Học sinh: <strong className="text-neutral-800">{studentInfo.name}</strong>
                </p>
                <p className="text-xs text-neutral-500">
                  Lớp: {studentInfo.class}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar 
            current={currentQuestionIndex + 1} 
            total={quizQuestions.length} 
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Camera */}
          <div className="order-2 lg:order-1">
            <CameraRecorder
              onRecordingComplete={handleRecordingComplete}
              isRecording={isRecording}
              currentQuestionId={currentQuestion.id}
            />
          </div>

          {/* Question */}
          <div className="order-1 lg:order-2">
            {!showFinish ? (
              <div className="space-y-4">
                <QuizQuestion
                  question={currentQuestion}
                  answerText={currentAnswer}
                  onAnswerChange={setCurrentAnswer}
                  isSubmitted={processingEmotion}
                />
                
                {/* Submit Button */}
                <button
                  onClick={handleAnswerSubmit}
                  disabled={!canSubmit}
                  className={`btn-secondary w-full h-14 px-8 text-base ${
                    !canSubmit ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLastQuestion ? 'Hoàn thành' : 'Tiếp theo'} →
                </button>

                {/* Early Submit Button */}
                {!isLastQuestion && currentQuestionIndex > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Bạn có chắc muốn nộp bài ngay? Các câu chưa trả lời sẽ bị bỏ qua.')) {
                        finishQuiz();
                      }
                    }}
                    disabled={processingEmotion}
                    className="btn-primary w-full h-12 px-6 text-sm bg-orange-500 hover:bg-orange-600 border-orange-600"
                  >
                    📤 Nộp bài ngay
                  </button>
                )}
              </div>
            ) : (
              <div className="card text-center">
                <div className="mb-6">
                  <Image
                    src="/finish.svg"
                    alt="Finish"
                    width={200}
                    height={200}
                    className="mx-auto"
                  />
                </div>
                <h2 className="text-2xl font-bold text-neutral-700 mb-3">
                  Hoàn thành! 🎉
                </h2>
                <p className="text-neutral-600">
                  Đang xử lý kết quả và lưu video...
                </p>
                <div className="mt-4">
                  <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Processing Indicator */}
        {processingEmotion && !showFinish && (
          <div className="card mt-6 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-blue-700 font-medium text-sm">
                Đang lưu câu trả lời...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
