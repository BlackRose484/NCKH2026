'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function StudentInfoPage() {
  const router = useRouter();
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!studentName.trim()) {
      setError('Vui lòng nhập họ và tên');
      return;
    }
    
    if (!studentClass.trim()) {
      setError('Vui lòng nhập lớp');
      return;
    }

    // Save to sessionStorage
    sessionStorage.setItem('studentInfo', JSON.stringify({
      name: studentName.trim(),
      class: studentClass.trim(),
    }));

    // Navigate to quiz selection
    router.push('/quiz-selection');
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <Image
              src="/boy.svg"
              alt="Student"
              width={120}
              height={120}
              className="mx-auto"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-700 mb-3">
            Thông tin học sinh
          </h1>
          <p className="text-neutral-600">
            Nhập thông tin của bạn để bắt đầu
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => {
                setStudentName(e.target.value);
                setError('');
              }}
              placeholder="Ví dụ: Nguyễn Văn A"
              className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:outline-none transition-colors text-neutral-700 font-medium"
            />
          </div>

          {/* Class Input */}
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2">
              Lớp <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={studentClass}
              onChange={(e) => {
                setStudentClass(e.target.value);
                setError('');
              }}
              placeholder="Ví dụ: 10A1"
              className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:outline-none transition-colors text-neutral-700 font-medium"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-3">
              <p className="text-rose-600 text-sm font-medium">
                ⚠️ {error}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-secondary w-full h-12 px-8 text-sm"
          >
            Bắt đầu làm bài
          </button>

          {/* Back Button */}
          <button
            type="button"
            onClick={() => router.push('/role-selection')}
            className="w-full text-neutral-500 hover:text-neutral-700 font-medium text-sm py-2"
          >
            ← Quay lại
          </button>
        </form>
      </div>
    </div>
  );
}
