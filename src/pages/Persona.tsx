import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Persona = () => {
  const { role, persona, savePersona, user } = useAuth();
  const navigate = useNavigate();

  const [ageGroup, setAgeGroup] = useState("");
  const [sideJobStartYear, setSideJobStartYear] = useState("");
  const [annualIncome, setAnnualIncome] = useState("");
  const [taxKnowledgeLevel, setTaxKnowledgeLevel] = useState("3");
  const [error, setError] = useState("");

  useEffect(() => {
    // 管理者はこのページを利用しない
    if (role === 1) {
      navigate("/", { replace: true });
      return;
    }
    if (persona) {
      setAgeGroup(persona.ageGroup ?? "");
      setSideJobStartYear((persona.sideJobStartYear ?? "").toString());
      setAnnualIncome((persona.annualIncome ?? "").toString());
      setTaxKnowledgeLevel((persona.taxKnowledgeLevel ?? 3).toString());
    }
  }, [role, persona, navigate]);

  const handleSave = () => {
    setError("");
    if (!ageGroup) {
      setError("年代を選択してください");
      return;
    }
    if (!sideJobStartYear) {
      setError("副業開始年を入力してください");
      return;
    }
    if (!annualIncome) {
      setError("年間の収入を入力してください");
      return;
    }
    if (!taxKnowledgeLevel) {
      setError("税金についての知識量を選択してください");
      return;
    }

    savePersona({
      ageGroup,
      sideJobStartYear: Number(sideJobStartYear) || new Date().getFullYear(),
      annualIncome: Number(annualIncome) || 0,
      taxKnowledgeLevel: Number(taxKnowledgeLevel) || 3,
    });
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1ECEB] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#363427] mb-2">ペルソナ設定</h2>
          <p className="text-[#363427] text-opacity-80">{user?.name || "ユーザー"} さんの基本情報を設定してください</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#363427] mb-2">年代</label>
              <select
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
              >
                <option value="">選択してください</option>
                <option value="20代">20代</option>
                <option value="30代">30代</option>
                <option value="40代">40代</option>
                <option value="50代">50代</option>
                <option value="60代以上">60代以上</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#363427] mb-2">副業開始年</label>
              <input
                type="number"
                placeholder="例: 2022"
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={sideJobStartYear}
                onChange={(e) => setSideJobStartYear(e.target.value)}
                min="1980"
                max={new Date().getFullYear().toString()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#363427] mb-2">年間の収入（円）</label>
              <input
                type="number"
                placeholder="例: 3000000"
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                min="0"
                step="10000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#363427] mb-2">税金についての知識量（1=低い〜5=高い）</label>
              <select
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={taxKnowledgeLevel}
                onChange={(e) => setTaxKnowledgeLevel(e.target.value)}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-500 hover:bg-orange-600"
            >
              保存して進む
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Persona;


