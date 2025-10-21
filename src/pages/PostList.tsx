import { Link } from "react-router-dom";

interface ImageAsset {
  id: string;
  name: string;
  dataUrl: string;
}

interface PostItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  thumbnail?: string;
  images?: ImageAsset[];
}

const STORAGE_KEY = "demo_posts";

function loadPosts(): PostItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PostItem[]) : [];
  } catch {
    return [];
  }
}

const PostList = () => {
  const posts = loadPosts();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#363427]">投稿一覧</h1>
      </div>

      {posts.length === 0 ? (
        <div className="p-4 border border-gray-200 rounded-lg bg-white text-sm text-gray-600">
          まだ投稿がありません。
        </div>
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => (
            <li key={p.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
              <Link to={`/posts/${p.id}`} className="block">
                <div className="flex items-start gap-3">
                  {p.thumbnail && (
                    <img src={p.thumbnail} alt="thumb" className="w-20 h-20 object-cover rounded border border-gray-200" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-[#363427] truncate">{p.title}</h2>
                      <span className="text-xs text-gray-500 ml-3 whitespace-nowrap">{new Date(p.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.body.replace(/\(image:\/\/[a-z0-9\-]+\)/gi, '(画像)').replace(/[#*_`>\-\[\]]/g, "")}</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PostList;


