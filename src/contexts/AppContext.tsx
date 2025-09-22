import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { 
  AnnualTask, 
  Transaction, 
  TaxCalculationResult, 
  AppSettings, 
  UserProfile, 
  TaxReturnMode,
  TaskStatus,
  ExpenseCategory 
} from '../types';

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
  | { type: 'SET_SELECTED_YEAR'; payload: number };

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
