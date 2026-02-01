import { useState, useEffect } from 'react';
import StudentLayout from '../../components/layout/StudentLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Brain, TrendingUp, Target, AlertTriangle, CheckCircle,
  BookOpen, Zap, BarChart3, PieChart, ArrowRight, Sparkles,
  Clock, Award, FileText, Search, RefreshCw
} from 'lucide-react';

// API base URL
const API_URL = 'http://localhost:5000/api';

function AIInsights() {
  const [insights, setInsights] = useState(null);
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch AI insights
      const insightsRes = await fetch(`${API_URL}/ai/insights`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const insightsData = await insightsRes.json();
      if (insightsData.success) {
        setInsights(insightsData.data);
      }

      // Fetch gap analysis
      const gapRes = await fetch(`${API_URL}/ai/gap-analysis`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const gapData = await gapRes.json();
      if (gapData.success) {
        setGapAnalysis(gapData.data);
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeAllNotes = async () => {
    setAnalyzing(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/ai/analyze-notes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      // Refresh insights after analysis
      await fetchInsights();
    } catch (error) {
      console.error('Error analyzing notes:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </StudentLayout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: PieChart },
    { id: 'gaps', label: 'Study Gaps', icon: Target },
    { id: 'recommendations', label: 'Recommendations', icon: Sparkles }
  ];

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Brain className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold">AI Study Insights</h1>
              </div>
              <p className="text-purple-100 max-w-xl">
                Smart analysis of your study materials. Identify weak areas, find important topics, and optimize your exam preparation.
              </p>
            </div>
            
            <Button
              onClick={analyzeAllNotes}
              disabled={analyzing}
              className="bg-white text-purple-600 hover:bg-purple-50 flex items-center gap-2"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Analyze All Notes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Notes</p>
                <p className="text-3xl font-bold">{insights?.totalNotes || 0}</p>
              </div>
              <FileText className="w-10 h-10 text-blue-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Important Notes</p>
                <p className="text-3xl font-bold">{insights?.importantNotes || 0}</p>
              </div>
              <Award className="w-10 h-10 text-emerald-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Avg. Quality</p>
                <p className="text-3xl font-bold">{insights?.averageQuality || 0}%</p>
              </div>
              <BarChart3 className="w-10 h-10 text-amber-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-rose-500 to-pink-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-100 text-sm">Duplicates</p>
                <p className="text-3xl font-bold">{insights?.duplicatesFound || 0}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-rose-200" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Keywords */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-500" />
                Top Keywords in Your Notes
              </h3>
              <div className="flex flex-wrap gap-2">
                {insights?.topKeywords?.map((kw, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      idx < 3
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {kw.word}
                    <span className="ml-1 text-xs opacity-70">({kw.count})</span>
                  </span>
                )) || (
                  <p className="text-gray-500">No keywords analyzed yet</p>
                )}
              </div>
            </Card>

            {/* Progress Overview */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Study Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {gapAnalysis?.overallProgress || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${gapAnalysis?.overallProgress || 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {gapAnalysis?.completedTopics?.length || 0}
                    </p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                    <Clock className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {gapAnalysis?.pendingTopics?.length || 0}
                    </p>
                    <p className="text-xs text-gray-500">Pending</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'gaps' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weak Areas */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Weak Areas to Focus
              </h3>
              <div className="space-y-3">
                {gapAnalysis?.weakAreas?.length > 0 ? (
                  gapAnalysis.weakAreas.slice(0, 5).map((area, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{area.topic}</p>
                        <p className="text-sm text-gray-500">{area.subject}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          area.importance >= 80
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                            : area.importance >= 60
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                        }`}>
                          {area.importance}% important
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No weak areas identified yet</p>
                )}
              </div>
            </Card>

            {/* Suggested Topics */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                Study These Next
              </h3>
              <div className="space-y-3">
                {gapAnalysis?.suggestedTopics?.length > 0 ? (
                  gapAnalysis.suggestedTopics.map((topic, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-purple-500' : 'bg-blue-500'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{topic.topic}</p>
                        <p className="text-sm text-gray-500">{topic.subject}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        topic.priority === 'High'
                          ? 'bg-red-100 text-red-700'
                          : topic.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {topic.priority}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Great job! Keep studying!</p>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI Recommendations
            </h3>
            <div className="space-y-3">
              {insights?.recommendations?.length > 0 ? (
                insights.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl"
                  >
                    <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                      <Zap className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white">{rec}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Great work! No recommendations at this time.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.location.href = '/exam-mode'}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5" />
                <span>Enter Exam Mode</span>
              </div>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => window.location.href = '/notes'}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:opacity-90 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                <span>View Important Notes</span>
              </div>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={analyzeAllNotes}
              disabled={analyzing}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <RefreshCw className={`w-5 h-5 ${analyzing ? 'animate-spin' : ''}`} />
                <span>{analyzing ? 'Analyzing...' : 'Re-analyze Notes'}</span>
              </div>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}

export default AIInsights;
