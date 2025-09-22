import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, FAQItem } from '../types';
import {
  Send,
  Bot,
  User,
  Search,
  BookOpen,
  ExternalLink,
  Clock,
  Star,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
} from 'lucide-react';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // デバッグ用ログ
  console.log('Chat component rendered');

  // FAQ データ
  const faqItems: FAQItem[] = [
    {
      id: 'faq-1',
      question: 'GitHub Copilotの費用は経費として計上できますか？',
      answer: 'はい、GitHub Copilotは開発業務に直接使用するツールのため、経費として計上可能です。月額または年額プランの利用料を「開発ツール・ライセンス費」として処理してください。',
      category: '経費・控除',
      tags: ['GitHub', 'Copilot', '開発ツール', '経費'],
      isEngineerSpecific: true,
      updatedAt: '2024-02-01',
      legalBasis: '所得税法第37条（必要経費）',
    },
    {
      id: 'faq-2',
      question: 'AWS・GCPなどのクラウド利用料の処理方法は？',
      answer: 'クラウドサービスの利用料は、事業に使用した分のみ経費計上できます。個人利用と混在している場合は、事業利用割合で按分してください。利用明細を保管し、事業用途を明確にしておくことが重要です。',
      category: '経費・控除',
      tags: ['AWS', 'GCP', 'クラウド', '按分'],
      isEngineerSpecific: true,
      updatedAt: '2024-02-01',
      legalBasis: '所得税法第37条（必要経費）',
    },
    {
      id: 'faq-3',
      question: '自宅の作業スペースは経費になりますか？',
      answer: '自宅の一部を専ら事業用として使用している場合、家事按分により経費計上可能です。面積比や使用時間比で按分し、家賃・光熱費・通信費の一部を「地代家賃」「水道光熱費」として計上できます。',
      category: '経費・控除',
      tags: ['在宅勤務', '家事按分', '家賃', '光熱費'],
      isEngineerSpecific: true,
      updatedAt: '2024-02-01',
      legalBasis: '所得税法第45条（家事費と必要経費）',
    },
    {
      id: 'faq-4',
      question: '技術書や学習サービスの費用は経費になりますか？',
      answer: '業務に関連する技術書籍やオンライン学習サービス（Udemy、Courseraなど）は経費として計上できます。「研修費」や「書籍費」として処理してください。ただし、趣味的な学習は除外されます。',
      category: '経費・控除',
      tags: ['技術書', '学習', 'Udemy', '研修費'],
      isEngineerSpecific: true,
      updatedAt: '2024-02-01',
      legalBasis: '所得税法第37条（必要経費）',
    },
    {
      id: 'faq-5',
      question: 'カンファレンス参加費や交通費の処理方法は？',
      answer: '業務に関連する技術カンファレンスの参加費は「会議費」、交通費は「旅費交通費」として経費計上できます。宿泊が必要な場合の宿泊費も「旅費交通費」に含められます。領収書と参加証明書を保管してください。',
      category: '経費・控除',
      tags: ['カンファレンス', '交通費', '宿泊費', '会議費'],
      isEngineerSpecific: true,
      updatedAt: '2024-02-01',
      legalBasis: '所得税法第37条（必要経費）',
    },
    {
      id: 'faq-6',
      question: '青色申告と白色申告の違いは何ですか？',
      answer: '青色申告は複式簿記での記帳が必要ですが、65万円の特別控除が受けられます。白色申告は簡易な記帳で済みますが、特別控除はありません。副業収入が多い場合は青色申告が有利です。',
      category: '申告手続き',
      tags: ['青色申告', '白色申告', '特別控除', '複式簿記'],
      isEngineerSpecific: false,
      updatedAt: '2024-02-01',
      legalBasis: '所得税法第143条（青色申告特別控除）',
    },
  ];

  // 初期メッセージ
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          message: `こんにちは！EngineerWallet AIアシスタントです。
          
確定申告に関する質問にお答えします。特にエンジニアの副業に関する疑問があれば、お気軽にお聞きください。

以下のような質問にお答えできます：
• 開発ツールや学習費用の経費計上
• クラウドサービス利用料の処理
• 在宅勤務の家事按分方法
• 確定申告の手続きについて

何かご質問はありますか？`,
          isUser: false,
          timestamp: new Date().toISOString(),
          confidence: 1.0,
        },
      ]);
    }
  }, [messages.length]);

  // メッセージ送信後のスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // フィルタリングされたFAQ
  const filteredFAQs = faqItems.filter(faq => {
    if (selectedCategory !== 'all' && faq.category !== selectedCategory) return false;
    if (searchQuery && !faq.question.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
    return true;
  });

  // メッセージ送信
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      message: inputMessage,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // 簡易的なAI応答シミュレーション
    setTimeout(() => {
      const response = generateAIResponse(inputMessage);
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        message: response.message,
        isUser: false,
        timestamp: new Date().toISOString(),
        references: response.references,
        confidence: response.confidence,
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  // AI応答生成（デモ用）
  const generateAIResponse = (query: string): { message: string; references?: string[]; confidence: number } => {
    const lowerQuery = query.toLowerCase();

    // キーワードベースの簡易応答
    if (lowerQuery.includes('github') || lowerQuery.includes('copilot')) {
      return {
        message: `GitHub Copilotについてですね。

GitHub Copilotの利用料は、開発業務に直接使用するツールのため経費として計上可能です。

【処理方法】
• 勘定科目：「開発ツール・ライセンス費」または「雑費」
• 月額プラン：$10/月 → 毎月経費計上
• 年額プラン：$100/年 → 一括または月割で計上

【注意点】
• 個人利用と事業利用が混在する場合は按分が必要
• 領収書・利用明細を保管
• 事業との関連性を明確にしておく

他にも開発ツールに関する質問があればお聞きください。`,
        references: ['所得税法第37条', 'FAQ: GitHub Copilotの費用'],
        confidence: 0.95,
      };
    }

    if (lowerQuery.includes('aws') || lowerQuery.includes('gcp') || lowerQuery.includes('クラウド')) {
      return {
        message: `クラウドサービスの経費処理についてお答えします。

【基本的な考え方】
AWS、GCP等のクラウドサービス利用料は、事業に使用した分のみ経費計上できます。

【処理方法】
• 勘定科目：「通信費」または「雑費」
• 事業専用アカウント → 全額経費
• 個人・事業混用 → 按分計算が必要

【按分の考え方】
• 利用時間による按分
• プロジェクトごとの利用量による按分
• 合理的な基準で継続適用

【必要な書類】
• 利用明細・請求書
• 按分計算の根拠資料
• 事業用途の説明資料

詳細な按分方法について知りたい場合は、具体的な利用状況を教えてください。`,
        references: ['所得税法第37条', '家事費と必要経費の区分'],
        confidence: 0.92,
      };
    }

    if (lowerQuery.includes('在宅') || lowerQuery.includes('家事按分') || lowerQuery.includes('自宅')) {
      return {
        message: `在宅勤務の家事按分についてご説明します。

【経費計上できる費用】
• 家賃・住宅ローン利息
• 光熱費（電気・ガス・水道）
• 通信費（インターネット・電話）
• 火災保険料

【按分方法】
1. 面積按分
   事業用面積 ÷ 総面積 × 100

2. 時間按分
   事業使用時間 ÷ 総使用時間 × 100

3. 併用の場合
   面積按分 × 時間按分

【注意点】
• 専ら事業用として使用している部分のみ
• 合理的で継続的な按分基準を設定
• 按分計算の根拠を書面で保管
• 税務署への説明責任を果たせる資料を準備

按分割合の具体的な計算方法について詳しく知りたい場合は、作業環境の詳細を教えてください。`,
        references: ['所得税法第45条', '家事関連費の必要経費算入'],
        confidence: 0.90,
      };
    }

    // デフォルト応答
    return {
      message: `ご質問ありがとうございます。

申し訳ございませんが、お客様のご質問について、より具体的な情報が必要です。

以下の点について詳しく教えていただけますか：
• 具体的な状況や条件
• 関連する金額や期間
• 既に確認済みの情報があれば

また、よくある質問（FAQ）もご参照ください。エンジニア特有の経費や手続きについて詳しく解説しています。

【関連するFAQ】
• GitHub Copilotの費用は経費になるか
• AWS・GCPなどのクラウド利用料の処理
• 自宅作業スペースの経費計上
• 技術書・学習サービスの経費処理

他にもご質問がございましたら、お気軽にお聞きください。`,
      confidence: 0.7,
    };
  };

  // FAQクリック時の処理
  const handleFAQClick = (faq: FAQItem) => {
    const faqMessage: ChatMessage = {
      id: `faq-${Date.now()}`,
      message: `【${faq.question}】

${faq.answer}

${faq.legalBasis ? `【法的根拠】\n${faq.legalBasis}` : ''}

${faq.tags.length > 0 ? `【関連キーワード】\n${faq.tags.join('、')}` : ''}`,
      isUser: false,
      timestamp: new Date().toISOString(),
      confidence: 1.0,
    };

    setMessages(prev => [...prev, faqMessage]);
  };

  // メッセージの評価（デモ用）
  const handleMessageRating = (messageId: string, rating: 'up' | 'down') => {
    console.log(`Message ${messageId} rated: ${rating}`);
    // 実際のアプリでは、評価をサーバーに送信
  };

  return (
    <div className="h-full flex overflow-hidden">
        {/* チャット部分 */}
        <div className="flex-1 flex flex-col">
          {/* メッセージエリア */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-3xl ${message.isUser ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start space-x-3 ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* アバター */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.isUser ? 'bg-[#627962]' : 'bg-blue-500'
                    }`}>
                      {message.isUser ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </div>

                    {/* メッセージバブル */}
                    <div className={`rounded-lg p-4 ${
                      message.isUser
                        ? 'bg-[#627962] text-white'
                        : 'bg-white border border-gray-200'
                    }`}>
                      <pre className="whitespace-pre-wrap text-sm font-sans">
                        {message.message}
                      </pre>
                      
                      {/* 参考情報 */}
                      {message.references && message.references.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs text-gray-500 mb-2">参考情報:</div>
                          <div className="space-y-1">
                            {message.references.map((ref, index) => (
                              <div key={index} className="flex items-center text-xs text-blue-600">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                <span>{ref}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* 信頼度表示 */}
                      {message.confidence && !message.isUser && (
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <Star className="w-3 h-3 mr-1" />
                              信頼度: {Math.round(message.confidence * 100)}%
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleMessageRating(message.id, 'up')}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleMessageRating(message.id, 'down')}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* タイムスタンプ */}
                  <div className={`mt-1 text-xs text-gray-500 ${message.isUser ? 'text-right' : 'text-left'}`}>
                    <Clock className="w-3 h-3 inline mr-1" />
                    {new Date(message.timestamp).toLocaleTimeString('ja-JP')}
                  </div>
                </div>
              </div>
            ))}
            
            {/* ローディング表示 */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                      <span className="text-sm text-gray-600">回答を生成中...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* 入力エリア */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="確定申告について質問してください..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#627962]"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-6 py-3 bg-[#627962] text-white rounded-lg hover:bg-[#627962]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* FAQ サイドバー */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-[#363427] mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              よくある質問
            </h2>
            
            {/* 検索 */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="FAQ を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#627962] text-sm"
              />
            </div>

            {/* カテゴリフィルター */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#627962] text-sm"
            >
              <option value="all">全カテゴリ</option>
              <option value="経費・控除">経費・控除</option>
              <option value="申告手続き">申告手続き</option>
              <option value="税額計算">税額計算</option>
              <option value="その他">その他</option>
            </select>
          </div>

          {/* FAQ リスト */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3">
              {filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  onClick={() => handleFAQClick(faq)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-medium text-[#363427] leading-tight">
                      {faq.question}
                    </h3>
                    {faq.isEngineerSpecific && (
                      <span className="ml-2 px-2 py-1 bg-[#627962] bg-opacity-10 text-[#627962] text-xs rounded-full flex-shrink-0">
                        エンジニア
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {faq.answer}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {faq.category}
                    </span>
                    <span>{new Date(faq.updatedAt).toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
};

export default Chat;
