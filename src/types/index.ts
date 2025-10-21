// EngineerTax アプリケーション用の型定義

// 申告モード
export type TaxReturnMode = 'blue' | 'white';

// タスクの状態
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

// タスクの重要度
export type TaskPriority = 'low' | 'medium' | 'high';

// 副業の種別
export type SideJobType = 'contract' | 'affiliate' | 'content' | 'sponsor' | 'book' | 'other';

// タスクカテゴリ
export type TaskCategory = 'document_preparation' | 'income_management' | 'expense_management' | 'tax_calculation' | 'submission';

// 年間タスク
export interface AnnualTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  sideJobType: SideJobType;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  requiredDocuments: string[];
  estimatedTime: number; // 分単位
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 経費カテゴリ
export type ExpenseCategory = 
  | 'development_tools' 
  | 'cloud_services' 
  | 'books_learning' 
  | 'coworking_space' 
  | 'gadgets' 
  | 'conference' 
  | 'home_office' 
  | 'other';

// 取引データ
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  isIncome: boolean;
  isBusinessExpense: boolean;
  source: 'bank' | 'credit_card' | 'csv' | 'manual';
  memo?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// 月次レポート
export interface MonthlyReport {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  expensesByCategory: Record<ExpenseCategory, number>;
  transactionCount: number;
}

// 年次レポート
export interface AnnualReport {
  year: number;
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  monthlyReports: MonthlyReport[];
  expensesByCategory: Record<ExpenseCategory, number>;
}

// 控除の種類
export type DeductionType = 
  | 'basic' 
  | 'blue_return_special' 
  | 'social_insurance' 
  | 'life_insurance' 
  | 'earthquake_insurance' 
  | 'medical' 
  | 'donation';

// 控除情報
export interface Deduction {
  type: DeductionType;
  amount: number;
  isApplicable: boolean;
  reason?: string;
  requiredDocuments: string[];
}

// 税金計算結果
export interface TaxCalculationResult {
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  incomeTax: number;
  residentialTax: number;
  businessTax: number;
  totalTax: number;
  estimatedQuarterlyPayment: number;
  deductions: Deduction[];
  calculationSteps: CalculationStep[];
}

// 計算ステップ
export interface CalculationStep {
  id: string;
  title: string;
  description: string;
  formula: string;
  value: number;
  explanation: string;
  legalBasis?: string;
}

// 給与所得情報
export interface SalaryIncome {
  annualSalary: number;
  withheldIncomeTax: number;
  withheldResidentialTax: number;
  socialInsurancePremiums: number;
  employerName: string;
  year: number;
}

// ナビゲーションステップ
export interface NavigationStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
  estimatedTime: number;
  requiredTasks: string[];
  learningContent?: LearningContent;
}

// 学習コンテンツ
export interface LearningContent {
  title: string;
  type: 'video' | 'slide' | 'tutorial' | 'article';
  url?: string;
  content: string;
  duration: number;
}

// チャット履歴
export interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: string;
  references?: string[];
  confidence?: number;
}

// FAQ項目
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  isEngineerSpecific: boolean;
  updatedAt: string;
  legalBasis?: string;
}

// アプリケーション設定
export interface AppSettings {
  taxReturnMode: TaxReturnMode;
  fiscalYear: number;
  notifications: {
    email: boolean;
    push: boolean;
    deadline: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  language: 'ja' | 'en';
}

// ユーザープロファイル
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  occupation: string;
  sideJobTypes: SideJobType[];
  hasSalaryIncome: boolean;
  settings: AppSettings;
  createdAt: string;
  updatedAt: string;
}

// データインポート設定
export interface ImportConfig {
  source: 'bank' | 'credit_card' | 'csv';
  format: string;
  fieldMapping: Record<string, string>;
  autoCategorizationEnabled: boolean;
}

// エクスポート設定
export interface ExportConfig {
  format: 'csv' | 'pdf' | 'etax_xml';
  includeAttachments: boolean;
  dateRange: {
    start: string;
    end: string;
  };
}

// API レスポンス型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// ページネーション
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 検索フィルター
export interface SearchFilter {
  query?: string;
  category?: ExpenseCategory;
  dateRange?: {
    start: string;
    end: string;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  isIncome?: boolean;
}