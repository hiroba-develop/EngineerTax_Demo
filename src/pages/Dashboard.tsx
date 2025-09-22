import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import type {
  AnnualTask,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  TaxReturnMode
} from '../types';
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  FileText,
  TrendingUp,
  DollarSign,
  Target,
  ChevronRight,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { state, dispatch, updateTaskStatus, changeTaxReturnMode } = useApp();
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all');

  // デモ用の初期タスクデータを設定
  useEffect(() => {
    if (state.tasks.length === 0) {
      const demoTasks: AnnualTask[] = [
        {
          id: 'task-1',
          title: '源泉徴収票の収集',
          description: '会社からの源泉徴収票を収集し、給与所得を確認する',
          category: 'document_preparation',
          sideJobType: 'contract',
          status: 'completed',
          priority: 'high',
          dueDate: '2024-01-31',
          requiredDocuments: ['源泉徴収票'],
          estimatedTime: 30,
          completedAt: '2024-01-15T10:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
        {
          id: 'task-2',
          title: '副業収入の整理',
          description: '業務委託契約による収入をまとめ、支払調書を確認する',
          category: 'income_management',
          sideJobType: 'contract',
          status: 'in_progress',
          priority: 'high',
          dueDate: '2024-02-28',
          requiredDocuments: ['支払調書', '請求書控え'],
          estimatedTime: 120,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-02-01T09:00:00Z',
        },
        {
          id: 'task-3',
          title: '経費レシートの整理',
          description: 'クラウドサービス、開発ツール、技術書籍等の経費レシートを整理',
          category: 'expense_management',
          sideJobType: 'contract',
          status: 'pending',
          priority: 'medium',
          dueDate: '2024-02-29',
          requiredDocuments: ['レシート', '領収書'],
          estimatedTime: 180,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'task-4',
          title: '青色申告決算書の作成',
          description: '損益計算書と貸借対照表を作成し、青色申告特別控除を適用',
          category: 'tax_calculation',
          sideJobType: 'contract',
          status: 'pending',
          priority: 'high',
          dueDate: '2024-03-10',
          requiredDocuments: ['帳簿', '領収書類'],
          estimatedTime: 240,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'task-5',
          title: '確定申告書の提出',
          description: 'e-Taxまたは税務署への確定申告書の提出',
          category: 'submission',
          sideJobType: 'contract',
          status: 'pending',
          priority: 'high',
          dueDate: '2024-03-15',
          requiredDocuments: ['確定申告書', '添付書類'],
          estimatedTime: 60,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];
      dispatch({ type: 'SET_TASKS', payload: demoTasks });
    }
  }, [state.tasks.length, dispatch]);

  // フィルタリングされたタスク
  const filteredTasks = state.tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterCategory !== 'all' && task.category !== filterCategory) return false;
    return true;
  });

  // 統計情報の計算
  const stats = {
    total: state.tasks.length,
    completed: state.tasks.filter(t => t.status === 'completed').length,
    inProgress: state.tasks.filter(t => t.status === 'in_progress').length,
    pending: state.tasks.filter(t => t.status === 'pending').length,
    overdue: state.tasks.filter(t => 
      t.status !== 'completed' && new Date(t.dueDate) < new Date()
    ).length,
  };

  const progressPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // タスクのステータス変更
  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTaskStatus(taskId, newStatus);
  };

  // 申告モードの切り替え
  const handleModeChange = (mode: TaxReturnMode) => {
    changeTaxReturnMode(mode);
  };

  // タスクの優先度に応じたスタイル
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
    }
  };

  // ステータスに応じたスタイル
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-gray-600 bg-gray-50';
    }
  };

  // カテゴリ名の日本語変換
  const getCategoryName = (category: TaskCategory) => {
    const names = {
      document_preparation: '書類準備',
      income_management: '収入管理',
      expense_management: '経費管理',
      tax_calculation: '税額計算',
      submission: '申告提出',
    };
    return names[category];
  };

  return (
    <div className="space-y-6">
      {/* ヘッダーセクション */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#363427] mb-2">
              確定申告ダッシュボード
            </h1>
            <p className="text-gray-600">
              {state.settings.fiscalYear}年度の確定申告準備を管理しましょう
            </p>
          </div>
          
          {/* 申告モード切り替え */}
          <div className="mt-4 lg:mt-0">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-[#363427]">申告モード:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleModeChange('white')}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    state.settings.taxReturnMode === 'white'
                      ? 'bg-[#627962] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  白色申告
                </button>
                <button
                  onClick={() => handleModeChange('blue')}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    state.settings.taxReturnMode === 'blue'
                      ? 'bg-[#627962] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  青色申告
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総タスク数</p>
              <p className="text-2xl font-bold text-[#363427]">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">完了</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">進行中</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">期限超過</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 進捗バー */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#363427]">全体の進捗</h2>
          <span className="text-lg font-bold text-[#627962]">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-[#627962] h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>{stats.completed} / {stats.total} タスク完了</span>
          <span>目標: 3月15日まで</span>
        </div>
      </div>

      {/* フィルターとタスクリスト */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-[#363427] mb-4 sm:mb-0">
              タスク一覧
            </h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {/* フィルター */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#627962]"
              >
                <option value="all">全てのステータス</option>
                <option value="pending">未着手</option>
                <option value="in_progress">進行中</option>
                <option value="completed">完了</option>
              </select>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as TaskCategory | 'all')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#627962]"
              >
                <option value="all">全てのカテゴリ</option>
                <option value="document_preparation">書類準備</option>
                <option value="income_management">収入管理</option>
                <option value="expense_management">経費管理</option>
                <option value="tax_calculation">税額計算</option>
                <option value="submission">申告提出</option>
              </select>

              <button
                onClick={() => alert('タスク追加機能は開発中です')}
                className="flex items-center px-4 py-2 bg-[#627962] text-white rounded-md hover:bg-[#627962]/90 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                タスク追加
              </button>
            </div>
          </div>
        </div>

        {/* タスクリスト */}
        <div className="divide-y divide-gray-200">
          {filteredTasks.map((task) => (
            <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-[#363427]">
                      {task.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                      {task.status === 'completed' ? '完了' : 
                       task.status === 'in_progress' ? '進行中' : '未着手'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{task.description}</p>
                  
                  <div className="flex flex-wrap items-center text-sm text-gray-500 space-x-4">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      期限: {new Date(task.dueDate).toLocaleDateString('ja-JP')}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      予想時間: {task.estimatedTime}分
                    </span>
                    <span className="flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      {getCategoryName(task.category)}
                    </span>
                  </div>

                  {task.requiredDocuments.length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-600">必要書類: </span>
                      <span className="text-sm text-[#363427]">
                        {task.requiredDocuments.join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {task.status !== 'completed' && (
                    <>
                      {task.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(task.id, 'in_progress')}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          開始
                        </button>
                      )}
                      {task.status === 'in_progress' && (
                        <button
                          onClick={() => handleStatusChange(task.id, 'completed')}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          完了
                        </button>
                      )}
                    </>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* クイックアクション */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#627962]">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-[#627962] mr-3" />
            <h3 className="text-lg font-semibold text-[#363427]">収支管理</h3>
          </div>
          <p className="text-gray-600 mb-4">
            収入と経費を記録して、年間の損益を把握しましょう
          </p>
          <button className="text-[#627962] font-medium hover:underline">
            収支管理へ →
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center mb-4">
            <DollarSign className="w-6 h-6 text-blue-500 mr-3" />
            <h3 className="text-lg font-semibold text-[#363427]">税金シミュレーター</h3>
          </div>
          <p className="text-gray-600 mb-4">
            現在の収支データから税額を試算してみましょう
          </p>
          <button className="text-blue-500 font-medium hover:underline">
            シミュレーターへ →
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-green-500 mr-3" />
            <h3 className="text-lg font-semibold text-[#363427]">手順ガイド</h3>
          </div>
          <p className="text-gray-600 mb-4">
            確定申告の手順を分かりやすく解説しています
          </p>
          <button className="text-green-500 font-medium hover:underline">
            ガイドを見る →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;