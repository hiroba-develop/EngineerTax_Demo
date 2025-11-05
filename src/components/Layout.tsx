import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Home,
  LogOut,
  Settings as SettingsIcon,
  User,
  Bell,
  ChevronDown,
  Wallet,
  HelpCircle,
  PenSquare,
  MessageSquare,
  Camera,
} from "lucide-react";

import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // デバッグ用ログ
  console.log('Layout rendered - path:', location.pathname);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // EngineerTax用のナビゲーションアイテム
  const navigationItems = [
    { name: "ダッシュボード", href: "/", icon: Home, description: "年間タスク管理" },
    { name: "記事一覧", href: "/posts", icon: PenSquare, description: "記事の一覧" },
    { name: "相談チャット", href: "/chat", icon: MessageSquare, description: "税理士との相談チャット" },
    { name: "証票アップロード", href: "/image-upload", icon: Camera, description: "画像の文字起こしとタグ付け" },
  ];

  return (
    <div className="min-h-screen bg-[#F1ECEB]">
      {/* メインコンテンツエリア */}
      <div className={`flex flex-col flex-1`}>
        {/* トップヘッダー（2段構成） */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          {/* 1段目：ブランド・検索・CTA */}
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3">
              {/* ブランド */}
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <span className="text-2xl font-extrabold text-[#363427] tracking-tight">
                    EngineerTax
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">確定申告支援</p>
                </div>
              </div>
            </div>

            {/* 検索フォーム */}
            {/* <div className="flex-1 max-w-3xl mx-4 hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="気になる話題、なかまを探そう"
                  className="w-full pl-10 pr-24 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-orange-500 text-white text-sm font-medium hover:bg-orange-600"
                >
                  検索
                </button>
              </form>
            </div> */}

            {/* 右側：ヘルプ/通知 + 認証CTA */}
            <div className="flex items-center space-x-3">
              <button className="hidden sm:inline-flex items-center justify-center w-10 h-10 rounded-full text-gray-500 hover:text-orange-600 focus:outline-none">
                <HelpCircle className="w-6 h-6" />
              </button>
              <button className="inline-flex items-center justify-center w-10 h-10 rounded-full text-gray-500 hover:text-orange-600 focus:outline-none">
                <Bell className="w-6 h-6" />
              </button>

              {user ? (
                <div className="relative hidden md:block">
                  <button
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-orange-600" />
                    </div>
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <button
                        onClick={() => navigate('/settings')}
                        className="flex items-center w-full px-4 py-2 text-sm text-[#363427] hover:bg-gray-100"
                      >
                        <SettingsIcon className="mr-3 h-4 w-4" />
                        設定
                      </button>
                      <div className="my-1 border-t border-gray-100" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-[#363427] hover:bg-gray-100"
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          ログアウト
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 rounded-full border border-orange-500 text-orange-600 text-sm font-semibold hover:bg-orange-50"
                  >
                    ログイン
                  </button>
                  <button
                onClick={() => navigate('/register')}
                    className="px-4 py-2 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600"
                  >
                    無料で始める
                  </button>
                </div>
              )}

              {/* モバイル用ログアウト/ログイン簡略 */}
              <div className="md:hidden">
                {user ? (
                  <button
                    className="p-1 rounded-full text-gray-400 hover:text-orange-600 focus:outline-none"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-6 w-6" />
                  </button>
                ) : (
                  <button
                  onClick={() => navigate('/register')}
                    className="px-3 py-1.5 rounded-full bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600"
                  >
                    開始
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 2段目：アイコン付きナビ + 投稿するCTA */}
          <div className="h-14 flex items-center px-4 sm:px-6 lg:px-8 border-t border-gray-100">
            <div className="flex-1 overflow-x-auto">
              <div className="flex items-center space-x-6 text-sm">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center whitespace-nowrap px-2 py-1.5 rounded-md ${
                        isActive
                          ? 'text-orange-600'
                          : 'text-[#363427] hover:text-orange-600'
                      }`}
                      title={item.description}
                    >
                      <item.icon className={`mr-2 h-5 w-5 ${isActive ? 'text-orange-600' : 'text-gray-400'}`} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            {user && role === 1 && (
              <div className="ml-4">
                <button onClick={() => navigate('/posts/new')} className="inline-flex items-center px-4 py-2 rounded-full border border-gray-300 hover:border-orange-500 text-[#363427] hover:text-orange-600 bg-white shadow-sm">
                  <PenSquare className="w-5 h-5 mr-2" />
                  投稿する
                </button>
              </div>
            )}
          </div>
        </div>

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;