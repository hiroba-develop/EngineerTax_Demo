import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { TaxCalculationResult, Deduction, CalculationStep, SalaryIncome } from '../types';
import {
  Calculator,
  DollarSign,
  FileText,
  Info,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  BookOpen,
} from 'lucide-react';

const TaxSimulator: React.FC = () => {
  const { state, dispatch } = useApp();
  const [businessIncome, setBusinessIncome] = useState(0);
  const [businessExpense, setBusinessExpense] = useState(0);
  const [salaryIncome, setSalaryIncome] = useState<SalaryIncome | null>(null);
  const [showSalaryInput, setShowSalaryInput] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const [showDeductionDetails, setShowDeductionDetails] = useState<string[]>([]);

  // 現在の取引データから自動計算
  useEffect(() => {
    const currentYearTransactions = state.transactions.filter(
      t => new Date(t.date).getFullYear() === state.selectedYear
    );
    
    const income = currentYearTransactions
      .filter(t => t.isIncome)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = currentYearTransactions
      .filter(t => !t.isIncome && t.isBusinessExpense)
      .reduce((sum, t) => sum + t.amount, 0);
    
    setBusinessIncome(income);
    setBusinessExpense(expense);
  }, [state.transactions, state.selectedYear]);

  // 税金計算ロジック
  const calculateTax = (): TaxCalculationResult => {
    const netBusinessIncome = Math.max(0, businessIncome - businessExpense);
    const salaryIncomeAmount = salaryIncome?.annualSalary || 0;
    const grossIncome = netBusinessIncome + salaryIncomeAmount;

    // 各種控除の計算
    const deductions: Deduction[] = [
      {
        type: 'basic',
        amount: 480000, // 基礎控除
        isApplicable: true,
        reason: '所得が2400万円以下のため満額適用',
        requiredDocuments: [],
      },
      {
        type: 'blue_return_special',
        amount: state.settings.taxReturnMode === 'blue' ? 650000 : 0,
        isApplicable: state.settings.taxReturnMode === 'blue' && netBusinessIncome > 0,
        reason: state.settings.taxReturnMode === 'blue' 
          ? '青色申告特別控除（複式簿記による記帳）'
          : '白色申告のため適用なし',
        requiredDocuments: state.settings.taxReturnMode === 'blue' 
          ? ['青色申告決算書', '総勘定元帳'] 
          : [],
      },
      {
        type: 'social_insurance',
        amount: salaryIncome?.socialInsurancePremiums || 120000, // 推定値
        isApplicable: true,
        reason: '国民健康保険、国民年金等の社会保険料',
        requiredDocuments: ['社会保険料控除証明書'],
      },
    ];

    const totalDeductions = deductions
      .filter(d => d.isApplicable)
      .reduce((sum, d) => sum + d.amount, 0);

    const taxableIncome = Math.max(0, grossIncome - totalDeductions);

    // 所得税の計算（簡易版）
    let incomeTax = 0;
    if (taxableIncome <= 1950000) {
      incomeTax = taxableIncome * 0.05;
    } else if (taxableIncome <= 3300000) {
      incomeTax = taxableIncome * 0.1 - 97500;
    } else if (taxableIncome <= 6950000) {
      incomeTax = taxableIncome * 0.2 - 427500;
    } else if (taxableIncome <= 9000000) {
      incomeTax = taxableIncome * 0.23 - 636000;
    } else {
      incomeTax = taxableIncome * 0.33 - 1536000;
    }

    // 復興特別所得税
    incomeTax = Math.floor(incomeTax * 1.021);

    // 住民税（所得割10% + 均等割5000円）
    const residentialTax = Math.floor(taxableIncome * 0.1) + 5000;

    // 個人事業税（事業所得が290万円を超える場合）
    const businessTaxableIncome = Math.max(0, netBusinessIncome - 2900000);
    const businessTax = Math.floor(businessTaxableIncome * 0.05);

    const totalTax = incomeTax + residentialTax + businessTax;

    // 予定納税額
    const estimatedQuarterlyPayment = Math.floor(incomeTax / 2);

    // 計算ステップの詳細
    const calculationSteps: CalculationStep[] = [
      {
        id: 'step-1',
        title: '事業所得の計算',
        description: '収入から必要経費を差し引いて事業所得を算出',
        formula: `${businessIncome.toLocaleString()}円 - ${businessExpense.toLocaleString()}円`,
        value: netBusinessIncome,
        explanation: '事業による収入から、事業に直接必要な経費を差し引きます。経費として認められるのは、事業に直接関係する支出のみです。',
        legalBasis: '所得税法第27条',
      },
      {
        id: 'step-2',
        title: '総所得金額の計算',
        description: '事業所得と給与所得を合算',
        formula: salaryIncomeAmount > 0 
          ? `${netBusinessIncome.toLocaleString()}円 + ${salaryIncomeAmount.toLocaleString()}円`
          : `${netBusinessIncome.toLocaleString()}円`,
        value: grossIncome,
        explanation: '各種所得を合算して総所得金額を算出します。給与所得がある場合は合算されます。',
        legalBasis: '所得税法第22条',
      },
      {
        id: 'step-3',
        title: '所得控除の適用',
        description: '基礎控除、青色申告特別控除等を適用',
        formula: `${grossIncome.toLocaleString()}円 - ${totalDeductions.toLocaleString()}円`,
        value: taxableIncome,
        explanation: '各種所得控除を適用して課税所得を算出します。控除額が多いほど税額は少なくなります。',
        legalBasis: '所得税法第72条〜第87条',
      },
      {
        id: 'step-4',
        title: '所得税の計算',
        description: '課税所得に税率を適用',
        formula: getTaxRateFormula(taxableIncome),
        value: incomeTax,
        explanation: '課税所得に応じた税率を適用します。日本では累進課税制度を採用しており、所得が高いほど税率も高くなります。',
        legalBasis: '所得税法第89条',
      },
    ];

    return {
      grossIncome,
      totalDeductions,
      taxableIncome,
      incomeTax,
      residentialTax,
      businessTax,
      totalTax,
      estimatedQuarterlyPayment,
      deductions,
      calculationSteps,
    };
  };

  // 税率計算式の表示
  const getTaxRateFormula = (income: number): string => {
    if (income <= 1950000) return `${income.toLocaleString()}円 × 5%`;
    if (income <= 3300000) return `${income.toLocaleString()}円 × 10% - 97,500円`;
    if (income <= 6950000) return `${income.toLocaleString()}円 × 20% - 427,500円`;
    if (income <= 9000000) return `${income.toLocaleString()}円 × 23% - 636,000円`;
    return `${income.toLocaleString()}円 × 33% - 1,536,000円`;
  };

  const taxResult = calculateTax();

  // 計算ステップの展開/折りたたみ
  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  // 控除詳細の表示切り替え
  const toggleDeductionDetails = (deductionType: string) => {
    setShowDeductionDetails(prev =>
      prev.includes(deductionType)
        ? prev.filter(type => type !== deductionType)
        : [...prev, deductionType]
    );
  };

  // 金額フォーマット
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // 控除タイプの日本語名
  const getDeductionName = (type: string) => {
    const names = {
      basic: '基礎控除',
      blue_return_special: '青色申告特別控除',
      social_insurance: '社会保険料控除',
      life_insurance: '生命保険料控除',
      earthquake_insurance: '地震保険料控除',
      medical: '医療費控除',
      donation: '寄付金控除',
    };
    return names[type as keyof typeof names] || type;
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#363427] mb-2">
              税金シミュレーター
            </h1>
            <p className="text-gray-600">
              現在の収支データから税額を試算し、計算過程を詳しく解説します
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              state.settings.taxReturnMode === 'blue' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {state.settings.taxReturnMode === 'blue' ? '青色申告' : '白色申告'}
            </div>
            <button
              onClick={() => dispatch({ type: 'SET_TAX_CALCULATION', payload: taxResult })}
              className="flex items-center px-4 py-2 bg-[#627962] text-white rounded-md hover:bg-[#627962]/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              再計算
            </button>
          </div>
        </div>
      </div>

      {/* 入力セクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 事業所得入力 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#363427] mb-4">事業所得</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                事業収入
              </label>
              <input
                type="number"
                value={businessIncome}
                onChange={(e) => setBusinessIncome(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#627962]"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                取引データから自動計算: {formatAmount(state.transactions
                  .filter(t => t.isIncome && new Date(t.date).getFullYear() === state.selectedYear)
                  .reduce((sum, t) => sum + t.amount, 0)
                )}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                必要経費
              </label>
              <input
                type="number"
                value={businessExpense}
                onChange={(e) => setBusinessExpense(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#627962]"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                取引データから自動計算: {formatAmount(state.transactions
                  .filter(t => !t.isIncome && t.isBusinessExpense && new Date(t.date).getFullYear() === state.selectedYear)
                  .reduce((sum, t) => sum + t.amount, 0)
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 給与所得入力 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#363427]">給与所得</h2>
            <button
              onClick={() => setShowSalaryInput(!showSalaryInput)}
              className="text-[#627962] text-sm hover:underline"
            >
              {showSalaryInput ? '非表示' : '給与所得を追加'}
            </button>
          </div>
          
          {showSalaryInput ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  年間給与額
                </label>
                <input
                  type="number"
                  value={salaryIncome?.annualSalary || 0}
                  onChange={(e) => setSalaryIncome(prev => ({ 
                    ...prev, 
                    annualSalary: Number(e.target.value),
                    year: state.selectedYear,
                    withheldIncomeTax: prev?.withheldIncomeTax || 0,
                    withheldResidentialTax: prev?.withheldResidentialTax || 0,
                    socialInsurancePremiums: prev?.socialInsurancePremiums || 0,
                    employerName: prev?.employerName || '',
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#627962]"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  源泉徴収税額
                </label>
                <input
                  type="number"
                  value={salaryIncome?.withheldIncomeTax || 0}
                  onChange={(e) => setSalaryIncome(prev => ({ 
                    ...prev!, 
                    withheldIncomeTax: Number(e.target.value) 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#627962]"
                  placeholder="0"
                />
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              給与所得がある場合は、源泉徴収票の情報を入力してください。
            </p>
          )}
        </div>
      </div>

      {/* 計算結果サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#627962]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">課税所得</p>
              <p className="text-2xl font-bold text-[#363427]">
                {formatAmount(taxResult.taxableIncome)}
              </p>
            </div>
            <Calculator className="w-8 h-8 text-[#627962]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">所得税</p>
              <p className="text-2xl font-bold text-red-600">
                {formatAmount(taxResult.incomeTax)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">住民税</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatAmount(taxResult.residentialTax)}
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">合計税額</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatAmount(taxResult.totalTax)}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* 所得控除の詳細 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[#363427] mb-4">適用される所得控除</h2>
        <div className="space-y-4">
          {taxResult.deductions.map((deduction) => (
            <div key={deduction.type} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    deduction.isApplicable ? 'bg-green-50' : 'bg-gray-50'
                  }`}>
                    {deduction.isApplicable ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-[#363427]">
                      {getDeductionName(deduction.type)}
                    </h3>
                    <p className="text-sm text-gray-600">{deduction.reason}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`text-lg font-semibold ${
                    deduction.isApplicable ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {formatAmount(deduction.amount)}
                  </span>
                  <button
                    onClick={() => toggleDeductionDetails(deduction.type)}
                    className="p-1 text-gray-400 hover:text-[#627962] transition-colors"
                  >
                    {showDeductionDetails.includes(deduction.type) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              
              {showDeductionDetails.includes(deduction.type) && (
                <div className="mt-4 pl-10 border-t pt-4">
                  <h4 className="font-medium text-[#363427] mb-2">必要書類</h4>
                  {deduction.requiredDocuments.length > 0 ? (
                    <ul className="text-sm text-gray-600 space-y-1">
                      {deduction.requiredDocuments.map((doc, index) => (
                        <li key={index} className="flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          {doc}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">特別な書類は必要ありません</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 計算過程の詳細 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[#363427] mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2" />
          計算過程の詳細解説
        </h2>
        <div className="space-y-4">
          {taxResult.calculationSteps.map((step) => (
            <div key={step.id} className="border rounded-lg">
              <button
                onClick={() => toggleStepExpansion(step.id)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-[#363427]">{step.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-semibold text-[#627962]">
                    {formatAmount(step.value)}
                  </span>
                  {expandedSteps.includes(step.id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>
              
              {expandedSteps.includes(step.id) && (
                <div className="px-4 pb-4 border-t bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <h4 className="font-medium text-[#363427] mb-2">計算式</h4>
                      <div className="bg-white p-3 rounded border font-mono text-sm">
                        {step.formula} = {formatAmount(step.value)}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#363427] mb-2">詳細説明</h4>
                      <p className="text-sm text-gray-700">{step.explanation}</p>
                      {step.legalBasis && (
                        <div className="mt-2 flex items-center text-xs text-blue-600">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          <span>根拠法令: {step.legalBasis}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 予定納税と注意事項 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">予定納税について</h3>
          <p className="text-blue-800 mb-4">
            前年の所得税額が15万円以上の場合、予定納税が必要です。
          </p>
          <div className="bg-white rounded p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">予定納税額（年間）</span>
              <span className="text-lg font-semibold text-blue-600">
                {formatAmount(taxResult.estimatedQuarterlyPayment * 2)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">第1期・第2期（各）</span>
              <span className="text-lg font-semibold text-blue-600">
                {formatAmount(taxResult.estimatedQuarterlyPayment)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">
            <AlertCircle className="w-5 h-5 inline mr-2" />
            注意事項
          </h3>
          <ul className="text-yellow-800 space-y-2 text-sm">
            <li>• この計算は簡易版です。実際の税額と異なる場合があります</li>
            <li>• 医療費控除、寄付金控除等は含まれていません</li>
            <li>• 最終的な申告は税理士または税務署にご相談ください</li>
            <li>• 計算根拠は国税庁のホームページで確認できます</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TaxSimulator;
