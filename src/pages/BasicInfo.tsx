import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const BasicInfo = () => {
  const { role, basicInfo, saveBasicInfo } = useAuth();
  const navigate = useNavigate();

  const [ageGroup, setAgeGroup] = useState("");
  const [sideJobCategory, setSideJobCategory] = useState("");
  const [expectedSideIncome, setExpectedSideIncome] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // 管理者はこのページを利用しない
    if (role === 1) {
      navigate("/", { replace: true });
      return;
    }
    if (basicInfo) {
      setAgeGroup(basicInfo.ageGroup ?? "");
      setSideJobCategory(basicInfo.sideJobCategory ?? "");
      setExpectedSideIncome(basicInfo.expectedSideIncome ?? "");
    }
  }, [role, basicInfo, navigate]);

  const handleSave = () => {
    setError("");
    if (!ageGroup) {
      setError("年齢区分を選択してください");
      return;
    }
    if (!sideJobCategory) {
      setError("副業区分を選択してください");
      return;
    }
    if (!expectedSideIncome) {
      setError("副業収入見込みを選択してください");
      return;
    }

    saveBasicInfo({
      ageGroup,
      sideJobCategory,
      expectedSideIncome,
    });
    navigate("/", { replace: true });
  };

  return (
    <div className="flex items-center justify-center bg-[#F1ECEB] py-12 px-4 sm:px-6 lg:px-8 h-full">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#363427] mb-2">基本情報</h2>
          <p className="text-[#363427] text-opacity-80">基本情報を設定してください</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="age-group" className="block text-sm font-medium text-[#363427] mb-2">年齢区分</label>
              <select
                id="age-group"
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
              >
                <option value="">選択してください</option>
                <option value="1">〜20代</option>
                <option value="2">30代</option>
                <option value="3">40代</option>
                <option value="4">50代〜</option>
              </select>
            </div>
            <div>
              <label htmlFor="side-job-category" className="block text-sm font-medium text-[#363427] mb-2">副業区分</label>
              <select
                id="side-job-category"
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sideJobCategory}
                onChange={(e) => setSideJobCategory(e.target.value)}
              >
                <option value="">選択してください</option>
                <option value="1">Web／アプリ開発</option>
                <option value="2">インフラ・クラウド</option>
                <option value="3">デザイン</option>
                <option value="4">コンサル／業務委託</option>
              </select>
            </div>
            <div>
              <label htmlFor="expected-side-income" className="block text-sm font-medium text-[#363427] mb-2">副業収入見込み</label>
              <select
                id="expected-side-income"
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={expectedSideIncome}
                onChange={(e) => setExpectedSideIncome(e.target.value)}
              >
                <option value="">選択してください</option>
                <option value="1">〜10万円</option>
                <option value="2">10〜50万円</option>
                <option value="3">50〜100万円</option>
                <option value="4">100〜300万円</option>
                <option value="5">300万円以上</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-500 hover:bg-blue-600"
            >
              保存して進む
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;


