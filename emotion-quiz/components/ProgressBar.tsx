import Image from 'next/image';

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-neutral-600 font-bold text-sm">
          Câu hỏi {current} / {total}
        </span>
        <span className="text-neutral-500 font-semibold text-xs">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
