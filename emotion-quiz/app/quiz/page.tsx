'use client';

import { useState, useEffect, useRef } from 'react';
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

  // Track background emotion/sentiment analyses so finishQuiz can await them
  const backgroundAnalysesRef = useRef<Promise<void>[]>([]);

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
    
    setProcessingEmotion(true);
    setIsRecording(false);

    const questionId = currentQuestion.id;
    const answerText = currentAnswer.trim();
    const capturedVideoPath = `videos/${resultId}/q${questionId}.webm`; // optimistic path

    // 1. Save answer IMMEDIATELY with defaults → user can proceed right away
    const answer: QuizAnswer = {
      questionId,
      answerText,
      isAnswered: true,
      timestamp: new Date().toISOString(),
      emotion: { final_emotion: 'Neutral', confidence: 0 },
      videoFilename: capturedVideoPath,
      textSentiment: undefined,
    };

    setAnswers(prev => [...prev, answer]);

    // 2. Move to next question IMMEDIATELY
    if (isLastQuestion) {
      finishQuiz();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer('');
      setProcessingEmotion(false);
    }

    // 3. Run AI analyses in background (fire-and-forget, update answers when done)
    const bgAnalysis = (async () => {
      // Wait for actual video path to be set (up to 3s)
      const finalVideoPath = await new Promise<string>((resolve) => {
        const t = setTimeout(() => resolve(capturedVideoPath), 3000);
        const interval = setInterval(() => {
          const p = questionVideos.get(questionId);
          if (p) { clearInterval(interval); clearTimeout(t); resolve(p); }
        }, 50);
      });

      // Emotion analysis
      const emotionPromise = (async (): Promise<EmotionResult> => {
        try {
          console.log(`[Emotion Q${questionId}] Sending video to AI: ${finalVideoPath}`);
          const videoResponse = await fetch(`/api/get-video?path=${encodeURIComponent(finalVideoPath)}`);
          if (!videoResponse.ok) throw new Error('Failed to fetch saved video');
          const videoBlob = await videoResponse.blob();
          const formData = new FormData();
          formData.append('video', videoBlob, `q${questionId}.webm`);
          const response = await fetch('/api/analyze-emotion', { method: 'POST', body: formData });
          if (!response.ok) throw new Error(`Emotion API error: ${response.status}`);
          const data = await response.json();
          console.log(`[Emotion Q${questionId}] ✅ AI result:`, data);
          return {
            final_emotion: (data.final_emotion || data.emotion || 'Neutral') as EmotionType,
            confidence: data.confidence ?? 0,
          };
        } catch (err) {
          console.warn(`[Emotion Q${questionId}] ⚠️ FALLBACK:`, err);
          return { final_emotion: 'Neutral', confidence: 0 };
        }
      })();

      // Text sentiment analysis
      const analyzer = getSentimentAnalyzer();
      const sentimentPromise = analyzer.analyze({
        questionId,
        questionText: currentQuestion.question,
        answerText,
        category: currentQuestion.category,
      }).catch(() => ({
        score: 1 as 0 | 1 | 2,
        provider: 'Error',
        source: 'fallback' as const,
        analyzedAt: new Date().toISOString(),
      }));

      // Wait for both (no timeout needed since we're already in background)
      const [emotionResult, textSentiment] = await Promise.all([emotionPromise, sentimentPromise]);

      // Update the answer with real results
      setAnswers(prev => prev.map(a =>
        a.questionId === questionId
          ? { ...a, emotion: emotionResult, textSentiment, videoFilename: finalVideoPath }
          : a
      ));
      console.log(`[Quiz] Q${questionId} background analysis done. Emotion: ${emotionResult.final_emotion}`);
    })();
    backgroundAnalysesRef.current.push(bgAnalysis);
  };

  // Finish quiz and save everything
  const finishQuiz = async () => {
    setShowFinish(true);
    playFinish();
    setProcessingEmotion(true);

    // Wait for all background emotion/sentiment analyses to complete before reading answers
    if (backgroundAnalysesRef.current.length > 0) {
      console.log(`[Quiz] Waiting for ${backgroundAnalysesRef.current.length} background analyses...`);
      await Promise.allSettled(backgroundAnalysesRef.current);
      backgroundAnalysesRef.current = [];
      console.log('[Quiz] All background analyses done.');
    }

    // Read latest answers from state via a ref pattern — use functional update trick
    // Actually read from ref snapshot since state may lag; rely on answers closure

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

    // Call get_level_physical with all per-question emotions
    let physicalLevel: string | null = null;
    const emotionList = answers
      .filter(a => a.emotion?.final_emotion)
      .map(a => a.emotion!.final_emotion);

    console.log(`[PhysicalLevel] Sending ${emotionList.length} emotions to AI:`, emotionList);

    if (emotionList.length > 0) {
      try {
        const levelRes = await fetch('/api/get-physical-level', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emotions: emotionList }),
        });
        if (levelRes.ok) {
          const levelData = await levelRes.json();
          physicalLevel = levelData.level ?? levelData.physical_level ?? JSON.stringify(levelData);
          console.log(`[PhysicalLevel] ✅ AI result:`, levelData, '→ level:', physicalLevel);
        } else {
          console.warn(`[PhysicalLevel] ⚠️ FALLBACK - API returned ${levelRes.status}`);
        }
      } catch (err) {
        console.warn('[PhysicalLevel] ⚠️ FALLBACK (API failed):', err);
      }
    }

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
      physicalLevel,  // Overall physical level from AI
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

  // Background images from back_asset - rotate per question
  const bgImages = [
    '/back_asset/minibannerCgAnimal-634ca53ff1fe5b881d23.webp',
    '/back_asset/minibannerCgSpace-c7ae98e8df2d4fd0633f.webp',
    '/back_asset/minibannerCgScience-f6a39d6f2d33678cbfb6.webp',
    '/back_asset/minibannerCgRobot-3805fe37c839c9e9bd90.webp',
    '/back_asset/minibannerCgPuzzle-9d13e3f094c49943ce76.webp',
    '/back_asset/minibannerCgMath-21d55ef42aecef29a91a.webp',
    '/back_asset/minibannerCgCat-1e4557f26d6de904caef.webp',
    '/back_asset/minibannerCgSports-912a8c367e0916f549f2.webp',
    '/back_asset/minibannerCgFood-aa328c0b7ff51250b86e.webp',
    '/back_asset/minibannerCgArt-d8089f260688a5ece973.webp',
  ];
  const bgImg = bgImages[currentQuestionIndex % bgImages.length];

  // Gradient palettes per question (cycle through fun gradients)
  const gradients = [
    'from-violet-400 via-purple-300 to-pink-300',
    'from-sky-400 via-cyan-300 to-teal-300',
    'from-orange-400 via-amber-300 to-yellow-200',
    'from-rose-400 via-pink-300 to-fuchsia-300',
    'from-emerald-400 via-green-300 to-lime-200',
    'from-indigo-400 via-blue-300 to-cyan-200',
    'from-amber-400 via-orange-300 to-rose-300',
    'from-teal-400 via-emerald-300 to-green-200',
    'from-fuchsia-400 via-violet-300 to-purple-200',
    'from-cyan-400 via-sky-300 to-indigo-200',
  ];
  const gradient = gradients[currentQuestionIndex % gradients.length];

  // Show loading while quiz questions are being loaded
  if (quizQuestions.length === 0 || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-400 to-pink-300 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-white/40 border-t-white rounded-full animate-spin mb-4"></div>
          <p className="text-white font-bold text-xl">Đang tải câu hỏi... 🌟</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradient} transition-all duration-700 relative overflow-hidden`}>
      {/* Hidden camera recorder - records in background */}
      <div className="hidden">
        <CameraRecorder
          onRecordingComplete={handleRecordingComplete}
          isRecording={isRecording}
          currentQuestionId={currentQuestion.id}
        />
      </div>

      {/* Decorative floating background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-8 text-6xl opacity-20 animate-bounce" style={{animationDelay:'0s',animationDuration:'3s'}}>⭐</div>
        <div className="absolute top-24 right-12 text-5xl opacity-20 animate-bounce" style={{animationDelay:'0.5s',animationDuration:'4s'}}>🌙</div>
        <div className="absolute bottom-20 left-16 text-7xl opacity-20 animate-bounce" style={{animationDelay:'1s',animationDuration:'3.5s'}}>✨</div>
        <div className="absolute bottom-32 right-8 text-5xl opacity-20 animate-bounce" style={{animationDelay:'1.5s',animationDuration:'4.5s'}}>🌈</div>
        <div className="absolute top-1/2 left-4 text-4xl opacity-15 animate-pulse">💫</div>
        <div className="absolute top-1/3 right-4 text-4xl opacity-15 animate-pulse" style={{animationDelay:'1s'}}>🎯</div>
      </div>

      {/* Top bar */}
      <div className="relative z-10 px-4 pt-4 pb-2 flex items-center justify-between">
        {/* Student info */}
        <div className="flex items-center gap-2 bg-white/30 backdrop-blur-sm rounded-2xl px-4 py-2">
          <span className="text-2xl">👦</span>
          <div>
            <p className="text-white font-bold text-sm leading-tight">{studentInfo?.name || 'Học sinh'}</p>
            <p className="text-white/80 text-xs">Lớp {studentInfo?.class || '?'}</p>
          </div>
        </div>

        {/* Question counter badge */}
        <div className="bg-white/30 backdrop-blur-sm rounded-2xl px-4 py-2 text-center">
          <p className="text-white font-bold text-sm">Câu hỏi</p>
          <p className="text-white font-extrabold text-xl leading-tight">
            {currentQuestionIndex + 1}
            <span className="text-white/70 font-normal text-sm"> / {quizQuestions.length}</span>
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 px-4 py-1">
        <div className="bg-white/30 rounded-full h-3 overflow-hidden">
          <div
            className="bg-white h-3 rounded-full transition-all duration-500"
            style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-4 py-4 gap-4 min-h-[calc(100vh-100px)]">

        {!showFinish ? (
          <>
            {/* Background image mascot */}
            <div className="flex justify-center">
              <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/60 bg-white/20">
                <img
                  src={bgImg}
                  alt="mascot"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Question card */}
            <div className="w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-white p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-lg">
                  {currentQuestionIndex + 1}
                </div>
                <p className="text-neutral-800 font-bold text-xl leading-relaxed flex-1">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Answer textarea */}
              <textarea
                value={currentAnswer}
                onChange={e => setCurrentAnswer(e.target.value)}
                placeholder={currentQuestion.placeholder || 'Hãy viết câu trả lời của bạn vào đây... 📝'}
                disabled={processingEmotion}
                rows={4}
                className="w-full rounded-2xl border-3 border-orange-200 bg-orange-50 p-4 text-neutral-700 text-lg font-medium placeholder-orange-300 focus:outline-none focus:border-orange-400 focus:bg-white resize-none transition-all duration-200 shadow-inner"
                style={{ borderWidth: '3px' }}
              />

              {/* Character count */}
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-neutral-400">
                  {currentAnswer.length > 0
                    ? currentAnswer.length >= MIN_ANSWER_LENGTH
                      ? '✅ Câu trả lời hợp lệ!'
                      : `Cần thêm ${MIN_ANSWER_LENGTH - currentAnswer.length} ký tự nữa`
                    : 'Hãy viết câu trả lời của bạn'}
                </span>
                <span className="text-sm text-neutral-400">{currentAnswer.length} ký tự</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="w-full max-w-2xl flex flex-col gap-3">
              {/* Next / Finish button */}
              <button
                onClick={handleAnswerSubmit}
                disabled={!canSubmit}
                className={`w-full h-16 rounded-3xl font-black text-xl text-white shadow-2xl transition-all duration-200 flex items-center justify-center gap-3
                  ${canSubmit
                    ? 'bg-gradient-to-r from-orange-400 to-rose-500 hover:from-orange-500 hover:to-rose-600 active:scale-95 hover:shadow-orange-300 hover:shadow-xl'
                    : 'bg-orange-100 text-orange-300 cursor-not-allowed'
                  }`}
              >
                {isLastQuestion ? (
                  <><span>🎉</span> Nộp bài</>
                ) : (
                  <><span>➡️</span> Câu tiếp theo</>
                )}
              </button>

              {/* Early submit */}
              {!isLastQuestion && currentQuestionIndex > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Bạn có chắc muốn nộp bài ngay? Các câu chưa trả lời sẽ bị bỏ qua.')) {
                      finishQuiz();
                    }
                  }}
                  disabled={processingEmotion}
                  className="w-full h-11 rounded-2xl font-bold text-sm text-white/90 bg-white/25 border-2 border-white/40 hover:bg-white/35 transition-all backdrop-blur-sm"
                >
                  📤 Nộp bài sớm
                </button>
              )}
            </div>
          </>
        ) : (
          /* Finish screen */
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="text-center bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border-4 border-white max-w-sm w-full mx-4">
              <div className="text-8xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-3xl font-black text-orange-600 mb-2">Xuất sắc!</h2>
              <p className="text-neutral-600 font-medium mb-6">Đang lưu kết quả của bạn...</p>
              <div className="flex justify-center">
                <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
