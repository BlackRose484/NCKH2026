'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { QuizResult, QuizAnswer } from '@/types';
import { getQuizSetById } from '@/lib/quizSets';
import { calculateOverallStats } from '@/lib/analytics';


// The two fixed quiz sets shown on the dashboard
const QUIZ_SETS = [
  { id: 'psychology-v1',      label: '🧠 Khảo sát Tâm lý' },
  { id: 'emotion-mastery-v1', label: '🎯 Làm chủ cảm xúc' },
] as const;

// Map total LLM score (sum of textSentiment.score per answer) → level 1-5
// Scoring: score is 0|1|2 per question (up to 30 Qs × 2 = 60 max for psych)
// But the image table shows 0-40 range (5 levels, 8 pts each) using NSCT standard
function getLLMLevel(answers: QuizAnswer[]): number | null {
  const scored = answers.filter(a => a.textSentiment?.score != null);
  if (scored.length === 0) return null;
  const total = scored.reduce((sum, a) => sum + (a.textSentiment!.score as number), 0);
  if (total <= 8)  return 1;
  if (total <= 16) return 2;
  if (total <= 24) return 3;
  if (total <= 32) return 4;
  return 5;
}

// Parse level value — handles old buggy format '{"level":2}' and correct format '2' or 2
function parseLevel(val: string | number | null | undefined): string | null {
  if (val == null) return null;
  const s = String(val).trim();
  if (!s || s === 'null') return null;
  try {
    const parsed = JSON.parse(s);
    if (typeof parsed === 'object' && parsed !== null) {
      const n = parsed.level ?? parsed.status ?? parsed.value;
      return n != null ? String(n) : null;
    }
    return String(parsed);
  } catch {
    return s;
  }
}

