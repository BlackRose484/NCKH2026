'use client';

import { Question } from '@/types';

interface QuizQuestionProps {
  question: Question;
  answerText: string;
  onAnswerChange: (text: string) => void;
  isSubmitted: boolean;
}

export default function QuizQuestion({
  question,
  answerText,
  onAnswerChange,
  isSubmitted,
}: QuizQuestionProps) {
  const charCount = answerText.length;
  const minChars = 3;
  const isValid = charCount >= minChars;

  return (
    <div className="space-y-6">
      {/* Question Card */}
      <div className="card">
        <div className="flex items-start gap-4">
          <span className="text-3xl">❓</span>
          <div className="flex-1">
            {question.category && (
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold mb-3 uppercase">
                {question.category}
              </span>
            )}
            <h2 className="text-lg md:text-xl font-bold text-neutral-700">
              {question.question}
            </h2>
          </div>
        </div>
      </div>

      {/* Text Input Area */}
      <div className="space-y-3">
        <textarea
          value={answerText}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder={question.placeholder || "Nhập câu trả lời của bạn..."}
          disabled={isSubmitted}
          className={`quiz-input ${isSubmitted ? 'opacity-60 cursor-not-allowed' : ''}`}
          rows={4}
        />
        
        {/* Character count and validation */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {!isSubmitted && (
              <>
                {isValid ? (
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <span className="text-lg">✓</span>
                    Đã đủ độ dài
                  </span>
                ) : (
                  <span className="text-orange-600 font-medium">
                    Tối thiểu {minChars} ký tự
                  </span>
                )}
              </>
            )}
          </div>
          <span className={`font-medium ${charCount >= minChars ? 'text-neutral-600' : 'text-orange-600'}`}>
            {charCount} ký tự
          </span>
        </div>
      </div>
    </div>
  );
}
