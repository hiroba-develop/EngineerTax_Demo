import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bold,
  Italic,
  Strikethrough,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
} from "lucide-react";

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

function savePosts(posts: PostItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

const PostNew = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("# タイトル\n\nここに本文をMarkdownで記述できます。\n\n- 箇条書き\n- リスト\n\n**太字** や *斜体*、`コード` などにも対応します。");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);
  const thumbInputRef = useRef<HTMLInputElement | null>(null);
  const selectionRef = useRef<{ start: number; end: number } | null>(null);
  const [images, setImages] = useState<ImageAsset[]>([]);

  // テキストエリアの選択情報を取得
  const getSelection = (): { start: number; end: number } => {
    const el = textareaRef.current;
    if (!el) return { start: 0, end: 0 };
    return { start: el.selectionStart || 0, end: el.selectionEnd || 0 };
  };

  const replaceRange = (text: string, start: number, end: number, insert: string) => {
    const before = text.slice(0, start);
    const after = text.slice(end);
    return before + insert + after;
  };

  const wrapSelection = (prefix: string, suffix?: string) => {
    const { start, end } = getSelection();
    const selected = body.slice(start, end) || "";
    const wrapped = `${prefix}${selected}${suffix ?? prefix}`;
    const next = replaceRange(body, start, end, wrapped);
    setBody(next);
  };

  const prefixLines = (marker: string) => {
    const { start, end } = getSelection();
    const before = body.slice(0, start);
    const selection = body.slice(start, end);
    const after = body.slice(end);
    const lines = selection.split(/\n/);
    const updated = lines
      .map((line) => {
        if (!line) return marker.trim();
        if (marker === "1. ") return `1. ${line}`; // 簡易な番号リスト
        return `${marker}${line}`;
      })
      .join("\n");
    setBody(before + updated + after);
  };

  const insertLink = () => {
    const url = window.prompt("リンクURLを入力してください", "https://");
    if (!url) return;
    const { start, end } = getSelection();
    const text = body.slice(start, end) || "リンクテキスト";
    const md = `[${text}](${url})`;
    setBody(replaceRange(body, start, end, md));
  };

  const insertImage = () => {
    // 現在の選択範囲を保持してからファイル選択を開く
    selectionRef.current = getSelection();
    imageInputRef.current?.click();
  };

  const onPickImageFile = async (file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('file read error'));
      reader.readAsDataURL(file);
    });
    const name = file.name;
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    setImages((prev) => [...prev, { id, name, dataUrl }]);
    const { start, end } = selectionRef.current || getSelection();
    // 本文には巨大なDataURLを入れず、短いプレースホルダを挿入
    const md = `![${name}](image://${id})`;
    setBody(replaceRange(body, start, end, md));
    selectionRef.current = null;
  };

  const onThumbSelected = async (file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('file read error'));
      reader.readAsDataURL(file);
    });
    setThumbnail(dataUrl);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("タイトルを入力してください");
      return;
    }
    if (!body.trim()) {
      setError("本文を入力してください");
      return;
    }

    const newPost: PostItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title: title.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
      thumbnail,
      images,
    };

    const posts = loadPosts();
    posts.unshift(newPost);
    savePosts(posts);

    navigate(`/posts/${newPost.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#363427] mb-4">記事を投稿</h1>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#363427] mb-1">タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="タイトルを入力"
          />
        </div>

        {/* サムネイルアップロード */}
        <div>
          <label className="block text-sm font-medium text-[#363427] mb-1">サムネイル画像</label>
          <div className="flex items-start gap-4">
            <div className="w-28 h-28 rounded-lg border border-gray-300 bg-white flex items-center justify-center overflow-hidden">
              {thumbnail ? (
                <img src={thumbnail} alt="thumb" className="object-cover w-full h-full" />
              ) : (
                <span className="text-gray-400 text-xs">No Image</span>
              )}
            </div>
            <div>
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onThumbSelected(f);
                }}
              />
              <p className="text-xs text-gray-500 mt-1">推奨: 800x420px程度の横長画像</p>
            </div>
          </div>
        </div>

        {/* ハッシュタグ機能は削除 */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#363427] mb-1">本文 (Markdown)</label>
            {/* ツールバー */}
            <div className="mb-2 flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1">
              <button type="button" className="p-1.5 rounded hover:bg-gray-100" onClick={() => wrapSelection("**")} title="太字">
                <Bold className="w-4 h-4" />
              </button>
              <button type="button" className="p-1.5 rounded hover:bg-gray-100" onClick={() => wrapSelection("*")} title="斜体">
                <Italic className="w-4 h-4" />
              </button>
              <button type="button" className="p-1.5 rounded hover:bg-gray-100" onClick={() => wrapSelection("~~")} title="取り消し線">
                <Strikethrough className="w-4 h-4" />
              </button>
              <span className="mx-1 h-5 w-px bg-gray-300" />
              <button type="button" className="p-1.5 rounded hover:bg-gray-100" onClick={insertLink} title="リンク">
                <LinkIcon className="w-4 h-4" />
              </button>
              <span className="mx-1 h-5 w-px bg-gray-300" />
              <button type="button" className="p-1.5 rounded hover:bg-gray-100" onClick={() => prefixLines("1. ")} title="番号リスト">
                <ListOrdered className="w-4 h-4" />
              </button>
              <button type="button" className="p-1.5 rounded hover:bg-gray-100" onClick={() => prefixLines("- ")} title="箇条書き">
                <List className="w-4 h-4" />
              </button>
              <span className="mx-1 h-5 w-px bg-gray-300" />
              <button type="button" className="p-1.5 rounded hover:bg-gray-100" onClick={() => prefixLines("> ")} title="引用">
                <Quote className="w-4 h-4" />
              </button>
              <button type="button" className="p-1.5 rounded hover:bg-gray-100" onClick={() => wrapSelection("`", "`")} title="インラインコード">
                <Code className="w-4 h-4" />
              </button>
              <button type="button" className="p-1.5 rounded hover:bg-gray-100" onClick={() => wrapSelection("```\n", "\n```")} title="コードブロック">
                <Code className="w-4 h-4" />
              </button>
              <span className="mx-1 h-5 w-px bg-gray-300" />
              <button type="button" className="p-1.5 rounded hover:bg-gray-100" onClick={insertImage} title="画像(アップロード)">
                <ImageIcon className="w-4 h-4" />
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onPickImageFile(f);
                  if (imageInputRef.current) imageInputRef.current.value = "";
                }}
              />
            </div>
            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={16}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder="# 見出し など、Markdownで入力"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#363427] mb-1">プレビュー</label>
            <article className="prose prose-neutral max-w-none bg-white p-3 border border-gray-200 rounded-lg overflow-auto h-full">
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
                {body.replace(/\(image:\/\/([a-z0-9\-]+)\)/gi, (m, id) => {
                  const img = images.find(i => i.id === id);
                  return img ? `(${img.dataUrl})` : m;
                })}
              </ReactMarkdown>
            </article>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600">投稿する</button>
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg border border-gray-300 text-[#363427] hover:bg-gray-50">キャンセル</button>
        </div>
      </form>
    </div>
  );
};

export default PostNew;


