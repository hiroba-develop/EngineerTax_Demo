import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid'; // uuidをインポート
import type {
  AnnualTask,
  Transaction,
  TaxCalculationResult,
  AppSettings,
  UserProfile,
  TaxReturnMode,
  TaskStatus,
  ExpenseCategory,
  Voucher, // Voucherをインポート
} from '../types';

// デモ用の初期データ（VoucherList.tsxから移動）
const initialVouchers: Voucher[] = [
  {
    id: uuidv4(),
    name: 'サンプル領収書.png',
    url: '/sample_receipt.png',
    tags: ['領収書', '2025年'],
    createdAt: new Date('2025-11-01T10:00:00Z'),
    fileType: 'image',
    ocrText: '領収書\n合計: 10,800円\n但し、品代として',
  },
  {
    id: uuidv4(),
    name: 'サンプル名刺.jpg',
    url: '/sample_business_card.jpg',
    tags: ['名刺', '取引先'],
    createdAt: new Date('2025-10-15T14:30:00Z'),
    fileType: 'image',
    ocrText: '株式会社サンプル\n代表取締役 鈴木一郎',
  },
];
const initialVoucherTags = ['領収書', '2025年', '名刺', '取引先'];

// アプリケーションの状態
interface AppState {
  // ユーザー情報
  userProfile: UserProfile | null;
  
  // 設定
  settings: AppSettings;
  
  // タスク管理
  tasks: AnnualTask[];
  
  // 取引データ
  transactions: Transaction[];
  
  // 税金計算結果
  taxCalculation: TaxCalculationResult | null;
  
  // UI状態
  isLoading: boolean;
  error: string | null;
  
  // 現在選択中の年度
  selectedYear: number;
  
  // 証票管理
  vouchers: Voucher[];
  voucherTags: string[];
}

// アクションの型
type AppAction = 
  | { type: 'SET_USER_PROFILE'; payload: UserProfile }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_TASKS'; payload: AnnualTask[] }
  | { type: 'ADD_TASK'; payload: AnnualTask }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<AnnualTask> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; updates: Partial<Transaction> } }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_TAX_CALCULATION'; payload: TaxCalculationResult }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_YEAR'; payload: number }
  // 証票アクション
  | { type: 'ADD_VOUCHER'; payload: Voucher }
  | { type: 'UPDATE_VOUCHER_TAGS'; payload: { id: string; tags: string[] } }
  | { type: 'DELETE_VOUCHER'; payload: string }
  // タグアクション
  | { type: 'ADD_VOUCHER_TAG'; payload: string }
  | { type: 'UPDATE_VOUCHER_TAG'; payload: { oldTag: string; newTag: string } }
  | { type: 'DELETE_VOUCHER_TAG'; payload: string };

// 初期状態
const initialState: AppState = {
  userProfile: null,
  settings: {
    taxReturnMode: 'blue',
    fiscalYear: new Date().getFullYear(),
    notifications: {
      email: true,
      push: true,
      deadline: true,
    },
    theme: 'light',
    language: 'ja',
  },
  tasks: [],
  transactions: [],
  taxCalculation: null,
  isLoading: false,
  error: null,
  selectedYear: new Date().getFullYear(),
  vouchers: initialVouchers, // 追加
  voucherTags: initialVoucherTags, // 追加
};

