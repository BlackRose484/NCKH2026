'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { QuizResult } from '@/types';
import { getEmotionConfig } from '@/lib/emotions';
import { getAllQuizSets, getQuizSetById } from '@/lib/quizSets';
import {
  calculateEmotionDistribution,
  calculateCompletionDistribution,
  calculateCategoryStats,
  calculateOverallStats,
} from '@/lib/analytics';
import EmotionDistributionChart from '@/components/charts/EmotionDistributionChart';
import CompletionRateChart from '@/components/charts/CompletionRateChart';
import CategoryAnalysisChart from '@/components/charts/CategoryAnalysisChart';

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState('');
  const [emotionFilter, setEmotionFilter] = useState<string>('');
  const [quizSetFilter, setQuizSetFilter] = useState<string>('');

  // Check authentication
  useEffect(() => {
    const isAuth = sessionStorage.getItem('teacherAuth');
    if (!isAuth) {
      router.push('/teacher-login');
    }
  }, [router]);

  // Load results
  useEffect(() => {
    const loadResults = async () => {
      try {
        const response = await fetch('/api/get-results');
        const data = await response.json();
        
        if (data.success) {
          setResults(data.results);
          setFilteredResults(data.results);
        }
      } catch (error) {
        console.error('Error loading results:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = results;

    if (classFilter) {
      filtered = filtered.filter(r => 
        r.studentInfo?.class.toLowerCase().includes(classFilter.toLowerCase())
      );
    }

    if (emotionFilter) {
      filtered = filtered.filter(r => r.emotion.final_emotion === emotionFilter);
    }

    if (quizSetFilter) {
      filtered = filtered.filter(r => r.quizSetId === quizSetFilter);
    }

    setFilteredResults(filtered);
  }, [classFilter, emotionFilter, quizSetFilter, results]);

  // Calculate analytics
  const overallStats = calculateOverallStats(results);
  const emotionDistribution = calculateEmotionDistribution(results);
  const completionDistribution = calculateCompletionDistribution(results);
  const categoryStats = calculateCategoryStats(results);

  const handleLogout = () => {
    sessionStorage.removeItem('teacherAuth');
    router.push('/');
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 p-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/teacher.svg" alt="Teacher" width={48} height={48} />
              <div>
                <h1 className="text-2xl font-bold text-neutral-700">
                  📊 Teacher Dashboard
                </h1>
                <p className="text-sm text-neutral-600">Phân tích tâm lý học sinh</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-outline h-10 px-6 text-sm"
            >
              Đăng xuất
            </button>
          </div>
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
            <p className="text-3xl font-bold">{results.reduce((sum, r) => sum + r.quizScore.completed, 0)}</p>
            <p className="text-xs opacity-75 mt-1">câu đã trả lời</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Emotion Distribution */}
          <div className="card">
            <h2 className="text-lg font-bold text-neutral-700 mb-3">
              😊 Phân bố cảm xúc
            </h2>
            <EmotionDistributionChart data={emotionDistribution} />
          </div>

          {/* Completion Rate */}
          <div className="card">
            <h2 className="text-lg font-bold text-neutral-700 mb-3">
              ✅ Tỷ lệ hoàn thành
            </h2>
            <CompletionRateChart data={completionDistribution} />
          </div>
        </div>

        {/* Category Analysis */}
        <div className="card mb-6">
          <h2 className="text-lg font-bold text-neutral-700 mb-3">
            📚 Phân tích theo chủ đề
          </h2>
          <CategoryAnalysisChart data={categoryStats} />
          
          {/* Category completion stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {categoryStats.map((cat, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                <p className="font-bold text-neutral-700 mb-2">{cat.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Hoàn thành:</span>
                  <span className={`font-bold ${
                    cat.avgCompletion >= 80 ? 'text-green-600' :
                    cat.avgCompletion >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {cat.avgCompletion}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <h2 className="text-lg font-bold text-neutral-700 mb-3">
            🔍 Bộ lọc
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Lọc theo bộ câu hỏi
              </label>
              <select
                value={quizSetFilter}
                onChange={(e) => setQuizSetFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-sky-500 focus:outline-none"
              >
                <option value="">Tất cả bộ câu hỏi</option>
                {getAllQuizSets().map(quiz => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.icon} {quiz.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Lọc theo lớp
              </label>
              <input
                type="text"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                placeholder="Nhập tên lớp..."
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Lọc theo cảm xúc
              </label>
              <select
                value={emotionFilter}
                onChange={(e) => setEmotionFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-sky-500 focus:outline-none"
              >
                <option value="">Tất cả cảm xúc</option>
                <option value="Happiness">Happiness</option>
                <option value="Neutral">Neutral</option>
                <option value="Sadness">Sadness</option>
                <option value="Anger">Anger</option>
                <option value="Fear">Fear</option>
                <option value="Surprise">Surprise</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="card">
          <h2 className="text-lg font-bold text-neutral-700 mb-3">
            👥 Danh sách học sinh ({filteredResults.length})
          </h2>
          
          {filteredResults.length === 0 ? (
            <p className="text-center text-neutral-400 py-8">
              Chưa có kết quả nào
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left p-3 text-sm font-bold text-neutral-700">Tên</th>
                    <th className="text-left p-3 text-sm font-bold text-neutral-700">Lớp</th>
                    <th className="text-left p-3 text-sm font-bold text-neutral-700">Bộ câu hỏi</th>
                    <th className="text-center p-3 text-sm font-bold text-neutral-700">Hoàn thành</th>
                    <th className="text-center p-3 text-sm font-bold text-neutral-700">Cảm xúc</th>
                    <th className="text-left p-3 text-sm font-bold text-neutral-700">Thời gian</th>
                    <th className="text-center p-3 text-sm font-bold text-neutral-700">Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, idx) => {
                    const emotionConfig = getEmotionConfig(result.emotion.final_emotion);
                    const quizSet = getQuizSetById(result.quizSetId);
                    
                    // Generate resultId matching the filename format
                    const resultId = `result_${result.timestamp.replace(/[:.]/g, '-')}`;

                    return (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-sm font-medium text-neutral-700">
                          {result.studentInfo?.name || 'N/A'}
                        </td>
                        <td className="p-3 text-sm text-neutral-600">
                          {result.studentInfo?.class || 'N/A'}
                        </td>
                        <td className="p-3 text-sm text-neutral-600">
                          <span className="inline-flex items-center gap-1">
                            <span>{quizSet?.icon || '📝'}</span>
                            <span>{quizSet?.name || 'Unknown'}</span>
                          </span>
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
                        <td className="p-3 text-center">
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${emotionConfig.color} ${emotionConfig.bgColor}`}>
                            {result.emotion.final_emotion}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-neutral-500">
                          {new Date(result.timestamp).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
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
