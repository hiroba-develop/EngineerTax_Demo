import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useApp } from "../contexts/AppContext";
import {
  Home,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Bell,
  ChevronDown,
  Calculator,
  TrendingUp,
  MessageCircle,
  Map,
  Wallet,
} from "lucide-react";

import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  hideSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideSidebar = false }) => {
  const { user, logout } = useAuth();
  const { state } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // デバッグ用ログ
  console.log('Layout rendered with hideSidebar:', hideSidebar, 'Current path:', location.pathname);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // EngineerWallet用のナビゲーションアイテム
  const navigationItems = [
    { name: "ダッシュボード", href: "/", icon: Home, description: "年間タスク管理" },
    { name: "収支管理", href: "/income-expense", icon: TrendingUp, description: "収入・経費管理" },
    { name: "税金シミュレーター", href: "/tax-simulator", icon: Calculator, description: "税額計算" },
    { name: "手順ナビ", href: "/navigation", icon: Map, description: "申告手順ガイド" },
    { name: "AIチャット", href: "/chat", icon: MessageCircle, description: "Q&Aサポート" },
    { name: "設定", href: "/settings", icon: Settings, description: "アプリ設定" },
  ];

  // 進捗情報の取得
  const completedTasks = state.tasks.filter(task => task.status === 'completed').length;
  const totalTasks = state.tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F1ECEB]">
      {/* サイドバー（デスクトップ） */}
      {!hideSidebar && (
        <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
          <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200 shadow-sm">
            {/* ロゴ・ブランド */}
            <div className="flex flex-1 flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#627962] rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <span className="text-xl font-bold text-[#363427]">
                      EngineerWallet
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">確定申告支援</p>
                  </div>
                </div>
              </div>

              {/* 申告モード表示 */}
              <div className="mx-4 mt-4 p-3 bg-[#627962] bg-opacity-10 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#363427]">申告モード</span>
                  <span className="text-xs bg-[#627962] text-white px-2 py-1 rounded-full">
                    {state.settings.taxReturnMode === 'blue' ? '青色申告' : '白色申告'}
                  </span>
                </div>
                {totalTasks > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>進捗</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#627962] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* ナビゲーション */}
              <nav className="mt-6 flex-1 px-2 space-y-1">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        isActive
                          ? "bg-[#627962] bg-opacity-10 border-r-2 border-[#627962] text-[#627962]"
                          : "text-[#363427] hover:bg-gray-50 hover:text-[#627962]"
                      } group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200`}
                      title={item.description}
                    >
                      <item.icon
                        className={`${
                          isActive ? "text-[#627962]" : "text-gray-400 group-hover:text-[#627962]"
                        } mr-3 flex-shrink-0 h-5 w-5`}
                      />
                      <div>
                        <div>{item.name}</div>
                        <div className="text-xs text-gray-500 group-hover:text-gray-600">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* ユーザー情報 */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#627962] bg-opacity-20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-[#627962]" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-[#363427]">
                    {user?.name || "ゲストユーザー"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {state.settings.fiscalYear}年度 | デモモード
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* モバイルサイドバーオーバーレイ */}
      {isSidebarOpen && !hideSidebar && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* モバイル用サイドバーコンテンツ */}
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <div className="w-8 h-8 bg-[#627962] rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-lg font-bold text-[#363427]">
                  EngineerWallet
                </span>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        isActive
                          ? "bg-[#627962] bg-opacity-10 border-r-2 border-[#627962] text-[#627962]"
                          : "text-[#363427] hover:bg-gray-50 hover:text-[#627962]"
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <item.icon
                        className={`${
                          isActive ? "text-[#627962]" : "text-gray-400"
                        } mr-3 flex-shrink-0 h-5 w-5`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* モバイル用ユーザー情報 */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-[#627962] bg-opacity-20 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-[#627962]" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-[#363427]">
                    {user?.name || "ゲストユーザー"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {state.settings.fiscalYear}年度 | デモモード
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* メインコンテンツエリア */}
      <div className={`${hideSidebar ? '' : 'md:pl-64'} flex flex-col flex-1`}>
        {/* トップヘッダー */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* モバイル用メニューボタン */}
            {!hideSidebar && (
              <button
                className="md:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#627962]"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
            )}

            {/* ページタイトル */}
            {!hideSidebar && (
              <div className="flex-1 md:flex-none">
                <h1 className="text-lg font-semibold text-[#363427] md:hidden">
                  {navigationItems.find((item) => item.href === location.pathname)
                    ?.name || "ページ"}
                </h1>
              </div>
            )}

            {/* 右側のアクション */}
            <div className="flex items-center space-x-4">
              {/* 年度選択 */}
              <div className="hidden sm:block text-sm text-[#363427]">
                <span className="font-medium">{state.settings.fiscalYear}年度</span>
              </div>

              {/* 通知ボタン */}
              <button className="p-1 rounded-full text-gray-400 hover:text-[#627962] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#627962] transition-colors">
                <Bell className="h-6 h-6" />
              </button>

              {/* ユーザーメニュー（デスクトップ） */}
              <div className="relative hidden md:block">
                <button
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#627962]"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <div className="w-8 h-8 bg-[#627962] bg-opacity-20 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-[#627962]" />
                  </div>
                  <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
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

              {/* モバイル用ログアウトボタン */}
              <button
                className="md:hidden p-1 rounded-full text-gray-400 hover:text-[#627962] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#627962]"
                onClick={handleLogout}
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
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