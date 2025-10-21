import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

// Cookieユーティリティ
const getCookie = (name: string): string | null => {
  const target = `${name}=`;
  const found = document.cookie.split("; ").find((row) => row.startsWith(target));
  return found ? found.substring(target.length) : null;
};

const setCookie = (name: string, value: string, maxAgeSeconds?: number) => {
  const maxAge = typeof maxAgeSeconds === "number" ? `; Max-Age=${maxAgeSeconds}` : "";
  document.cookie = `${name}=${value}; path=/${maxAge}; SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; path=/; Max-Age=0; SameSite=Lax`;
};

// ユーザー型定義
interface User {
  id: string;
  name: string;
  email: string;
  isSetupComplete: boolean;
}

// 一般ユーザーペルソナ型定義
interface Persona {
  ageGroup: string; // 年代: 例 "20代", "30代" など
  sideJobStartYear: number; // 副業開始年
  annualIncome: number; // 年間の収入（数値）
  taxKnowledgeLevel: number; // 税知識 1-5
}

// 認証コンテキストの型定義
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  shouldRedirectToLogin: boolean;
  shouldRedirectToSetup: boolean;
  role: number; // 1: 管理者, 0: 一般
  persona: Persona | null;
  tickets: number;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  savePersona: (value: Persona) => void;
  consumeTicketForEmail: (email: string) => number;
}

// 認証コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 認証プロバイダーコンポーネント
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirectToLogin, setShouldRedirectToLogin] = useState(false);
  const [shouldRedirectToSetup, setShouldRedirectToSetup] = useState(false);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [role, setRole] = useState<number>(0);
  const [tickets, setTickets] = useState<number>(0);

  // 初期化時にCookieからユーザー情報/ロール/ペルソナを取得
  useEffect(() => {
    const cookieValue = getCookie("user");
    if (cookieValue) {
      try {
        const parsedUser: User = JSON.parse(decodeURIComponent(cookieValue));
        setUser(parsedUser);
        // ユーザーのセットアップ状態に基づいてリダイレクト設定
        setShouldRedirectToSetup(!parsedUser.isSetupComplete);
      } catch {
        // 破損Cookieは削除
        deleteCookie("user");
        setShouldRedirectToLogin(true);
      }
    } else {
      setShouldRedirectToLogin(true);
    }

    // ロール取得
    const roleCookie = getCookie("role");
    setRole(roleCookie === "1" ? 1 : 0);

    // ペルソナ取得
    const personaCookie = getCookie("persona");
    if (personaCookie) {
      try {
        const parsedPersona: Persona = JSON.parse(decodeURIComponent(personaCookie));
        setPersona(parsedPersona);
      } catch {
        deleteCookie("persona");
      }
    }

    // 一般ユーザーのチケット初期化（Cookie優先、なければlocalStorage、両方なければ3配布）
    const userEmail = (() => {
      const u = getCookie("user");
      if (!u) return null;
      try {
        const parsed: User = JSON.parse(decodeURIComponent(u));
        return parsed.email;
      } catch {
        return null;
      }
    })();

    if (userEmail && (role === 0 || getCookie("role") !== "1")) {
      const cookieTickets = getCookie("tickets");
      let t = cookieTickets ? parseInt(cookieTickets, 10) : NaN;
      if (Number.isNaN(t)) {
        const ls = localStorage.getItem(`tickets:${userEmail}`);
        t = ls ? parseInt(ls, 10) : 3;
      }
      setTickets(t);
      setCookie("tickets", String(t), 60 * 60 * 24 * 7);
      localStorage.setItem(`tickets:${userEmail}`, String(t));
    }
    setIsLoading(false);
  }, []);

  // ログイン処理
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // デモ用の簡易認証
      if (email && password) {
        // 実際のアプリではAPIリクエストを行う
        const demoUser: User = {
          id: "demo-user-id",
          name: "デモユーザー",
          email: email,
          isSetupComplete: true,
        };

        // ユーザー情報をCookieに保存（7日間）
        setCookie("user", encodeURIComponent(JSON.stringify(demoUser)), 60 * 60 * 24 * 7);
        // ドメインに基づきroleクッキーを設定（1: 管理者, 0: 一般）
        const domainPart = email.split("@")[1]?.toLowerCase() ?? "";
        const roleValue = domainPart === "oji-cloud.com" ? "1" : "0";
        document.cookie = `role=${roleValue}; path=/; SameSite=Lax`;
        setRole(roleValue === "1" ? 1 : 0);
        // 一般ユーザーには初回配布（既存がなければ3）
        if (roleValue !== "1") {
          const key = `tickets:${email}`;
          const existing = localStorage.getItem(key);
          const initial = existing ? parseInt(existing, 10) : 3;
          setTickets(initial);
          localStorage.setItem(key, String(initial));
          setCookie("tickets", String(initial), 60 * 60 * 24 * 7);
        } else {
          setTickets(0);
          deleteCookie("tickets");
        }
        setUser(demoUser);
        setShouldRedirectToLogin(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error("ログインエラー:", error);
      return false;
    }
  };

  // ログアウト処理
  const logout = () => {
    deleteCookie("user");
    // roleクッキーを削除
    document.cookie = "role=; path=/; Max-Age=0; SameSite=Lax";
    // ペルソナも削除
    deleteCookie("persona");
    // チケットCookieも削除（localStorageは保持）
    deleteCookie("tickets");
    setUser(null);
    setPersona(null);
    setRole(0);
    setTickets(0);
    setShouldRedirectToLogin(true);
  };

  const savePersona = (value: Persona) => {
    setCookie("persona", encodeURIComponent(JSON.stringify(value)), 60 * 60 * 24 * 365);
    setPersona(value);
  };

  // 管理者が相談完了としてチケット消費。または一般ユーザー自身の反映
  const consumeTicketForEmail = (targetEmail: string): number => {
    const key = `tickets:${targetEmail}`;
    const current = parseInt(localStorage.getItem(key) ?? "0", 10) || 0;
    const next = Math.max(0, current - 1);
    localStorage.setItem(key, String(next));
    if (user && role === 0 && user.email === targetEmail) {
      setTickets(next);
      setCookie("tickets", String(next), 60 * 60 * 24 * 7);
    }
    return next;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        shouldRedirectToLogin,
        shouldRedirectToSetup,
        role,
        persona,
        tickets,
        login,
        logout,
        savePersona,
        consumeTicketForEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 認証コンテキストを使用するためのカスタムフック
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
