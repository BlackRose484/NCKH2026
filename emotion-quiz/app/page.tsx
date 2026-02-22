import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-4">
      <div className="mx-auto flex w-full max-w-[988px] flex-1 flex-col items-center justify-center gap-8 lg:flex-row">
        {/* Hero Image - Left */}
        <div className="relative h-[240px] w-[240px] lg:h-[424px] lg:w-[424px] mb-8 lg:mb-0">
          <Image 
            src="/hero.svg" 
            alt="Hero" 
            width={424}
            height={424}
            priority
            className="w-full h-full"
          />
        </div>

        {/* Content - Right */}
        <div className="flex flex-col items-center gap-y-8 max-w-[480px]">
          <h1 className="text-center text-xl font-bold text-neutral-600 lg:text-3xl">
            Khám phá cảm xúc của bạn qua bài trắc nghiệm thú vị! 🎉
          </h1>

          {/* Info Cards */}
          <div className="w-full space-y-3">
            <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-4 border-2 border-blue-100">
              <Image src="/learn.svg" alt="Learn" width={32} height={32} />
              <p className="text-sm text-neutral-600 font-medium">
                <strong>10 câu hỏi</strong> thú vị đang chờ bạn
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-purple-50 rounded-xl p-4 border-2 border-purple-100">
              <span className="text-2xl">📸</span>
              <p className="text-sm text-neutral-600 font-medium">
                Camera ghi lại biểu cảm của bạn
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-green-50 rounded-xl p-4 border-2 border-green-100">
              <Image src="/heart.svg" alt="Heart" width={32} height={32} />
              <p className="text-sm text-neutral-600 font-medium">
                Phân tích cảm xúc khi làm bài
              </p>
            </div>
          </div>

          {/* Camera Notice */}
          <div className="w-full bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
            <p className="text-yellow-800 font-bold text-sm flex items-center justify-center gap-2">
              <span className="text-xl">⚠️</span>
              Cần cho phép sử dụng camera
            </p>
          </div>

          {/* Buttons */}
          <div className="flex w-full max-w-[330px] flex-col items-center gap-y-3">
            <Link href="/role-selection" className="w-full">
              <button className="btn-secondary w-full h-12 px-8 text-sm">
                Bắt đầu ngay
              </button>
            </Link>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            <Image src="/mascot.svg" alt="Mascot" width={20} height={20} />
            <span>Microsense - Emotion Detection</span>
          </div>
        </div>
      </div>
    </div>
  );
}
