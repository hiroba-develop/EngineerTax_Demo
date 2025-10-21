import { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

const PostShow = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const post = useMemo(() => loadPosts().find((p) => p.id === id), [id]);

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-red-700 text-sm mb-4">
          記事が見つかりませんでした。
        </div>
        <button onClick={() => navigate('/posts/new')} className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600">新規投稿へ</button>
      </div>
    );
  }

  const created = new Date(post.createdAt).toLocaleString();

  // 非ログイン時用：本文をテキスト化して300文字だけ表示
  const plainText = useMemo(() => {
    const replacedImages = post.body
      .replace(/\(image:\/\/([a-z0-9\-]+)\)/gi, (_, pid) => {
        const img = post.images?.find((i) => i.id === pid);
        return img ? `(画像:${img.name})` : `(画像)`;
      });
    return replacedImages
      .replace(/!\[[^\]]*\]\([^\)]*\)/g, "")
      .replace(/\[[^\]]*\]\([^\)]*\)/g, "")
      .replace(/[#*_`>!\-\[\]\(\)]/g, "");
  }, [post]);
  const previewText = plainText.slice(0, 300);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#363427]">{post.title}</h1>
        <Link to="/posts/new" className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">新規投稿</Link>
      </div>

      <div className="text-sm text-gray-500 mb-2">{created}</div>
      {/* タグ機能は削除 */}
      {post.thumbnail && (
        <div className="mb-4">
          <img src={post.thumbnail} alt="thumbnail" className="w-full rounded-lg border border-gray-200" />
        </div>
      )}
      {user ? (
        <article className="prose prose-neutral max-w-none bg-white p-4 rounded-lg border border-gray-200">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            urlTransform={(url) => {
              if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) return url;
              return '';
            }}
            components={{
              img: (props) => (
                // eslint-disable-next-line jsx-a11y/alt-text
                <img {...props} className={`rounded border border-gray-200 max-w-full ${props.className ?? ''}`} />
              ),
            }}
          >
            {post.body.replace(/\(image:\/\/([a-z0-9\-]+)\)/gi, (m, id) => {
              const img = post.images?.find(i => i.id === id);
              return img ? `(${img.dataUrl})` : m;
            })}
          </ReactMarkdown>
        </article>
      ) : (
        <>
          <article className="prose prose-neutral max-w-none bg-white p-4 rounded-lg border border-gray-200">
            <p className="whitespace-pre-wrap">{previewText}{plainText.length > 300 ? '…' : ''}</p>
          </article>
          {/* ログイン/会員登録のポップアップ */}
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xl text-center">
              <p className="text-lg font-semibold text-[#363427] mb-4">記事全文を読むには会員登録が必要です。</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={() => navigate('/login')} className="w-full px-4 py-3 rounded-lg bg-gray-500 text-white font-semibold hover:bg-gray-600">ログイン
                  <span className="block text-xs opacity-80">(会員の方はこちら)</span>
                </button>
                <button onClick={() => navigate('/register')} className="w-full px-4 py-3 rounded-lg bg-yellow-700 text-white font-semibold hover:bg-yellow-800">会員登録</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PostShow;


