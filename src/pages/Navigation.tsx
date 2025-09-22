import React, { useState } from 'react';
import type { NavigationStep } from '../types';
import {
  Map,
  CheckCircle,
  Circle,
  Clock,
  Play,
  BookOpen,
  FileText,
  Video,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Info,
  Calendar,
  Target,
} from 'lucide-react';

const Navigation: React.FC = () => {
  const [expandedContent, setExpandedContent] = useState<string[]>([]);

  // 手順ナビゲーションのデータ
  const navigationSteps: NavigationStep[] = [
    {
      id: 'step-1',
      title: '準備フェーズ',
      description: '確定申告に必要な書類と情報を準備します',
      isCompleted: true,
      isActive: false,
      estimatedTime: 120,
      requiredTasks: [
        '源泉徴収票の収集',
        '支払調書の収集',
        '経費レシートの整理',
        '銀行口座の記録確認',
      ],
      learningContent: {
        title: '確定申告の基礎知識',
        type: 'article',
        content: `確定申告とは、1年間の所得と税額を計算し、納税額を確定する手続きです。
        
        副業を行うエンジニアの場合、以下の所得が対象となります：
        • 事業所得：業務委託による収入
        • 雑所得：アフィリエイト、講演料など
        • 給与所得：会社からの給与（年末調整済み）
        
        必要な書類：
        • 源泉徴収票（給与所得）
        • 支払調書（事業所得）
        • 経費に関する領収書・レシート
        • 各種控除証明書`,
        duration: 10,
      },
    },
    {
      id: 'step-2',
      title: '収支の整理',
      description: '収入と支出を正確に分類し、帳簿を作成します',
      isCompleted: false,
      isActive: true,
      estimatedTime: 180,
      requiredTasks: [
        '収入の分類と記録',
        '経費の分類と仕訳',
        '家事按分の計算',
        '帳簿の作成（青色申告の場合）',
      ],
      learningContent: {
        title: 'エンジニア向け経費の分類方法',
        type: 'tutorial',
        content: `エンジニアが経費として計上できる主な項目：

        開発関連費用：
        • クラウドサービス利用料（AWS、GCP等）
        • 開発ツール・ライセンス費用（GitHub、JetBrains等）
        • ドメイン・サーバー費用
        • API利用料
        
        学習・スキルアップ費用：
        • 技術書籍・電子書籍
        • オンライン学習サービス（Udemy、Coursera等）
        • 技術カンファレンス参加費
        • 資格取得費用
        
        作業環境費用：
        • パソコン・モニター等のハードウェア
        • 作業用デスク・チェア
        • コワーキングスペース利用料
        • 通信費（家事按分）
        
        注意：家事按分が必要な費用は、事業で使用する割合のみ経費計上可能`,
        duration: 15,
      },
    },
    {
      id: 'step-3',
      title: '申告書の作成',
      description: '確定申告書と必要な添付書類を作成します',
      isCompleted: false,
      isActive: false,
      estimatedTime: 150,
      requiredTasks: [
        '確定申告書Bの作成',
        '青色申告決算書の作成（青色申告の場合）',
        '収支内訳書の作成（白色申告の場合）',
        '添付書類の準備',
      ],
      learningContent: {
        title: '申告書作成のポイント',
        type: 'video',
        content: `申告書作成時の重要なポイント：

        青色申告の場合：
        • 複式簿記による記帳が必要
        • 青色申告決算書（損益計算書・貸借対照表）を作成
        • 65万円の特別控除が適用可能
        
        白色申告の場合：
        • 単式簿記でも可能
        • 収支内訳書を作成
        • 特別控除はなし
        
        共通事項：
        • 確定申告書Bを使用
        • 各種控除証明書を添付
        • 計算ミスがないか複数回確認`,
        duration: 20,
      },
    },
    {
      id: 'step-4',
      title: '税額計算と確認',
      description: '所得税・住民税・事業税を計算し、内容を確認します',
      isCompleted: false,
      isActive: false,
      estimatedTime: 90,
      requiredTasks: [
        '所得税の計算',
        '住民税の計算',
        '個人事業税の計算',
        '予定納税額の確認',
      ],
      learningContent: {
        title: '税額計算の仕組み',
        type: 'article',
        content: `税額計算の流れ：

        1. 総所得金額の計算
        各種所得を合算して総所得金額を算出

        2. 所得控除の適用
        • 基礎控除：48万円（所得2400万円以下）
        • 青色申告特別控除：65万円（青色申告の場合）
        • 社会保険料控除：支払った社会保険料
        • その他各種控除

        3. 課税所得の計算
        総所得金額 - 所得控除 = 課税所得

        4. 税額の計算
        • 所得税：課税所得 × 税率 - 控除額
        • 住民税：課税所得 × 10% + 均等割
        • 個人事業税：（事業所得 - 290万円）× 5%`,
        duration: 12,
      },
    },
    {
      id: 'step-5',
      title: '申告書の提出',
      description: 'e-Taxまたは税務署への申告書提出を行います',
      isCompleted: false,
      isActive: false,
      estimatedTime: 60,
      requiredTasks: [
        'e-Tax利用開始手続き（初回のみ）',
        '電子証明書の取得',
        '申告書のデータ送信',
        '提出完了の確認',
      ],
      learningContent: {
        title: 'e-Taxでの電子申告方法',
        type: 'tutorial',
        content: `e-Taxを利用した電子申告の手順：

        事前準備：
        • マイナンバーカードの取得
        • ICカードリーダーまたはスマートフォンの準備
        • e-Tax利用開始手続き

        申告書作成：
        • 確定申告書等作成コーナーを利用
        • 必要事項を入力
        • 添付書類をPDF化してアップロード

        送信・完了：
        • 電子署名を付与して送信
        • 受付結果を確認
        • 控えを保存

        メリット：
        • 24時間いつでも提出可能
        • 添付書類の提出省略
        • 還付金の早期受取`,
        duration: 18,
      },
    },
    {
      id: 'step-6',
      title: '納税・還付手続き',
      description: '税金の納付または還付金の受取手続きを行います',
      isCompleted: false,
      isActive: false,
      estimatedTime: 30,
      requiredTasks: [
        '納税額の確認',
        '納付方法の選択',
        '振替納税の手続き（希望する場合）',
        '還付金受取口座の確認',
      ],
      learningContent: {
        title: '納税方法と還付手続き',
        type: 'article',
        content: `納税方法の選択肢：

        現金納付：
        • 税務署の窓口
        • 銀行・郵便局
        • コンビニエンスストア（30万円以下）

        キャッシュレス納付：
        • クレジットカード（手数料あり）
        • インターネットバンキング
        • ダイレクト納付（e-Tax）

        振替納税：
        • 指定口座から自動引落
        • 申告期限より約1ヶ月後に引落
        • 手数料無料

        還付の場合：
        • 指定口座への振込
        • e-Tax利用で約3週間で還付
        • 書面提出の場合は約1〜2ヶ月`,
        duration: 8,
      },
    },
  ];

  // 進捗計算
  const completedSteps = navigationSteps.filter(step => step.isCompleted).length;
  const totalSteps = navigationSteps.length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  // 学習コンテンツの展開/折りたたみ
  const toggleContentExpansion = (stepId: string) => {
    setExpandedContent(prev =>
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  // コンテンツタイプのアイコン
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'tutorial': return <Play className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  // コンテンツタイプの日本語名
  const getContentTypeName = (type: string) => {
    const names = {
      video: '動画',
      tutorial: 'チュートリアル',
      article: '記事',
      slide: 'スライド',
    };
    return names[type as keyof typeof names] || type;
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#363427] mb-2 flex items-center">
              <Map className="w-6 h-6 mr-3 text-[#627962]" />
              確定申告手順ナビゲーション
            </h1>
            <p className="text-gray-600">
              確定申告完了までのステップを分かりやすく案内します
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-[#627962] mb-1">
              {progressPercentage}%
            </div>
            <div className="text-sm text-gray-600">
              {completedSteps} / {totalSteps} ステップ完了
            </div>
          </div>
        </div>

        {/* 進捗バー */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-[#627962] h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 重要な期限情報 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-yellow-900 mb-2">
              重要な期限
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-800">
                  <strong>3月15日</strong>: 確定申告期限
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-800">
                  <strong>3月15日</strong>: 納税期限
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-800">
                  <strong>3月15日</strong>: 青色申告承認申請期限
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ステップリスト */}
      <div className="space-y-4">
        {navigationSteps.map((step, index) => (
          <div
            key={step.id}
            className={`bg-white rounded-lg shadow-sm border-l-4 ${
              step.isCompleted
                ? 'border-green-500'
                : step.isActive
                ? 'border-[#627962]'
                : 'border-gray-300'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* ステップアイコン */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    step.isCompleted
                      ? 'bg-green-100'
                      : step.isActive
                      ? 'bg-[#627962] bg-opacity-10'
                      : 'bg-gray-100'
                  }`}>
                    {step.isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : step.isActive ? (
                      <Target className="w-6 h-6 text-[#627962]" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`text-lg font-semibold ${
                        step.isCompleted
                          ? 'text-green-700'
                          : step.isActive
                          ? 'text-[#627962]'
                          : 'text-gray-700'
                      }`}>
                        ステップ {index + 1}: {step.title}
                      </h3>
                      <span className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        約{step.estimatedTime}分
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4">{step.description}</p>

                    {/* 必要タスク */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">必要なタスク:</h4>
                      <ul className="space-y-1">
                        {step.requiredTasks.map((task, taskIndex) => (
                          <li key={taskIndex} className="flex items-center text-sm text-gray-600">
                            <ChevronRight className="w-3 h-3 mr-2 text-gray-400" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 学習コンテンツ */}
                    {step.learningContent && (
                      <div className="border-t pt-4">
                        <button
                          onClick={() => toggleContentExpansion(step.id)}
                          className="flex items-center space-x-2 text-[#627962] hover:text-[#627962]/80 transition-colors"
                        >
                          {getContentIcon(step.learningContent.type)}
                          <span className="font-medium">
                            学習コンテンツ: {step.learningContent.title}
                          </span>
                          <span className="text-xs bg-[#627962] bg-opacity-10 text-[#627962] px-2 py-1 rounded-full">
                            {getContentTypeName(step.learningContent.type)}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({step.learningContent.duration}分)
                          </span>
                          {expandedContent.includes(step.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>

                        {expandedContent.includes(step.id) && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="prose prose-sm max-w-none">
                              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                                {step.learningContent.content}
                              </pre>
                            </div>
                            {step.learningContent.url && (
                              <div className="mt-4">
                                <a
                                  href={step.learningContent.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-[#627962] hover:text-[#627962]/80 transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  詳細を見る
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 追加リソース */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2" />
          追加リソース
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-blue-900 mb-2">公式リソース</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center">
                <ExternalLink className="w-3 h-3 mr-2" />
                <a href="#" className="hover:underline">国税庁 確定申告書等作成コーナー</a>
              </li>
              <li className="flex items-center">
                <ExternalLink className="w-3 h-3 mr-2" />
                <a href="#" className="hover:underline">e-Tax 電子申告・納税システム</a>
              </li>
              <li className="flex items-center">
                <ExternalLink className="w-3 h-3 mr-2" />
                <a href="#" className="hover:underline">国税庁 タックスアンサー</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-blue-900 mb-2">エンジニア向け情報</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center">
                <ExternalLink className="w-3 h-3 mr-2" />
                <a href="#" className="hover:underline">IT関連経費の考え方</a>
              </li>
              <li className="flex items-center">
                <ExternalLink className="w-3 h-3 mr-2" />
                <a href="#" className="hover:underline">在宅勤務の家事按分方法</a>
              </li>
              <li className="flex items-center">
                <ExternalLink className="w-3 h-3 mr-2" />
                <a href="#" className="hover:underline">開発ツール費用の処理方法</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