const LEVEL_COLORS: Record<number, string> = {
  1: 'bg-green-100 text-green-700',
  2: 'bg-lime-100 text-lime-700',
  3: 'bg-yellow-100 text-yellow-700',
  4: 'bg-orange-100 text-orange-700',
  5: 'bg-red-100 text-red-700',
};

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState('');
  // Active quiz set tab — default Khảo sát Tâm lý
  const [activeQuizSet, setActiveQuizSet] = useState<string>('psychology-v1');

  // Check authentication
  useEffect(() => {
    const isAuth = sessionStorage.getItem('teacherAuth');
    if (!isAuth) router.push('/teacher-login');
  }, [router]);

  // Load results
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/get-results');
        const data = await res.json();
        if (data.success) {
          setResults(data.results);
        }
      } catch (e) {
        console.error('Error loading results:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Apply filters (quiz set tab + class search)
  useEffect(() => {
    let filtered = results.filter(r => r.quizSetId === activeQuizSet);
    if (classFilter) {
      filtered = filtered.filter(r =>
        r.studentInfo?.class.toLowerCase().includes(classFilter.toLowerCase())
      );
    }
    setFilteredResults(filtered);
  }, [classFilter, activeQuizSet, results]);

  const overallStats = calculateOverallStats(filteredResults);


  const handleLogout = () => {
    sessionStorage.removeItem('teacherAuth');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-sky-500 rounded-full animate-spin mb-4"></div>
          <p className="text-neutral-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const isPsych   = activeQuizSet === 'psychology-v1';
  const isEmotion = activeQuizSet === 'emotion-mastery-v1';

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 p-4 py-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/leaderboard.svg" alt="Teacher" width={48} height={48} />
              <div>
                <h1 className="text-2xl font-bold text-neutral-700">📊 Teacher Dashboard</h1>
                <p className="text-sm text-neutral-600">Phân tích tâm lý học sinh</p>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-outline h-10 px-6 text-sm">
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Quiz Set Tabs */}
        <div className="flex gap-2 mb-6">
          {QUIZ_SETS.map(qs => (
            <button
              key={qs.id}
              onClick={() => setActiveQuizSet(qs.id)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                activeQuizSet === qs.id
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-white text-neutral-600 border border-slate-200 hover:border-sky-400'
              }`}
            >
              {qs.label}
            </button>
          ))}
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white py-3">
            <p className="text-xs opacity-90 mb-1">Tổng học sinh</p>
            <p className="text-3xl font-bold">{overallStats.totalStudents}</p>
            <p className="text-xs opacity-75 mt-1">đã tham gia</p>
          </div>
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white py-3">
            <p className="text-xs opacity-90 mb-1">Hoàn thành TB</p>
            <p className="text-3xl font-bold">{overallStats.avgCompletionRate}%</p>
            <p className="text-xs opacity-75 mt-1">{overallStats.avgQuestionsAnswered}/30 câu</p>
          </div>
          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white py-3">
            <p className="text-xs opacity-90 mb-1">Cảm xúc phổ biến</p>
            <p className="text-xl font-bold">{overallStats.mostCommonEmotion}</p>
            <p className="text-xs opacity-75 mt-1">trong lớp</p>
          </div>
          <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white py-3">
            <p className="text-xs opacity-90 mb-1">Tổng câu trả lời</p>
            <p className="text-3xl font-bold">{filteredResults.reduce((s, r) => s + r.quizScore.completed, 0)}</p>
            <p className="text-xs opacity-75 mt-1">câu đã trả lời</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <h2 className="text-lg font-bold text-neutral-700 mb-3">🔍 Bộ lọc</h2>
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Lọc theo lớp</label>
            <input
              type="text"
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              placeholder="Nhập tên lớp..."
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>


        {/* Student List Table */}
        <div className="card">
          <h2 className="text-lg font-bold text-neutral-700 mb-3">
            👥 Danh sách học sinh ({filteredResults.length})
          </h2>

          {filteredResults.length === 0 ? (
            <p className="text-center text-neutral-400 py-8">Chưa có kết quả nào cho bộ câu hỏi này</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left p-3 text-sm font-bold text-neutral-700">Tên</th>
                    <th className="text-left p-3 text-sm font-bold text-neutral-700">Lớp</th>
                    <th className="text-center p-3 text-sm font-bold text-neutral-700">Hoàn thành</th>

                    {/* Psychology columns */}
                    {isPsych && (
                      <>
                        <th className="text-center p-3 text-sm font-bold text-neutral-700">
                          Mức độ
                        </th>
                        <th className="text-center p-3 text-sm font-bold text-neutral-700">
                          LLM Level
                        </th>
                      </>
                    )}

                    {/* Emotion mastery columns */}
                    {isEmotion && (
                      <>
                        <th className="text-center p-3 text-sm font-bold text-neutral-700">
                          Mức độ cảm xúc
                        </th>
                        <th className="text-center p-3 text-sm font-bold text-neutral-700">
                          Mức độ tập trung
                        </th>
                      </>
                    )}

                    <th className="text-left p-3 text-sm font-bold text-neutral-700">Thời gian</th>
                    <th className="text-center p-3 text-sm font-bold text-neutral-700">Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, idx) => {
                    const resultId  = `result_${result.timestamp.replace(/[:.]/g, '-')}`;
                    const llmLevel  = getLLMLevel(result.answers);
                    const llmTotal  = result.answers
                      .filter(a => a.textSentiment?.score != null)
                      .reduce((s, a) => s + (a.textSentiment!.score as number), 0);

                    return (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-sm font-medium text-neutral-700">
                          {result.studentInfo?.name || 'N/A'}
                        </td>
                        <td className="p-3 text-sm text-neutral-600">
                          {result.studentInfo?.class || 'N/A'}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`font-bold ${
                            result.quizScore.completionRate >= 80 ? 'text-green-600' :
                            result.quizScore.completionRate >= 50 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {result.quizScore.completionRate}%
                          </span>
                        </td>

                        {/* Psychology: physicalLevel + LLM Level */}
                        {isPsych && (
                          <>
                            <td className="p-3 text-center">
                              {(() => { const v = parseLevel(result.physicalLevel); return v ? (
                                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-700">Mức {v}</span>
                              ) : <span className="text-xs text-neutral-400">—</span>; })()}
                            </td>
                            <td className="p-3 text-center">
                              {llmLevel != null ? (
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${LEVEL_COLORS[llmLevel]}`}>
                                  Mức {llmLevel}
                                </span>
                              ) : (
                                <span className="text-xs text-neutral-400">—</span>
                              )}
                            </td>
                          </>
                        )}

                        {/* Emotion mastery: physicalLevel (cảm xúc) + engagementLevel (tập trung) */}
                        {isEmotion && (
                          <>
                            <td className="p-3 text-center">
                              {(() => { const v = parseLevel(result.physicalLevel); return v ? (
                                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-700">Mức {v}</span>
                              ) : <span className="text-xs text-neutral-400">—</span>; })()}
                            </td>
                            <td className="p-3 text-center">
                              {(() => { const v = parseLevel(result.engagementLevel); return v ? (
                                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-teal-100 text-teal-700">Mức {v}</span>
                              ) : <span className="text-xs text-neutral-400">—</span>; })()}
                            </td>
                          </>
                        )}

                        <td className="p-3 text-xs text-neutral-500">
                          {new Date(result.timestamp).toLocaleString('vi-VN', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => router.push(`/teacher/student-detail/${resultId}`)}
                            className="text-sky-600 hover:text-sky-700 font-medium text-sm"
                          >
                            Xem →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
