import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Persona from "./pages/Persona";
import PostNew from "./pages/PostNew";
import PostShow from "./pages/PostShow";
import PostList from "./pages/PostList";
import Chat from "./pages/Chat";
import ImageUpload from "./pages/ImageUpload";
import { useEffect } from "react";

// 認証不要運用のため、ProtectedRouteは撤廃

// 設定ページのみ認証を要求するガード
const RequireLogin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, shouldRedirectToLogin } = useAuth();
  if (isLoading) return null;
  if (shouldRedirectToLogin || !user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// メインアプリケーションコンポーネント
const AppContent: React.FC = () => {
  // 検索エンジンボット対策の強化
  useEffect(() => {
    // User-Agentベースでのボット検出
    const userAgent = navigator.userAgent.toLowerCase();
    const isBot = /bot|crawler|spider|crawling/i.test(userAgent);

    if (isBot) {
      // ボットの場合は空のページを表示
      document.body.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
          <div style="text-align: center;">
            <h1>会員限定サイト</h1>
            <p>このサイトは会員限定です。</p>
            <p>アクセスには認証が必要です。</p>
          </div>
        </div>
      `;
      return;
    }

    // メタタグの動的追加（念のため）
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      const meta = document.createElement("meta");
      meta.name = "robots";
      meta.content = "noindex, nofollow, noarchive, nosnippet, noimageindex";
      document.head.appendChild(meta);
    }

    // EngineerTax用のページタイトル設定
    document.title = "EngineerTax - エンジニア向け確定申告支援";
  }, []);

  return (
    <Routes>
      {/* ログイン/登録 */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/chat"
        element={
          <RequireLogin>
            <Layout>
              <Chat />
            </Layout>
          </RequireLogin>
        }
      />
      <Route
        path="/persona"
        element={
          <RequireLogin>
            <Layout>
              <Persona />
            </Layout>
          </RequireLogin>
        }
      />

      {/* 記事 */}
      <Route
        path="/posts"
        element={
          <Layout>
            <PostList />
          </Layout>
        }
      />
      <Route
        path="/posts/new"
        element={
          <RequireLogin>
            <Layout>
              <PostNew />
            </Layout>
          </RequireLogin>
        }
      />
      <Route
        path="/posts/:id"
        element={
          <Layout>
            <PostShow />
          </Layout>
        }
      />

      {/* 各ページ（ログイン不要） */}
      <Route
        path="/"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />
      <Route
        path="/image-upload"
        element={
          <RequireLogin>
            <Layout>
              <ImageUpload />
            </Layout>
          </RequireLogin>
        }
      />
      {/* 収支管理/税金シミュレーター/手順ナビ/AIチャット ルートは削除 */}
      <Route
        path="/settings"
        element={
          <RequireLogin>
            <Layout>
              <Settings />
            </Layout>
          </RequireLogin>
        }
      />
    </Routes>
  );
};

function App() {
  // Viteのベースパスを取得
  const basename = import.meta.env.BASE_URL;

  return (
    <AuthProvider>
      <AppProvider>
        <Router basename={basename}>
          <AppContent />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