// リデューサー
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER_PROFILE':
      return { ...state, userProfile: action.payload };
      
    case 'UPDATE_SETTINGS':
      return { 
        ...state, 
        settings: { ...state.settings, ...action.payload } 
      };
      
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
      
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
      
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : task
        ),
      };
      
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
      
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
      
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] };
      
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction.id === action.payload.id
            ? { ...transaction, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : transaction
        ),
      };
      
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(transaction => transaction.id !== action.payload),
      };
      
    case 'SET_TAX_CALCULATION':
      return { ...state, taxCalculation: action.payload };
      
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_SELECTED_YEAR':
      return { ...state, selectedYear: action.payload };
      
    // 証票関連のレデューサーロジック
    case 'ADD_VOUCHER':
      return { ...state, vouchers: [action.payload, ...state.vouchers] };
      
    case 'UPDATE_VOUCHER_TAGS':
      return {
        ...state,
        vouchers: state.vouchers.map(v =>
          v.id === action.payload.id ? { ...v, tags: action.payload.tags } : v
        ),
      };

    case 'DELETE_VOUCHER':
      return {
        ...state,
        vouchers: state.vouchers.filter(v => v.id !== action.payload),
      };
      
    case 'ADD_VOUCHER_TAG':
      if (state.voucherTags.includes(action.payload)) return state;
      return {
        ...state,
        voucherTags: [...state.voucherTags, action.payload].sort(),
      };
      
    case 'UPDATE_VOUCHER_TAG':
      return {
        ...state,
        voucherTags: state.voucherTags.map(t =>
          t === action.payload.oldTag ? action.payload.newTag : t
        ).sort(),
        vouchers: state.vouchers.map(v => ({
          ...v,
          tags: v.tags.map(t =>
            t === action.payload.oldTag ? action.payload.newTag : t
          ),
        })),
      };
      
    case 'DELETE_VOUCHER_TAG':
      return {
        ...state,
        voucherTags: state.voucherTags.filter(t => t !== action.payload),
        vouchers: state.vouchers.map(v => ({
          ...v,
          tags: v.tags.filter(t => t !== action.payload),
        })),
      };
      
    default:
      return state;
  }
};

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // 便利なヘルパー関数
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  addCustomTask: (task: Omit<AnnualTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  calculateTotalIncome: (year?: number) => number;
  calculateTotalExpense: (year?: number) => number;
  getTransactionsByCategory: (category: ExpenseCategory, year?: number) => Transaction[];
  getCompletedTasksCount: () => number;
  getTotalTasksCount: () => number;
  changeTaxReturnMode: (mode: TaxReturnMode) => void;
  // 証票ヘルパー関数
  addVoucher: (voucher: Omit<Voucher, 'id' | 'createdAt'>) => Voucher;
  updateVoucherTags: (voucherId: string, tags: string[]) => void;
  deleteVoucher: (voucherId: string) => void;
  addVoucherTag: (tag: string) => void;
  updateVoucherTag: (oldTag: string, newTag: string) => void;
  deleteVoucherTag: (tag: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // ヘルパー関数の実装
  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    const updates: Partial<AnnualTask> = { status };
    if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
    }
    dispatch({ type: 'UPDATE_TASK', payload: { id: taskId, updates } });
  };

  const addCustomTask = (taskData: Omit<AnnualTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: AnnualTask = {
      ...taskData,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TASK', payload: task });
  };

  const calculateTotalIncome = (year?: number): number => {
    const targetYear = year || state.selectedYear;
    return state.transactions
      .filter(t => {
        const transactionYear = new Date(t.date).getFullYear();
        return t.isIncome && transactionYear === targetYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateTotalExpense = (year?: number): number => {
    const targetYear = year || state.selectedYear;
    return state.transactions
      .filter(t => {
        const transactionYear = new Date(t.date).getFullYear();
        return !t.isIncome && t.isBusinessExpense && transactionYear === targetYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTransactionsByCategory = (category: ExpenseCategory, year?: number): Transaction[] => {
    const targetYear = year || state.selectedYear;
    return state.transactions.filter(t => {
      const transactionYear = new Date(t.date).getFullYear();
      return t.category === category && transactionYear === targetYear;
    });
  };

  const getCompletedTasksCount = (): number => {
    return state.tasks.filter(task => task.status === 'completed').length;
  };

  const getTotalTasksCount = (): number => {
    return state.tasks.length;
  };

  const changeTaxReturnMode = (mode: TaxReturnMode) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { taxReturnMode: mode } });
    
    // モードに応じてタスクリストを更新
    // 実際のアプリでは、ここでAPIを呼び出してタスクを取得
    console.log(`税務申告モードを${mode === 'blue' ? '青色申告' : '白色申告'}に変更しました`);
  };

  // 証票管理ヘルパー
  const addVoucher = (voucherData: Omit<Voucher, 'id' | 'createdAt'>): Voucher => {
    const newVoucher: Voucher = {
      ...voucherData,
      id: uuidv4(),
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_VOUCHER', payload: newVoucher });
    return newVoucher;
  };

  const updateVoucherTags = (voucherId: string, tags: string[]) => {
    dispatch({ type: 'UPDATE_VOUCHER_TAGS', payload: { id: voucherId, tags } });
  };
  
  const deleteVoucher = (voucherId: string) => {
    dispatch({ type: 'DELETE_VOUCHER', payload: voucherId });
  };

  const addVoucherTag = (tag: string) => {
    dispatch({ type: 'ADD_VOUCHER_TAG', payload: tag });
  };
  
  const updateVoucherTag = (oldTag: string, newTag: string) => {
    dispatch({ type: 'UPDATE_VOUCHER_TAG', payload: { oldTag, newTag } });
  };

  const deleteVoucherTag = (tag: string) => {
    dispatch({ type: 'DELETE_VOUCHER_TAG', payload: tag });
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    updateTaskStatus,
    addCustomTask,
    calculateTotalIncome,
    calculateTotalExpense,
    getTransactionsByCategory,
    getCompletedTasksCount,
    getTotalTasksCount,
    changeTaxReturnMode,
    // 証票ヘルパーを追加
    addVoucher,
    updateVoucherTags,
    deleteVoucher,
    addVoucherTag,
    updateVoucherTag,
    deleteVoucherTag,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
