import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

type Message = {
  id: string;
  from: "user" | "admin";
  email: string; // 一般ユーザーの識別
  content: string;
  createdAt: number;
};

const STORAGE_KEY_PREFIX = "chat:"; // chat:<userEmail> に履歴を保存

const Chat = () => {
  const { role, user, tickets, consumeTicketForEmail } = useAuth();
  const [targetEmail, setTargetEmail] = useState(""); // 管理者が対象ユーザーを選択
  const effectiveEmail = useMemo(() => (role === 0 ? user?.email ?? "" : targetEmail), [role, user, targetEmail]);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [info, setInfo] = useState("");

  // 履歴ロード
  useEffect(() => {
    const email = effectiveEmail;
    if (!email) return;
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${email}`);
    if (raw) {
      try {
        setMessages(JSON.parse(raw) as Message[]);
      } catch {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [effectiveEmail]);

  // 履歴保存
  useEffect(() => {
    const email = effectiveEmail;
    if (!email) return;
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${email}`, JSON.stringify(messages));
  }, [messages, effectiveEmail]);

  const send = () => {
    const email = effectiveEmail;
    if (!email || !input.trim()) return;
    const newMsg: Message = {
      id: `${Date.now()}`,
      from: role === 1 ? "admin" : "user",
      email,
      content: input.trim(),
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  const markResolvedAndConsume = () => {
    if (role !== 1) return;
    const email = effectiveEmail;
    if (!email) return;
    const remaining = consumeTicketForEmail(email);
    setInfo(`相談を完了として処理しました。残りチケット: ${remaining}`);
    setTimeout(() => setInfo(""), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#363427]">相談チャット</h2>
        {role === 0 && (
          <div className="text-sm text-gray-600">残りチケット: {tickets}</div>
        )}
      </div>

      {role === 1 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <label className="block text-sm font-medium text-[#363427] mb-2">対象ユーザーメール</label>
          <input
            type="email"
            placeholder="user@example.com"
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={targetEmail}
            onChange={(e) => setTargetEmail(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-2">このユーザーとのスレッドを管理します。</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-4 h-[60vh] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`max-w-[80%] ${m.from === "user" ? "self-start" : "self-end"}`}>
              <div className={`px-3 py-2 rounded-lg text-sm ${m.from === "user" ? "bg-gray-100 text-[#363427]" : "bg-orange-500 text-white"}`}>
                <div className="opacity-60 text-[10px] mb-1">{m.from === "user" ? "ユーザー" : "管理者"}</div>
                <div>{m.content}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center space-x-2">
          <input
            type="text"
            placeholder="メッセージを入力"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={send}
            className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
          >
            送信
          </button>
          {role === 1 && (
            <button
              onClick={markResolvedAndConsume}
              className="px-4 py-2 rounded-lg border border-gray-300 text-[#363427] hover:border-orange-500 hover:text-orange-600"
            >
              相談完了にする（1枚消費）
            </button>
          )}
        </div>
      </div>

      {info && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">{info}</div>
      )}
    </div>
  );
};

export default Chat;


