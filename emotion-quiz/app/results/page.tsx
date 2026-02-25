'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuizAnswer, QuizScore, EmotionResult, StudentInfo } from '@/types';
import { getEmotionConfig } from '@/lib/emotions';

export default function ResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [emotion, setEmotion] = useState<EmotionResult | null>(null);
  const [quizScore, setQuizScore] = useState<QuizScore | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);

  useEffect(() => {
    const answersJson = sessionStorage.getItem('quizAnswers');
    const scoreJson = sessionStorage.getItem('quizScore');
    const emotionJson = sessionStorage.getItem('overallEmotion');
    const studentInfoJson = sessionStorage.getItem('studentInfoForResults');

    if (answersJson && scoreJson && emotionJson) {
      setAnswers(JSON.parse(answersJson));
      setQuizScore(JSON.parse(scoreJson));
      setEmotion(JSON.parse(emotionJson));
      if (studentInfoJson) setStudentInfo(JSON.parse(studentInfoJson));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-white/40 border-t-white rounded-full animate-spin mb-4"></div>
          <p className="text-white font-bold text-xl">Đang tải kết quả... 🌟</p>
        </div>
      </div>
    );
  }

  if (!emotion || !quizScore) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center p-4">
        <div className="bg-white/90 rounded-3xl p-8 max-w-sm text-center shadow-2xl">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-neutral-700 font-bold mb-4">Không tìm thấy kết quả</p>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-orange-400 to-rose-500 text-white font-black px-8 py-3 rounded-2xl shadow-lg"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const emotionConfig = getEmotionConfig(emotion.final_emotion);
  const pct = quizScore.completionRate;

  let congratsMessage = '';
  let congratsEmoji = '';
  if (pct === 100) { congratsMessage = 'Xuất sắc! Bạn đã hoàn thành tất cả!'; congratsEmoji = '🏆'; }
  else if (pct >= 80) { congratsMessage = 'Tuyệt vời! Gần hoàn thành rồi!'; congratsEmoji = '🥇'; }
  else if (pct >= 50) { congratsMessage = 'Tốt lắm! Cảm ơn bạn!'; congratsEmoji = '👏'; }
  else { congratsMessage = 'Cảm ơn bạn đã tham gia!'; congratsEmoji = '💪'; }

  // minibanner icons to display in the celebration
  const minibanners = [
    '/back_asset/minibannerCgAnimal-634ca53ff1fe5b881d23.webp',
    '/back_asset/minibannerCgSpace-c7ae98e8df2d4fd0633f.webp',
    '/back_asset/minibannerCgScience-f6a39d6f2d33678cbfb6.webp',
    '/back_asset/minibannerCgRobot-3805fe37c839c9e9bd90.webp',
    '/back_asset/minibannerCgPuzzle-9d13e3f094c49943ce76.webp',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 relative overflow-hidden">

      {/* Floating decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-8 left-6 text-6xl opacity-20 animate-bounce" style={{animationDelay:'0s',animationDuration:'3s'}}>🎊</div>
        <div className="absolute top-20 right-8 text-5xl opacity-20 animate-bounce" style={{animationDelay:'0.7s',animationDuration:'4s'}}>⭐</div>
        <div className="absolute bottom-24 left-10 text-7xl opacity-20 animate-bounce" style={{animationDelay:'1.2s',animationDuration:'3.5s'}}>🎉</div>
        <div className="absolute bottom-16 right-6 text-5xl opacity-20 animate-bounce" style={{animationDelay:'0.4s',animationDuration:'4.5s'}}>✨</div>
        <div className="absolute top-1/2 left-3 text-4xl opacity-15 animate-pulse">🌟</div>
        <div className="absolute top-1/3 right-3 text-4xl opacity-15 animate-pulse" style={{animationDelay:'1s'}}>🎈</div>
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 py-8 gap-5 min-h-screen">

        {/* Header */}
        <div className="text-center">
          <div className="text-7xl mb-2 animate-bounce">{congratsEmoji}</div>
          <h1 className="text-3xl font-black text-white drop-shadow-lg">{congratsMessage}</h1>
          {studentInfo && (
            <p className="text-white/80 font-medium mt-1">
              👦 {studentInfo.name} · Lớp {studentInfo.class}
            </p>
          )}
        </div>

        {/* Score card */}
        <div className="w-full max-w-sm bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-white p-6">
          <h2 className="text-center font-black text-neutral-700 text-lg mb-4">📊 Kết quả bài làm</h2>
          <div className="flex justify-around items-center mb-4">
            <div className="text-center">
              <div className="text-5xl font-black text-orange-500">{quizScore.completed}</div>
              <p className="text-neutral-500 text-xs font-medium mt-1">/ {quizScore.total} câu</p>
              <p className="text-neutral-400 text-xs">Đã trả lời</p>
            </div>
            <div className="w-px h-16 bg-neutral-200"></div>
            <div className="text-center">
              <div className="text-5xl font-black text-rose-500">{pct}%</div>
              <p className="text-neutral-500 text-xs font-medium mt-1">Tỷ lệ</p>
              <p className="text-neutral-400 text-xs">Hoàn thành</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="bg-orange-100 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-400 to-rose-500 h-4 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Emotion card */}
        <div className="w-full max-w-sm bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-white p-6 text-center">
          <h2 className="font-black text-neutral-700 text-lg mb-3">😊 Cảm xúc của bạn</h2>
          <div className={`inline-block px-6 py-2 rounded-2xl font-black text-xl mb-3 shadow-md ${emotionConfig.color} ${emotionConfig.bgColor} border-2`}>
            {emotion.final_emotion}
          </div>
          <p className="text-neutral-600 font-medium">{emotionConfig.message}</p>
        </div>

        {/* Minibanner icons row */}
        <div className="flex gap-3 justify-center flex-wrap">
          {minibanners.map((src, i) => (
            <div
              key={i}
              className="w-16 h-16 rounded-2xl overflow-hidden border-3 border-white shadow-lg"
              style={{ animationDelay: `${i * 0.15}s`, borderWidth: '3px' }}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="w-full max-w-sm flex flex-col gap-3">
          <button
            onClick={() => {
              sessionStorage.removeItem('quizAnswers');
              sessionStorage.removeItem('quizScore');
              sessionStorage.removeItem('overallEmotion');
              sessionStorage.removeItem('studentInfoForResults');
              router.push('/student-info');
            }}
            className="w-full h-14 rounded-3xl font-black text-lg text-white bg-gradient-to-r from-orange-400 to-rose-500 hover:from-orange-500 hover:to-rose-600 active:scale-95 shadow-2xl transition-all duration-200"
          >
            🔄 Làm lại
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full h-12 rounded-2xl font-bold text-sm text-white/90 bg-white/25 border-2 border-white/40 hover:bg-white/35 transition-all backdrop-blur-sm"
          >
            🏠 Về trang chủ
          </button>
        </div>

      </div>
    </div>
  );
}
