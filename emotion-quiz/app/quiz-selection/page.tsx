'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getAllQuizSets } from '@/lib/quizSets';

export default function QuizSelectionPage() {
  const router   = useRouter();
  const quizSets = getAllQuizSets();

  const handleStart = (quizSetId: string) => {
    sessionStorage.setItem('selectedQuizSetId', quizSetId);
    router.push('/quiz');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-3">
            <Image src="/hero.svg" alt="Quiz" width={64} height={64} />
          </div>
          <h1 className="text-3xl font-bold text-neutral-700 mb-1">Chọn bộ câu hỏi</h1>
          <p className="text-neutral-500 text-sm">Hãy chọn bộ câu hỏi bạn muốn thực hiện</p>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-4 mb-8">
          {quizSets.map((quiz) => (
            <button
              key={quiz.id}
              onClick={() => handleStart(quiz.id)}
              className="w-full text-left rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-sky-300"
            >
              <div className="flex items-stretch">
                {/* Colour strip + icon */}
                <div className={`bg-gradient-to-b ${quiz.color} flex flex-col items-center justify-center px-6 py-5 min-w-[96px]`}>
                  <span className="text-4xl leading-none">{quiz.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1 bg-white px-5 py-4 flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-800 mb-0.5">{quiz.name}</h2>
                    <p className="text-xs text-neutral-500 leading-snug">{quiz.description}</p>
                  </div>

                  {/* Meta chips */}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="flex items-center gap-1 text-xs font-medium bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full">
                      📋 {quiz.totalQuestions} câu
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                      ⏱ ~{quiz.estimatedMinutes} phút
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full">
                      🏷 {quiz.category}
                    </span>
                    <span className="ml-auto text-xs font-bold text-sky-600 flex items-center gap-1">
                      Bắt đầu →
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Back */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            ← Quay lại trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
