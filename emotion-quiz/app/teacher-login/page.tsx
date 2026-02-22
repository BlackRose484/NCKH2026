'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function TeacherLoginPage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simple validation against hardcoded code
    const TEACHER_CODE = 'TEACHER2026'; // In production, this should be in env and verified server-side

    if (accessCode.trim() === TEACHER_CODE) {
      // Set teacher auth in sessionStorage
      sessionStorage.setItem('teacherAuth', 'true');
      router.push('/teacher-dashboard');
    } else {
      setError('Mã giáo viên không đúng');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <Image
              src="/woman.svg"
              alt="Teacher"
              width={120}
              height={120}
              className="mx-auto"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-700 mb-3">
            Đăng nhập giáo viên
          </h1>
          <p className="text-neutral-600">
            Nhập mã truy cập để xem kết quả học sinh
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Access Code Input */}
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2">
              Mã giáo viên <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              value={accessCode}
              onChange={(e) => {
                setAccessCode(e.target.value);
                setError('');
              }}
              placeholder="Nhập mã truy cập"
              className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-sky-500 focus:outline-none transition-colors text-neutral-700 font-medium"
              disabled={loading}
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

          {/* Hint */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
            <p className="text-blue-600 text-xs">
              💡 Mã mặc định: <code className="font-mono font-bold">TEACHER2026</code>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full h-12 px-8 text-sm disabled:opacity-50"
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
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
