import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Home,
  LogOut,
  Settings as SettingsIcon,
  User,
  ChevronDown,
  Wallet,
  PenSquare,
  MessageSquare,
  Camera,
  Menu,
  FileArchive, // FileArchiveをインポート
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    { name: "証票管理", href: "/vouchers", icon: FileArchive, description: "登録済み証票の管理" }, // 新しいナビゲーション項目
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
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <span className="text-2xl font-extrabold text-black tracking-tight">
                    EngineerTax
                  </span>
                  <p className="text-xs text-black mt-0.5">確定申告支援</p>
                </div>
              </div>
            </div>
            {/* 右側：ヘルプ/通知 + 認証CTA */}
            <div className="flex items-center space-x-3">
              {user ? (
                <div className="relative hidden md:block">
                  <button
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <button
                        onClick={() => navigate('/settings')}
                        className="flex items-center w-full px-4 py-2 text-sm text-black hover:bg-gray-100"
                      >
                        <SettingsIcon className="mr-3 h-4 w-4" />
                        設定
                      </button>
                      <div className="my-1 border-t border-gray-100" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-black hover:bg-gray-100"
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
                    className="px-4 py-2 rounded-full border border-blue-500 text-black text-sm font-semibold hover:bg-blue-50"
                  >
                    ログイン
                  </button>
                  <button
                onClick={() => navigate('/register')}
                    className="px-4 py-2 rounded-full bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600"
                  >
                    無料で始める
                  </button>
                </div>
              )}

              {/* モバイル用ハンバーガーメニュー */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full text-black hover:text-blue-600 focus:outline-none"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* 2段目：アイコン付きナビ + 投稿するCTA */}
          <div className="hidden h-14 md:flex items-center px-4 sm:px-6 lg:px-8 border-t border-gray-100">
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
                          ? 'text-blue-600'
                          : 'text-black hover:text-blue-600'
                      }`}
                      title={item.description}
                    >
                      <item.icon className={`mr-2 h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            {user && role === 1 && (
              <div className="ml-4">
                <button onClick={() => navigate('/posts/new')} className="inline-flex items-center px-4 py-2 rounded-full border border-gray-300 hover:border-blue-500 text-black hover:text-blue-600 bg-white shadow-sm">
                  <PenSquare className="w-5 h-5 mr-2" />
                  投稿する
                </button>
              </div>
            )}
          </div>
          {/* モバイル用ナビゲーションメニュー */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                        isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className={`mr-3 h-6 w-6 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className={`font-medium ${isActive ? 'text-blue-600' : 'text-black'}`}>
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
              
              <div className="px-2 pt-2 pb-3 border-t border-gray-100">
                {user ? (
                  <div className="space-y-1">
                     {role === 1 && (
                      <button 
                        onClick={() => {
                          navigate('/posts/new');
                          setIsMobileMenuOpen(false);
                        }} 
                        className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-black hover:bg-gray-50"
                      >
                        <PenSquare className="mr-3 h-6 w-6 text-gray-400" />
                        投稿する
                      </button>
                    )}
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-black hover:bg-gray-50"
                    >
                      <SettingsIcon className="mr-3 h-6 w-6 text-gray-400" />
                      設定
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-black hover:bg-gray-50"
                    >
                      <LogOut className="mr-3 h-6 w-6 text-gray-400" />
                      ログアウト
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        navigate('/login');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 rounded-full border border-blue-500 text-black text-sm font-semibold hover:bg-blue-50"
                    >
                      ログイン
                    </button>
                    <button
                      onClick={() => {
                        navigate('/register');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 rounded-full bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600"
                    >
                      無料で始める
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
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