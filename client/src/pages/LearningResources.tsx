import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Clock, 
  ExternalLink, 
  Play, 
  CheckCircle, 
  Calendar, 
  Target, 
  Plus, 
  X,
  BarChart3,
  Filter,
  FileText,
  Video,
  GraduationCap,
  Link,
  Search
} from 'lucide-react';
import './LearningResources.css';

interface LearningResource {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  tags: string[];
  difficulty: string;
  estimatedTime: number;
  createdAt: string;
  progress?: {
    status: string;
    completionPercentage: number;
    timeSpent: number;
    lastAccessed: string | null;
  };
}

interface StudyPlan {
  id: string;
  title: string;
  description: string;
  goals: string;
  timeAvailable: number;
  difficulty: string;
  subjects: string[];
  duration: number;
  weeks: any[];
  milestones: any[];
  recommendations: any[];
  status: string;
  createdAt: string;
}

interface Statistics {
  totalResources: number;
  completedResources: number;
  inProgressResources: number;
  totalTimeSpent: number;
  averageCompletion: number;
  resourcesByType: Record<string, any>;
  recentActivity: any[];
}

function LearningResources() {
  const [activeTab, setActiveTab] = useState('resources');
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [filteredResources, setFilteredResources] = useState<LearningResource[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [recommendations, setRecommendations] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 过滤和搜索状态
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  
  // 添加资源表单状态
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'article',
    url: '',
    tags: '',
    difficulty: 'beginner',
    estimatedTime: 0
  });
  
  // 学习计划生成表单状态
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planForm, setPlanForm] = useState({
    goals: '',
    timeAvailable: 10,
    difficulty: 'intermediate',
    subjects: '',
    duration: 4
  });

  const tabs = [
    { id: 'resources', label: '学习资源', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'progress', label: '学习进度', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'plans', label: '学习计划', icon: <Calendar className="w-5 h-5" /> },
    { id: 'recommendations', label: '推荐资源', icon: <Target className="w-5 h-5" /> }
  ];

  const resourceTypes = [
    { value: 'all', label: '全部类型', icon: <Filter className="w-4 h-4" /> },
    { value: 'article', label: '文章', icon: <FileText className="w-4 h-4" /> },
    { value: 'video', label: '视频', icon: <Video className="w-4 h-4" /> },
    { value: 'book', label: '书籍', icon: <BookOpen className="w-4 h-4" /> },
    { value: 'course', label: '课程', icon: <GraduationCap className="w-4 h-4" /> },
    { value: 'document', label: '文档', icon: <FileText className="w-4 h-4" /> },
    { value: 'link', label: '链接', icon: <Link className="w-4 h-4" /> }
  ];

  const statusTypes = [
    { value: 'all', label: '全部状态' },
    { value: 'not_started', label: '未开始' },
    { value: 'in_progress', label: '学习中' },
    { value: 'completed', label: '已完成' },
    { value: 'paused', label: '已暂停' }
  ];

  const difficultyLevels = [
    { value: 'all', label: '全部难度' },
    { value: 'beginner', label: '初级' },
    { value: 'intermediate', label: '中级' },
    { value: 'advanced', label: '高级' }
  ];

  useEffect(() => {
    loadResources();
    loadStatistics();
    loadStudyPlans();
    loadRecommendations();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, typeFilter, statusFilter, difficultyFilter]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/v1/learning/resources', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setResources(result.data.resources);
      }
    } catch (error) {
      console.error('加载学习资源失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/v1/learning/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setStatistics(result.data);
      }
    } catch (error) {
      console.error('加载学习统计失败:', error);
    }
  };

  const loadStudyPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/learning/study-plans', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setStudyPlans(result.data);
      }
    } catch (error) {
      console.error('加载学习计划失败:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/learning/recommendations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setRecommendations(result.data.recommendations);
      }
    } catch (error) {
      console.error('加载推荐资源失败:', error);
    }
  };

  const filterResources = () => {
    let filtered = [...resources];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(resource => resource.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(resource => {
        const status = resource.progress?.status || 'not_started';
        return status === statusFilter;
      });
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(resource => resource.difficulty === difficultyFilter);
    }

    setFilteredResources(filtered);
  };

  const addResource = async () => {
    if (!newResource.title || !newResource.type) {
      alert('请填写标题和类型');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/learning/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newResource,
          tags: newResource.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        })
      });

      if (response.ok) {
        const result = await response.json();
        setResources([...resources, result.data]);
        setNewResource({
          title: '',
          description: '',
          type: 'article',
          url: '',
          tags: '',
          difficulty: 'beginner',
          estimatedTime: 0
        });
        setShowAddForm(false);
        alert('学习资源添加成功');
      } else {
        const error = await response.json();
        alert(error.message || '添加失败');
      }
    } catch (error) {
      console.error('添加学习资源失败:', error);
      alert('添加失败，请重试');
    }
  };

  const updateProgress = async (resourceId: string, status: 'not_started' | 'in_progress' | 'completed' | 'paused', completionPercentage: number = 0) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/learning/progress/${resourceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          completionPercentage
        })
      });

      if (response.ok) {
        loadResources();
        loadStatistics();
        alert('学习进度更新成功');
      } else {
        const error = await response.json();
        alert(error.message || '更新失败');
      }
    } catch (error) {
      console.error('更新学习进度失败:', error);
      alert('更新失败，请重试');
    }
  };

  const generateStudyPlan = async () => {
    if (!planForm.goals || !planForm.timeAvailable) {
      alert('请填写学习目标和可用时间');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/learning/study-plan/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...planForm,
          subjects: planForm.subjects.split(',').map(s => s.trim()).filter(Boolean)
        })
      });

      if (response.ok) {
        const result = await response.json();
        setStudyPlans([...studyPlans, result.data]);
        setPlanForm({
          goals: '',
          timeAvailable: 10,
          difficulty: 'intermediate',
          subjects: '',
          duration: 4
        });
        setShowPlanForm(false);
        alert('学习计划生成成功');
      } else {
        const error = await response.json();
        alert(error.message || '生成失败');
      }
    } catch (error) {
      console.error('生成学习计划失败:', error);
      alert('生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in_progress': return '#2196F3';
      case 'paused': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'in_progress': return '学习中';
      case 'paused': return '已暂停';
      default: return '未开始';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '初级';
      case 'intermediate': return '中级';
      case 'advanced': return '高级';
      default: return '未知';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-light text-white mb-2">学习资源管理</h1>
            <p className="text-gray-400 text-lg">管理您的学习资源，跟踪学习进度，制定学习计划</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                  activeTab === tab.id
                    ? 'text-white border-white bg-gray-800'
                    : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-800'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Learning Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-light text-white">学习资源</h2>
              <button
                className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="w-4 h-4" />
                <span>添加资源</span>
              </button>
            </div>

            {/* Filters */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="搜索资源..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-colors duration-200"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-white focus:outline-none transition-colors duration-200"
                >
                  {resourceTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-white focus:outline-none transition-colors duration-200"
                >
                  {statusTypes.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-white focus:outline-none transition-colors duration-200"
                >
                  {difficultyLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map(resource => (
                <div key={resource.id} className="bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-all duration-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-medium text-white flex-1 mr-4">{resource.title}</h3>
                      <div className="flex flex-col space-y-2">
                        <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs font-medium">
                          {resource.type}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          resource.difficulty === 'beginner' ? 'bg-green-900 text-green-300' :
                          resource.difficulty === 'intermediate' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                          {getDifficultyText(resource.difficulty)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">{resource.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {resource.tags.map(tag => (
                        <span key={tag} className="bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{resource.estimatedTime}小时</span>
                      </div>
                      {resource.progress && (
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            resource.progress.status === 'completed' ? 'bg-green-900 text-green-300' :
                            resource.progress.status === 'in_progress' ? 'bg-blue-900 text-blue-300' :
                            resource.progress.status === 'paused' ? 'bg-yellow-900 text-yellow-300' :
                            'bg-gray-800 text-gray-300'
                          }`}>
                            {getStatusText(resource.progress.status)}
                          </span>
                          <span>{resource.progress.completionPercentage}%</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>访问</span>
                        </a>
                      )}
                      <button
                        className="flex items-center space-x-1 bg-white text-black px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
                        onClick={() => updateProgress(resource.id, 'in_progress', 0)}
                      >
                        <Play className="w-4 h-4" />
                        <span>开始学习</span>
                      </button>
                      <button
                        className="flex items-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
                        onClick={() => updateProgress(resource.id, 'completed', 100)}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>完成</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">暂无学习资源</p>
              </div>
            )}
          </div>
        )}

        {/* Learning Progress Tab */}
        {activeTab === 'progress' && statistics && (
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-white">学习统计</h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">总资源数</p>
                    <p className="text-2xl font-light text-white">{statistics.totalResources}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-gray-400 text-sm">已完成</p>
                    <p className="text-2xl font-light text-white">{statistics.completedResources}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-center space-x-3">
                  <Play className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="text-gray-400 text-sm">学习中</p>
                    <p className="text-2xl font-light text-white">{statistics.inProgressResources}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-gray-400 text-sm">总学习时间</p>
                    <p className="text-2xl font-light text-white">{statistics.totalTimeSpent}小时</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-medium text-white mb-4">最近活动</h3>
              <div className="space-y-3">
                {statistics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-white font-medium">{activity.resourceTitle}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className={`px-2 py-1 rounded text-xs ${
                        activity.status === 'completed' ? 'bg-green-900 text-green-300' :
                        activity.status === 'in_progress' ? 'bg-blue-900 text-blue-300' :
                        'bg-gray-800 text-gray-300'
                      }`}>
                        {getStatusText(activity.status)}
                      </span>
                      <span>
                        {activity.lastAccessed ? new Date(activity.lastAccessed).toLocaleDateString() : '未知'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Study Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-light text-white">学习计划</h2>
              <button
                className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                onClick={() => setShowPlanForm(true)}
              >
                <Plus className="w-4 h-4" />
                <span>生成计划</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studyPlans.map(plan => (
                <div key={plan.id} className="bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-all duration-200 p-6">
                  <h3 className="text-lg font-medium text-white mb-2">{plan.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  
                  <div className="space-y-2 mb-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>目标: {plan.goals}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>时长: {plan.duration}周</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>每周: {plan.timeAvailable}小时</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {plan.subjects.map(subject => (
                      <span key={subject} className="bg-green-900 text-green-300 px-2 py-1 rounded-full text-xs">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {studyPlans.length === 0 && (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">暂无学习计划</p>
              </div>
            )}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-white">推荐资源</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map(resource => (
                <div key={resource.id} className="bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-all duration-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-medium text-white flex-1 mr-4">{resource.title}</h3>
                      <div className="flex flex-col space-y-2">
                        <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs font-medium">
                          {resource.type}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          resource.difficulty === 'beginner' ? 'bg-green-900 text-green-300' :
                          resource.difficulty === 'intermediate' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                          {getDifficultyText(resource.difficulty)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">{resource.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {resource.tags.map(tag => (
                        <span key={tag} className="bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2">
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>访问</span>
                        </a>
                      )}
                      <button
                        className="flex items-center space-x-1 bg-white text-black px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
                        onClick={() => updateProgress(resource.id, 'in_progress', 0)}
                      >
                        <Play className="w-4 h-4" />
                        <span>开始学习</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {recommendations.length === 0 && (
              <div className="text-center py-16">
                <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">暂无推荐资源</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 添加资源弹窗 */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-800 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h3 className="text-xl font-medium text-white">添加学习资源</h3>
              <button
                className="text-gray-400 hover:text-white transition-colors duration-200"
                onClick={() => setShowAddForm(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">标题</label>
                <input
                  type="text"
                  value={newResource.title}
                  onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                  placeholder="输入资源标题"
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">描述</label>
                <textarea
                  value={newResource.description}
                  onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                  placeholder="输入资源描述"
                  rows={3}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-colors duration-200"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">类型</label>
                  <select
                    value={newResource.type}
                    onChange={(e) => setNewResource({...newResource, type: e.target.value})}
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-white focus:outline-none transition-colors duration-200"
                  >
                    <option value="article">文章</option>
                    <option value="video">视频</option>
                    <option value="book">书籍</option>
                    <option value="course">课程</option>
                    <option value="document">文档</option>
                    <option value="link">链接</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">难度</label>
                  <select
                    value={newResource.difficulty}
                    onChange={(e) => setNewResource({...newResource, difficulty: e.target.value})}
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-white focus:outline-none transition-colors duration-200"
                  >
                    <option value="beginner">初级</option>
                    <option value="intermediate">中级</option>
                    <option value="advanced">高级</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">URL</label>
                <input
                  type="url"
                  value={newResource.url}
                  onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                  placeholder="输入资源链接"
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-colors duration-200"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">标签（用逗号分隔）</label>
                  <input
                    type="text"
                    value={newResource.tags}
                    onChange={(e) => setNewResource({...newResource, tags: e.target.value})}
                    placeholder="JavaScript, 编程, 前端"
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">预计时间（小时）</label>
                  <input
                    type="number"
                    value={newResource.estimatedTime}
                    onChange={(e) => setNewResource({...newResource, estimatedTime: parseInt(e.target.value) || 0})}
                    min="0"
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-colors duration-200"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4 p-6 border-t border-gray-800">
              <button 
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                onClick={() => setShowAddForm(false)}
              >
                取消
              </button>
              <button 
                className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors duration-200"
                onClick={addResource}
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 生成学习计划弹窗 */}
      {showPlanForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-800 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h3 className="text-xl font-medium text-white">生成学习计划</h3>
              <button
                className="text-gray-400 hover:text-white transition-colors duration-200"
                onClick={() => setShowPlanForm(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">学习目标</label>
                <textarea
                  value={planForm.goals}
                  onChange={(e) => setPlanForm({...planForm, goals: e.target.value})}
                  placeholder="描述您的学习目标，例如：掌握React开发技能"
                  rows={3}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-colors duration-200"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">每周可用时间（小时）</label>
                  <input
                    type="number"
                    value={planForm.timeAvailable}
                    onChange={(e) => setPlanForm({...planForm, timeAvailable: parseInt(e.target.value) || 0})}
                    min="1"
                    max="168"
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">计划持续时间（周）</label>
                  <input
                    type="number"
                    value={planForm.duration}
                    onChange={(e) => setPlanForm({...planForm, duration: parseInt(e.target.value) || 0})}
                    min="1"
                    max="52"
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-colors duration-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">难度级别</label>
                  <select
                    value={planForm.difficulty}
                    onChange={(e) => setPlanForm({...planForm, difficulty: e.target.value})}
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-white focus:outline-none transition-colors duration-200"
                  >
                    <option value="beginner">初级</option>
                    <option value="intermediate">中级</option>
                    <option value="advanced">高级</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">感兴趣的学科（用逗号分隔）</label>
                  <input
                    type="text"
                    value={planForm.subjects}
                    onChange={(e) => setPlanForm({...planForm, subjects: e.target.value})}
                    placeholder="JavaScript, React, 前端开发"
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-colors duration-200"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4 p-6 border-t border-gray-800">
              <button 
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                onClick={() => setShowPlanForm(false)}
              >
                取消
              </button>
              <button
                className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={generateStudyPlan}
                disabled={loading}
              >
                {loading ? '生成中...' : '生成计划'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LearningResources;