'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getAllQuizSets, QuizSet } from '@/lib/quizSets';

export default function QuizSelectionPage() {
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const quizSets = getAllQuizSets();

  const handleStartQuiz = (quizSetId: string) => {
    // Store selected quiz in sessionStorage
    sessionStorage.setItem('selectedQuizSetId', quizSetId);
    router.push('/quiz');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Image src="/quiz.svg" alt="Quiz" width={80} height={80} />
          </div>
          <h1 className="text-4xl font-bold text-neutral-700 mb-3">
            Chọn bộ câu hỏi
          </h1>
          <p className="text-neutral-600 text-lg">
            Hãy chọn bộ câu hỏi bạn muốn thực hiện
          </p>
        </div>

        {/* Quiz Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {quizSets.map((quiz) => (
            <div
              key={quiz.id}
              className={`card cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                selectedQuiz === quiz.id ? 'ring-4 ring-sky-500' : ''
              }`}
              onClick={() => setSelectedQuiz(quiz.id)}
            >
              {/* Quiz Icon & Color Header */}
              <div className={`bg-gradient-to-br ${quiz.color} p-6 rounded-t-2xl -m-6 mb-4`}>
                <div className="text-6xl text-center mb-2">{quiz.icon}</div>
                <h2 className="text-2xl font-bold text-white text-center">
                  {quiz.name}
                </h2>
              </div>

              {/* Quiz Details */}
              <div className="space-y-3">
                <p className="text-neutral-600 text-sm leading-relaxed">
                  {quiz.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t-2 border-slate-100">
                  <div className="text-center">
                    <p className="text-xs text-neutral-500">Số câu hỏi</p>
                    <p className="text-lg font-bold text-sky-600">{quiz.totalQuestions}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-neutral-500">Thời gian</p>
                    <p className="text-lg font-bold text-green-600">~{quiz.estimatedMinutes} phút</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-neutral-500">Danh mục</p>
                    <p className="text-lg font-bold text-purple-600">{quiz.category}</p>
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartQuiz(quiz.id);
                  }}
                  className="btn-primary w-full mt-4"
                >
                  Bắt đầu làm bài
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="btn-outline px-8"
          >
            ← Quay lại trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
