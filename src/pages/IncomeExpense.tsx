import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Transaction, ExpenseCategory } from '../types';
import {
  Plus,
  Upload,
  Download,
  Filter,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Edit3,
  Trash2,
  FileText,
  CreditCard,
  Building,
  Smartphone,
} from 'lucide-react';

const IncomeExpense: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'all' | 'income'>('all');
  const [filterDateRange, setFilterDateRange] = useState({ start: '', end: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear] = useState(new Date().getFullYear());

  // デモ用の初期取引データ
  useEffect(() => {
    if (state.transactions.length === 0) {
      const demoTransactions: Transaction[] = [
        {
          id: 'trans-1',
          date: '2024-01-15',
          amount: 300000,
          description: 'Webアプリ開発案件',
          category: 'development_tools',
          isIncome: true,
          isBusinessExpense: false,
          source: 'manual',
          memo: 'A社からの業務委託収入',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
        {
          id: 'trans-2',
          date: '2024-01-20',
          amount: 9800,
          description: 'AWS利用料',
          category: 'cloud_services',
          isIncome: false,
          isBusinessExpense: true,
          source: 'credit_card',
          memo: 'EC2, RDS, S3の月額利用料',
          createdAt: '2024-01-20T15:30:00Z',
          updatedAt: '2024-01-20T15:30:00Z',
        },
        {
          id: 'trans-3',
          date: '2024-01-25',
          amount: 3980,
          description: 'TypeScript実践入門',
          category: 'books_learning',
          isIncome: false,
          isBusinessExpense: true,
          source: 'credit_card',
          memo: '技術書籍購入',
          createdAt: '2024-01-25T12:00:00Z',
          updatedAt: '2024-01-25T12:00:00Z',
        },
        {
          id: 'trans-4',
          date: '2024-02-01',
          amount: 250000,
          description: 'モバイルアプリ開発',
          category: 'development_tools',
          isIncome: true,
          isBusinessExpense: false,
          source: 'bank',
          memo: 'B社からの業務委託収入',
          createdAt: '2024-02-01T09:00:00Z',
          updatedAt: '2024-02-01T09:00:00Z',
        },
        {
          id: 'trans-5',
          date: '2024-02-10',
          amount: 12000,
          description: 'GitHub Copilot年間プラン',
          category: 'development_tools',
          isIncome: false,
          isBusinessExpense: true,
          source: 'credit_card',
          memo: 'AI開発支援ツール',
          createdAt: '2024-02-10T14:20:00Z',
          updatedAt: '2024-02-10T14:20:00Z',
        },
        {
          id: 'trans-6',
          date: '2024-02-15',
          amount: 25000,
          description: 'WeWork月額利用料',
          category: 'coworking_space',
          isIncome: false,
          isBusinessExpense: true,
          source: 'credit_card',
          memo: 'コワーキングスペース利用',
          createdAt: '2024-02-15T11:00:00Z',
          updatedAt: '2024-02-15T11:00:00Z',
        },
      ];
      dispatch({ type: 'SET_TRANSACTIONS', payload: demoTransactions });
    }
  }, [state.transactions.length, dispatch]);

  // フィルタリングされた取引
  const filteredTransactions = state.transactions.filter(transaction => {
    const transactionYear = new Date(transaction.date).getFullYear();
    if (transactionYear !== selectedYear) return false;

    if (filterCategory === 'income' && !transaction.isIncome) return false;
    if (filterCategory !== 'all' && filterCategory !== 'income' && transaction.category !== filterCategory) return false;

    if (filterDateRange.start && transaction.date < filterDateRange.start) return false;
    if (filterDateRange.end && transaction.date > filterDateRange.end) return false;

    if (searchQuery && !transaction.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    return true;
  });

  // 統計計算
  const stats = {
    totalIncome: state.transactions
      .filter(t => t.isIncome && new Date(t.date).getFullYear() === selectedYear)
      .reduce((sum, t) => sum + t.amount, 0),
    totalExpense: state.transactions
      .filter(t => !t.isIncome && t.isBusinessExpense && new Date(t.date).getFullYear() === selectedYear)
      .reduce((sum, t) => sum + t.amount, 0),
    netIncome: 0,
    transactionCount: filteredTransactions.length,
  };
  stats.netIncome = stats.totalIncome - stats.totalExpense;

  // カテゴリ別支出
  const expensesByCategory = state.transactions
    .filter(t => !t.isIncome && t.isBusinessExpense && new Date(t.date).getFullYear() === selectedYear)
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);

  // カテゴリ名の日本語変換
  const getCategoryName = (category: ExpenseCategory) => {
    const names = {
      development_tools: '開発ツール',
      cloud_services: 'クラウドサービス',
      books_learning: '書籍・学習',
      coworking_space: 'コワーキング',
      gadgets: 'ガジェット',
      conference: 'カンファレンス',
      home_office: '在宅勤務',
      other: 'その他',
    };
    return names[category];
  };

  // ソースアイコン
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'bank': return <Building className="w-4 h-4" />;
      case 'credit_card': return <CreditCard className="w-4 h-4" />;
      case 'csv': return <FileText className="w-4 h-4" />;
      case 'manual': return <Edit3 className="w-4 h-4" />;
      default: return <Smartphone className="w-4 h-4" />;
    }
  };

  // 金額のフォーマット
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#363427] mb-2">
              収支管理
            </h1>
            <p className="text-gray-600">
              {selectedYear}年度の収入と経費を管理します
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-[#627962] text-white rounded-md hover:bg-[#627962]/90 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              取引追加
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4 mr-2" />
              CSVインポート
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              エクスポート
            </button>
          </div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">総収入</p>
              <p className="text-2xl font-bold text-green-600">
                {formatAmount(stats.totalIncome)}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">総支出</p>
              <p className="text-2xl font-bold text-red-600">
                {formatAmount(stats.totalExpense)}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#627962]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">純利益</p>
              <p className={`text-2xl font-bold ${stats.netIncome >= 0 ? 'text-[#627962]' : 'text-red-600'}`}>
                {formatAmount(stats.netIncome)}
              </p>
            </div>
            <div className="p-3 bg-[#627962] bg-opacity-10 rounded-full">
              <DollarSign className="w-6 h-6 text-[#627962]" />
            </div>
          </div>
        </div>
      </div>

      {/* カテゴリ別支出 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[#363427] mb-4">カテゴリ別支出</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(expensesByCategory).map(([category, amount]) => (
            <div key={category} className="text-center">
              <div className="text-sm text-gray-600 mb-1">
                {getCategoryName(category as ExpenseCategory)}
              </div>
              <div className="text-lg font-semibold text-[#363427]">
                {formatAmount(amount)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* フィルターと検索 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="取引を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#627962]"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | 'all' | 'income')}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#627962]"
            >
              <option value="all">全カテゴリ</option>
              <option value="income">収入のみ</option>
              <option value="development_tools">開発ツール</option>
              <option value="cloud_services">クラウドサービス</option>
              <option value="books_learning">書籍・学習</option>
              <option value="coworking_space">コワーキング</option>
              <option value="gadgets">ガジェット</option>
              <option value="conference">カンファレンス</option>
              <option value="home_office">在宅勤務</option>
              <option value="other">その他</option>
            </select>

            <div className="flex space-x-2">
              <input
                type="date"
                value={filterDateRange.start}
                onChange={(e) => setFilterDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#627962]"
              />
              <input
                type="date"
                value={filterDateRange.end}
                onChange={(e) => setFilterDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#627962]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 取引リスト */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#363427]">
            取引履歴 ({stats.transactionCount}件)
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    transaction.isIncome ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    {transaction.isIncome ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-[#363427]">
                        {transaction.description}
                      </h3>
                      <span className="flex items-center text-xs text-gray-500">
                        {getSourceIcon(transaction.source)}
                        <span className="ml-1">
                          {transaction.source === 'bank' ? '銀行' :
                           transaction.source === 'credit_card' ? 'クレジット' :
                           transaction.source === 'csv' ? 'CSV' : '手動'}
                        </span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(transaction.date).toLocaleDateString('ja-JP')}
                      </span>
                      {!transaction.isIncome && (
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {getCategoryName(transaction.category)}
                        </span>
                      )}
                    </div>
                    
                    {transaction.memo && (
                      <p className="text-sm text-gray-600 mt-1">{transaction.memo}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${
                      transaction.isIncome ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.isIncome ? '+' : '-'}{formatAmount(transaction.amount)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingTransaction(transaction)}
                      className="p-1 text-gray-400 hover:text-[#627962] transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('この取引を削除しますか？')) {
                          dispatch({ type: 'DELETE_TRANSACTION', payload: transaction.id });
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredTransactions.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <FileText className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">取引データがありません</h3>
            <p className="text-gray-600">
              新しい取引を追加するか、フィルターを調整してください。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeExpense;
