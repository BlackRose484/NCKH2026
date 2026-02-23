'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { QuizResult } from '@/types';
import { quizQuestions } from '@/lib/questions';
import { getEmotionConfig } from '@/lib/emotions';
import { calculateStudentAnalytics } from '@/lib/studentAnalytics';
import EmotionTimelineChart from '@/components/charts/EmotionTimelineChart';
import AnswerLengthChart from '@/components/charts/AnswerLengthChart';

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const resultId = params.resultId as string;

  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [editedScores, setEditedScores] = useState<Map<number, 0 | 1 | 2>>(new Map());
  const [teacherComments, setTeacherComments] = useState<Map<number, string>>(new Map());
  const [savingQuestions, setSavingQuestions] = useState<Set<number>>(new Set());
  const [saveSuccess, setSaveSuccess] = useState<number | null>(null);

  useEffect(() => {
    // Check authentication
    const isAuth = sessionStorage.getItem('teacherAuth');
    if (!isAuth) {
      router.push('/teacher-login');
      return;
    }

    // Load specific result directly from file
    const loadResult = async () => {
      try {
        const response = await fetch(`/api/get-result/${resultId}`);
        const data = await response.json();

        if (data.success) {
          setResult(data.result);
        } else {
          console.error('Failed to load result:', data.error);
        }
      } catch (error) {
        console.error('Error loading result:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [resultId, router]);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle score editing
  const handleScoreEdit = (questionId: number, newScore: 0 | 1 | 2) => {
    setEditedScores(prev => {
      const updated = new Map(prev);
      updated.set(questionId, newScore);
      return updated;
    });
  };

  // Save individual question score and comment
  const saveQuestionScore = async (questionId: number) => {
    setSavingQuestions(prev => new Set(prev).add(questionId));
    
    try {
      const answer = result?.answers.find(a => a.questionId === questionId);
      const originalScore = answer?.textSentiment?.score ?? 1;
      const newScore = editedScores.get(questionId) ?? originalScore;
      const comment = teacherComments.get(questionId) || '';
      
      const updates = [{
        questionId,
        originalScore,
        newScore,
        overriddenBy: 'Teacher',
        overriddenAt: new Date().toISOString(),
        reason: comment,
      }];

      const response = await fetch(`/api/update-scores/${resultId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      if (response.ok) {
        // Update result state with new values
        if (result) {
          const updatedResult = { ...result };
          const answerIndex = updatedResult.answers.findIndex(a => a.questionId === questionId);
          if (answerIndex !== -1 && updatedResult.answers[answerIndex].textSentiment) {
            updatedResult.answers[answerIndex].textSentiment!.teacherOverride = {
              originalScore,
              newScore,
              overriddenBy: 'Teacher',
              overriddenAt: new Date().toISOString(),
              reason: comment,
            };
          }
          setResult(updatedResult);
        }
        
        // Remove from edited state
        setEditedScores(prev => {
          const updated = new Map(prev);
          updated.delete(questionId);
          return updated;
        });
        setTeacherComments(prev => {
          const updated = new Map(prev);
          updated.delete(questionId);
          return updated;
        });
        
        // Show success notification
        setSaveSuccess(questionId);
        setTimeout(() => setSaveSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to save');
      }
    } catch (error) {
      console.error('Failed to save score:', error);
    } finally {
      setSavingQuestions(prev => {
        const updated = new Set(prev);
        updated.delete(questionId);
        return updated;
      });
    }
  };

  // Check if question has unsaved changes
  const hasUnsavedChanges = (questionId: number) => {
    return editedScores.has(questionId) || teacherComments.has(questionId);
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

  if (!result) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <p className="text-rose-600 font-medium mb-4">
            Không tìm thấy kết quả
          </p>
          <button
            onClick={() => router.push('/teacher-dashboard')}
            className="btn-primary h-10 px-6 text-sm"
          >
            Quay lại dashboard
          </button>
        </div>
      </div>
    );
  }

  const emotionConfig = getEmotionConfig(result.emotion.final_emotion);

  // LLM score summary
  const llmScored = result.answers.filter(a => a.textSentiment?.score != null);
  const llmTotal  = llmScored.reduce((s, a) => s + (a.textSentiment!.score as number), 0);
  const llmLevel  = llmScored.length === 0 ? null
    : llmTotal <= 8  ? 1
    : llmTotal <= 16 ? 2
    : llmTotal <= 24 ? 3
    : llmTotal <= 32 ? 4
    : 5;
  const LLM_LEVEL_COLORS: Record<number, string> = {
    1: 'text-green-600', 2: 'text-lime-600', 3: 'text-yellow-600',
    4: 'text-orange-600', 5: 'text-red-600',
  };

  return (
    <div className="min-h-screen bg-white p-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Image src="/boy.svg" alt="Student" width={60} height={60} />
              <div>
                <h1 className="text-2xl font-bold text-neutral-700">
                  {result.studentInfo?.name || 'Học sinh'}
                </h1>
                <p className="text-neutral-600">
                  Lớp: {result.studentInfo?.class || 'N/A'}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {formatDate(result.timestamp)}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/teacher-dashboard')}
              className="btn-outline h-10 px-6 text-xs"
            >
              ← Quay lại
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t-2 border-slate-100">
            <div className="text-center">
              <p className="text-sm text-neutral-600 mb-1">Hoàn thành</p>
              <p className="text-3xl font-bold text-sky-600">
                {result.quizScore.completed}/{result.quizScore.total}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {result.quizScore.completionRate}% hoàn thành
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-neutral-600 mb-1">Cảm xúc chung</p>
              <div className={`inline-block px-4 py-2 rounded-xl font-bold text-lg ${emotionConfig.color} ${emotionConfig.bgColor} border-2`}>
                {result.emotion.final_emotion}
              </div>
            </div>
            {result.quizSetId === 'emotion-mastery-v1' ? (
              <>
                {/* Emotion mastery: physicalLevel + engagementLevel */}
                <div className="text-center">
                  <p className="text-sm text-neutral-600 mb-1">Mức độ cảm xúc</p>
                  {result.physicalLevel != null ? (
                    <p className="text-3xl font-bold text-indigo-600">Mức {result.physicalLevel}</p>
                  ) : (
                    <p className="text-3xl font-bold text-neutral-300">—</p>
                  )}
                  <p className="text-xs text-neutral-500 mt-1">từ video phân tích</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-neutral-600 mb-1">Mức độ tập trung</p>
                  {result.engagementLevel != null ? (
                    <p className="text-3xl font-bold text-teal-600">Mức {result.engagementLevel}</p>
                  ) : (
                    <p className="text-3xl font-bold text-neutral-300">—</p>
                  )}
                  <p className="text-xs text-neutral-500 mt-1">từ API engagement</p>
                </div>
              </>
            ) : (
              <>
                {/* Psychology: LLM total + NSCT level */}
                <div className="text-center">
                  <p className="text-sm text-neutral-600 mb-1">Tổng điểm LLM</p>
                  <p className={`text-3xl font-bold ${llmLevel ? LLM_LEVEL_COLORS[llmLevel] : 'text-neutral-400'}`}>
                    {llmScored.length > 0 ? llmTotal : '—'}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">{llmScored.length} câu đã phân tích</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-neutral-600 mb-1">Mức đánh giá (NSCT)</p>
                  {llmLevel != null ? (
                    <p className={`text-3xl font-bold ${LLM_LEVEL_COLORS[llmLevel]}`}>Mức {llmLevel}</p>
                  ) : (
                    <p className="text-3xl font-bold text-neutral-300">—</p>
                  )}
                  <p className="text-xs text-neutral-500 mt-1">
                    {llmLevel ? `${llmTotal} điểm` : 'Chưa có dữ liệu'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Analytics Section */}
        {(() => {
          const analytics = calculateStudentAnalytics(result.answers);
          
          return (
            <>
              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Emotion Timeline */}
                <div className="card">
                  <h2 className="text-lg font-bold text-neutral-700 mb-3">
                    📈 Biến đổi cảm xúc
                  </h2>
                  <EmotionTimelineChart answers={result.answers} />
                  <p className="text-xs text-neutral-500 mt-2">
                    Cảm xúc thay đổi qua 30 câu hỏi
                  </p>
                </div>

                {/* Answer Length */}
                <div className="card">
                  <h2 className="text-lg font-bold text-neutral-700 mb-3">
                    📝 Độ dài câu trả lời
                  </h2>
                  <AnswerLengthChart answers={result.answers} />
                  <p className="text-xs text-neutral-500 mt-2">
                    Màu xanh = chi tiết, đỏ = quá ngắn
                  </p>
                </div>
              </div>

              {/* Insights & Red Flags */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Red Flags */}
                {analytics.redFlags.length > 0 && (
                  <div className="card bg-rose-50 border-2 border-rose-200">
                    <h2 className="text-lg font-bold text-rose-700 mb-3">
                      ⚠️ Cảnh báo
                    </h2>
                    <ul className="space-y-2">
                      {analytics.redFlags.map((flag, idx) => (
                        <li key={idx} className="text-sm text-rose-700 flex items-start gap-2">
                          <span className="mt-0.5">•</span>
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Insights */}
                <div className="card bg-blue-50 border-2 border-blue-200">
                  <h2 className="text-lg font-bold text-blue-700 mb-3">
                    💡 Nhận xét
                  </h2>
                  {analytics.insights.length > 0 ? (
                    <ul className="space-y-2">
                      {analytics.insights.map((insight, idx) => (
                        <li key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                          <span className="mt-0.5">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-blue-600">Không có nhận xét đặc biệt</p>
                  )}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="card mb-6">
                <h2 className="text-lg font-bold text-neutral-700 mb-3">
                  📚 Phân tích theo chủ đề
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analytics.categoryStats.map((cat, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                      <h3 className="font-bold text-neutral-700 mb-3">{cat.category}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Hoàn thành:</span>
                          <span className={`font-bold ${
                            cat.answered >= cat.total * 0.8 ? 'text-green-600' :
                            cat.answered >= cat.total * 0.5 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {cat.answered}/{cat.total}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Độ dài TB:</span>
                          <span className="font-bold text-neutral-700">{cat.avgLength} ký tự</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Cảm xúc:</span>
                          <span className={`font-bold ${
                            cat.dominantEmotion === 'Happiness' ? 'text-green-600' :
                            cat.dominantEmotion === 'Neutral' ? 'text-gray-600' :
                            cat.dominantEmotion === 'Sadness' || cat.dominantEmotion === 'Anger' ? 'text-red-600' :
                            'text-blue-600'
                          }`}>
                            {cat.dominantEmotion}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          );
        })()}

        {/* Questions Grid */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-neutral-700">
            📊 Phân tích câu trả lời - Cảm xúc
          </h2>

          {result.answers.map((answer, idx) => {
            const question = quizQuestions.find(q => q.id === answer.questionId);
            const answerEmotion = answer.emotion?.final_emotion || 'N/A';
            const answerEmotionConfig = answer.emotion ? getEmotionConfig(answer.emotion.final_emotion) : null;

            return (
              <div key={idx} className="card">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Video */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-bold text-neutral-700">
                        🎥 Video câu {idx + 1}
                      </h3>
                      {answerEmotionConfig && (
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${answerEmotionConfig.color} ${answerEmotionConfig.bgColor}`}>
                          {answerEmotion}
                        </span>
                      )}
                    </div>
                    
                    {/* Video container with fixed aspect ratio */}
                    <div className="relative w-full bg-slate-100 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                      <video
                        src={`/api/get-video?path=${encodeURIComponent(answer.videoFilename || '')}`}
                        controls
                        className="absolute inset-0 w-full h-full object-contain border-2 border-slate-200"
                        poster="/video-placeholder.png"
                      >
                        Trình duyệt không hỗ trợ video
                      </video>
                    </div>
                    
                    {/* Emotion confidence */}
                    {answer.emotion?.confidence && answer.emotion.confidence > 0 && (
                      <div className="mt-2 text-xs text-neutral-500">
                        Độ tin cậy: {Math.round(answer.emotion.confidence * 100)}%
                      </div>
                    )}
                  </div>

                  {/* Right: Question & Answer */}
                  <div>
                    {/* Question */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          Câu {idx + 1}
                        </span>
                        {question?.category && (
                          <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                            {question.category}
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-800 font-medium text-base">
                        {question?.question}
                      </p>
                    </div>

                    {/* Student's Answer */}
                    <div className="mb-4">
                      <label className="text-xs font-bold text-neutral-600 uppercase mb-2 block">
                        Câu trả lời của học sinh:
                      </label>
                      {answer.isAnswered ? (
                        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                          <p className="text-neutral-800 whitespace-pre-wrap">
                            {answer.answerText}
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-lg">
                          <p className="text-neutral-400 italic">
                            Chưa trả lời
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Analysis section — engagement for emotion-mastery, LLM for psychology */}
                    {result.quizSetId === 'emotion-mastery-v1' ? (
                      /* Engagement score section */
                      answer.engagementScore ? (
                        <div className="mb-4">
                          <label className="text-xs font-bold text-neutral-600 uppercase mb-2 block">
                            🎯 Đánh giá mức độ tập trung (Engagement):
                          </label>
                          <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              {answer.engagementScore.level != null ? (
                                <span className="px-4 py-2 rounded-xl text-base font-black bg-teal-500 text-white shadow">
                                  Mức {answer.engagementScore.level}
                                </span>
                              ) : (
                                <span className="text-sm text-neutral-400 italic">Không xác định được</span>
                              )}
                              <span className="text-xs text-teal-600">
                                Được đo lúc {new Date(answer.engagementScore.analyzedAt).toLocaleTimeString('vi-VN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : null
                    ) : (
                      /* LLM Sentiment section — psychology quiz */
                      answer.textSentiment && (() => {
                        const currentScore = editedScores.get(answer.questionId)
                          ?? answer.textSentiment!.teacherOverride?.newScore
                          ?? answer.textSentiment!.score;
                        return (
                          <div className="mb-4">
                            <label className="text-xs font-bold text-neutral-600 uppercase mb-2 block">
                              📊 Phân tích cảm xúc từ văn bản (LLM):
                            </label>
                            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                                    currentScore === 0 ? 'bg-green-500 text-white'
                                    : currentScore === 1 ? 'bg-yellow-500 text-white'
                                    : 'bg-red-500 text-white'
                                  }`}>
                                    {currentScore === 0 ? '😊 Tích cực' : currentScore === 1 ? '😐 Trung tính' : '😢 Tiêu cực'}
                                  </span>
                                  {(answer.textSentiment!.teacherOverride || editedScores.has(answer.questionId)) && (
                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-medium">
                                      ✏️ {editedScores.has(answer.questionId) ? 'Đang sửa' : 'Đã sửa bởi giáo viên'}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-purple-600">
                                  {answer.textSentiment!.provider} ({answer.textSentiment!.source})
                                </span>
                              </div>
                              {answer.textSentiment!.reasoning && (
                                <p className="text-sm text-neutral-700 mb-3 italic">"{answer.textSentiment!.reasoning}"</p>
                              )}
                              <div className="flex items-center gap-2 pt-3 border-t border-purple-200">
                                <span className="text-xs text-neutral-600 font-medium">Sửa điểm:</span>
                                {([0, 1, 2] as const).map(s => (
                                  <button key={s} onClick={() => handleScoreEdit(answer.questionId, s)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                      currentScore === s
                                        ? s === 0 ? 'bg-green-500 text-white' : s === 1 ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
                                        : 'bg-slate-100 text-neutral-600 hover:bg-slate-200'
                                    }`}>
                                    {s === 0 ? '😊 Tích cực' : s === 1 ? '😐 Trung tính' : '😢 Tiêu cực'}
                                  </button>
                                ))}
                              </div>

                              {/* Teacher Comment */}
                              <div className="mt-3 pt-3 border-t border-purple-200">
                                <label className="text-xs text-neutral-600 font-medium block mb-2">
                                  💬 Nhận xét của giáo viên:
                                </label>
                                <textarea
                                  value={teacherComments.get(answer.questionId) || answer.textSentiment!.teacherOverride?.reason || ''}
                                  onChange={(e) => {
                                    setTeacherComments(prev => {
                                      const updated = new Map(prev);
                                      if (e.target.value) { updated.set(answer.questionId, e.target.value); }
                                      else { updated.delete(answer.questionId); }
                                      return updated;
                                    });
                                  }}
                                  placeholder="Nhập nhận xét về câu trả lời này (tùy chọn)..."
                                  className="w-full px-3 py-2 text-sm border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 resize-none"
                                  rows={2}
                                />
                                {hasUnsavedChanges(answer.questionId) && (
                                  <button
                                    onClick={() => saveQuestionScore(answer.questionId)}
                                    disabled={savingQuestions.has(answer.questionId)}
                                    className="mt-2 w-full btn-primary h-9 text-sm font-bold disabled:opacity-50"
                                  >
                                    {savingQuestions.has(answer.questionId) ? '⏳ Đang lưu...' : '💾 Lưu thay đổi câu này'}
                                  </button>
                                )}
                                {saveSuccess === answer.questionId && (
                                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg text-center">
                                    <span className="text-sm text-green-700 font-medium">✅ Đã lưu thành công!</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    )}

                    {/* Answer-Emotion Correlation */}
                    {answer.isAnswered && answerEmotionConfig && (
                      <div className={`p-4 rounded-lg border-2 ${answerEmotionConfig.bgColor} ${answerEmotionConfig.color} border-opacity-50`}>
                        <p className="text-xs font-bold uppercase mb-1">
                          🧠 Tương quan cảm xúc
                        </p>
                        <p className="text-sm">
                          Học sinh cảm thấy <strong>{answerEmotion}</strong> khi trả lời câu này
                        </p>
                      </div>
                    )}

                    {/* Timestamp */}
                    <p className="text-xs text-neutral-400 mt-4">
                      ⏱️ Trả lời lúc: {formatDate(answer.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
