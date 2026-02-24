'use client';
import { QuizAnswer } from '@/types';

interface Props {
  answers: QuizAnswer[];
}

// Helper: parse engaged/disengaged from raw API response
// API returns { status: "Engaged" | "DisEngaged" }
const getEngagementStatus = (a: QuizAnswer): 'engaged' | 'disengaged' | null => {
  const raw = a.engagementScore?.raw as Record<string, unknown> | undefined;
  const rawStatus = raw?.status ?? raw?.label ?? raw?.engagement_status;
  if (typeof rawStatus === 'string') {
    const s = rawStatus.toLowerCase();
    if (s === 'engaged') return 'engaged';
    if (s.includes('disengage') || s === 'not_engaged') return 'disengaged';
  }
  // Fallback to numeric level if present
  const level = a.engagementScore?.level;
  if (level != null) return (level as number) >= 3 ? 'engaged' : 'disengaged';
  return null;
};

export default function EngagementBarChart({ answers }: Props) {
  const scored      = answers.filter(a => getEngagementStatus(a) !== null);
  const engaged     = scored.filter(a => getEngagementStatus(a) === 'engaged').length;
  const disengaged  = scored.filter(a => getEngagementStatus(a) === 'disengaged').length;
  const total       = scored.length;

  if (total === 0) {
    return (
      <p className="text-sm text-neutral-400 italic text-center py-4">
        Chưa có dữ liệu tập trung
      </p>
    );
  }

  const engagedPct   = Math.round((engaged   / total) * 100);
  const disengagedPct = Math.round((disengaged / total) * 100);

  return (
    <div className="space-y-4">
      {/* Summary badges */}
      <div className="flex items-center justify-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <span className="text-sm font-semibold text-emerald-700">
            Tập trung (Engaged):&nbsp;<strong>{engaged}</strong> câu ({engagedPct}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
          <span className="text-sm font-semibold text-rose-700">
            Không tập trung (Disengaged):&nbsp;<strong>{disengaged}</strong> câu ({disengagedPct}%)
          </span>
        </div>
      </div>

      {/* Stacked bar */}
      <div className="w-full h-8 rounded-full overflow-hidden bg-slate-100 flex shadow-inner">
        {engagedPct > 0 && (
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-green-500 flex items-center justify-center text-white text-xs font-bold"
            style={{ width: `${engagedPct}%` }}
          >
            {engagedPct >= 12 ? `${engagedPct}%` : ''}
          </div>
        )}
        {disengagedPct > 0 && (
          <div
            className="h-full bg-gradient-to-r from-rose-400 to-red-500 flex items-center justify-center text-white text-xs font-bold"
            style={{ width: `${disengagedPct}%` }}
          >
            {disengagedPct >= 12 ? `${disengagedPct}%` : ''}
          </div>
        )}
        {/* Remaining (no data) */}
        {engagedPct + disengagedPct < 100 && (
          <div className="h-full bg-slate-200 flex-1" />
        )}
      </div>

      {/* Per-question dots */}
      <div className="flex flex-wrap gap-2 justify-center pt-1">
        {answers.map((a, idx) => {
          const status = getEngagementStatus(a);
          return (
            <div
              key={a.questionId ?? idx}
              title={`Câu ${idx + 1}: ${status === 'engaged' ? 'Engaged' : status === 'disengaged' ? 'DisEngaged' : 'Chưa phân tích'}`}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-sm transition-transform hover:scale-110 cursor-default ${
                status === 'engaged'    ? 'bg-emerald-500' :
                status === 'disengaged' ? 'bg-rose-500'    :
                                          'bg-slate-300'
              }`}
            >
              {idx + 1}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-neutral-400 text-center">
        🟢 Engaged &nbsp;|&nbsp; 🔴 DisEngaged &nbsp;|&nbsp; ⚪ Chưa phân tích
      </p>
    </div>
  );
}
