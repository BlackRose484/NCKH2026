'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function RoleSelectionPage() {
  const router = useRouter();

  const handleRoleSelect = (role: 'student' | 'teacher') => {
    if (role === 'student') {
      router.push('/student-info');
    } else {
      router.push('/teacher-login');
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-4">
      <div className="max-w-[988px] w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-700 mb-4">
            Bạn là ai? 👋
          </h1>
          <p className="text-neutral-600 text-lg">
            Chọn vai trò của bạn để tiếp tục
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Student Card */}
          <button
            onClick={() => handleRoleSelect('student')}
            className="card hover:border-green-500 hover:shadow-xl transition-all duration-300 group cursor-pointer"
          >
            <div className="text-center">
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/boy.svg"
                  alt="Student"
                  width={150}
                  height={150}
                  className="mx-auto"
                />
              </div>
              <h2 className="text-2xl font-bold text-neutral-700 mb-3">
                Học sinh
              </h2>
              <p className="text-neutral-600 mb-4">
                Làm bài trắc nghiệm và khám phá cảm xúc
              </p>
              <div className="inline-block px-6 py-2 bg-green-50 text-green-600 rounded-xl font-bold text-sm border-2 border-green-200">
                Bắt đầu làm bài →
              </div>
            </div>
          </button>

          {/* Teacher Card */}
          <button
            onClick={() => handleRoleSelect('teacher')}
            className="card hover:border-sky-500 hover:shadow-xl transition-all duration-300 group cursor-pointer"
          >
            <div className="text-center">
              <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/woman.svg"
                  alt="Teacher"
                  width={150}
                  height={150}
                  className="mx-auto"
                />
              </div>
              <h2 className="text-2xl font-bold text-neutral-700 mb-3">
                Giáo viên
              </h2>
              <p className="text-neutral-600 mb-4">
                Xem kết quả và theo dõi học sinh
              </p>
              <div className="inline-block px-6 py-2 bg-sky-50 text-sky-600 rounded-xl font-bold text-sm border-2 border-sky-200">
                Đăng nhập →
              </div>
            </div>
          </button>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/')}
            className="text-neutral-500 hover:text-neutral-700 font-medium text-sm"
          >
            ← Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
