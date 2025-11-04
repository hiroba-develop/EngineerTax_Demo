import React from 'react';
import { Link } from 'react-router-dom';
// import { Megaphone } from 'lucide-react';

interface PostItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  thumbnail?: string;
}

const STORAGE_KEY = 'demo_posts';

function loadPosts(): PostItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PostItem[]) : [];
  } catch {
    return [];
  }
}

const Dashboard: React.FC = () => {
  const posts = loadPosts();
  const recent = posts.slice(0, 5);

  // const announcements = [
  //   { id: 'a1', title: 'Markdown記法に対応しました', date: '2025-10-19' },
  //   { id: 'a2', title: '投稿一覧ページを追加しました', date: '2025-10-19' },
  // ];

  return (
    <div className="space-y-6">
      {/* お知らせ（最上部） */}
      {/* <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center">
          <Megaphone className="w-5 h-5 text-gray-700 mr-2" />
          <h2 className="text-lg font-semibold text-[#363427]">お知らせ</h2>
        </div>
        <ul className="divide-y divide-gray-200">
          {announcements.map((a) => (
            <li key={a.id} className="p-6 flex items-center justify-between">
              <p className="text-[#363427]">{a.title}</p>
              <span className="text-sm text-gray-500">{a.date}</span>
            </li>
          ))}
        </ul>
      </div> */}

      {/* 最近の投稿（サムネイル＋タイトルのカード表示） */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#363427]">最近の投稿</h2>
          <Link to="/posts" className="text-sm text-orange-600 hover:underline">すべて見る</Link>
        </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recent.map((p) => (
                <Link key={p.id} to={`/posts/${p.id}`} className="group block rounded-lg border border-gray-200 overflow-hidden bg-white hover:shadow-sm transition">
                  <div className="aspect-[16/9] bg-gray-100">
                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt="thumb" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-[#363427] line-clamp-2 group-hover:underline">{p.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
      </div>

      
    </div>
  );
};

export default Dashboard;
