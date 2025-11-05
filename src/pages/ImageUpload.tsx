import { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  UploadCloud,
  FileText,
  Trash2,
  X,
  Tag,
  PlusCircle,
  Edit,
  Save,
  XCircle,
} from 'lucide-react';

// サンプル画像のデータ（デモ用）
const initialImages: ImageFile[] = [
  {
    id: uuidv4(),
    name: 'サンプル領収書.png',
    url: '/sample_receipt.png', // publicディレクトリにあると仮定
    tags: ['領収書', '2025年'],
    createdAt: new Date('2025-11-01T10:00:00Z'),
  },
  {
    id: uuidv4(),
    name: 'サンプル名刺.jpg',
    url: '/sample_business_card.jpg', // publicディレクトリにあると仮定
    tags: ['名刺', '取引先'],
    createdAt: new Date('2025-10-15T14:30:00Z'),
  },
];

// タグの初期データ
const initialTags = ['領収書', '2025年', '名刺', '取引先'];

interface ImageFile {
  id: string;
  name: string;
  url: string;
  file?: File; // アップロードされたファイルの実体
  tags: string[];
  createdAt: Date;
}

const ImageUpload = () => {
  const [imageList, setImageList] = useState<ImageFile[]>(initialImages);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(
    initialImages[0]?.id || null,
  );
  const [ocrResult, setOcrResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [filterTag, setFilterTag] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('date_desc');
  const [managedTags, setManagedTags] = useState<string[]>(initialTags);
  const [editingTag, setEditingTag] = useState<{
    current: string;
    newValue: string;
  } | null>(null);
  const [newTagInput, setNewTagInput] = useState('');

  const selectedImage = useMemo(
    () => imageList.find(img => img.id === selectedImageId) || null,
    [imageList, selectedImageId],
  );

  const processedImages = useMemo(() => {
    let images = [...imageList];

    // Filtering
    if (filterTag) {
      images = images.filter(image => image.tags.includes(filterTag));
    }

    // Sorting
    switch (sortOrder) {
      case 'date_desc':
        images.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'date_asc':
        images.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'name_asc':
        images.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        images.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return images;
  }, [imageList, filterTag, sortOrder]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage: ImageFile = {
          id: uuidv4(),
          name: file.name,
          url: reader.result as string,
          file: file,
          tags: [],
          createdAt: new Date(),
        };
        setImageList(prev => [newImage, ...prev]);
        setSelectedImageId(newImage.id); // アップロードした画像をすぐに選択
        setOcrResult('');
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAndOcr = useCallback(async () => {
    if (!selectedImage) {
      setError('画像ファイルを選択してください。');
      return;
    }

    setIsLoading(true);
    setError('');
    setOcrResult('');

    // ダミーのAPI呼び出し
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const dummyText = `これはOCRで抽出されたテキストのサンプルです。\nファイル名: ${selectedImage.name}`;
      setOcrResult(dummyText);
    } catch (err) {
      setError('OCR処理中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  }, [selectedImage]);

  const selectImage = (image: ImageFile) => {
    setSelectedImageId(image.id);
    setOcrResult(''); // 画像を切り替えたらOCR結果をクリア
  };

  const handleDeleteImage = (
    e: React.MouseEvent<HTMLButtonElement>,
    imageId: string,
  ) => {
    e.stopPropagation(); // 親要素のonClickイベントが発火しないようにする
    setImageList(prev => prev.filter(img => img.id !== imageId));
    // 削除されたのが選択中の画像だった場合、選択を解除
    if (selectedImageId === imageId) {
      setSelectedImageId(null);
      setOcrResult('');
    }
  };

  // 選択中の画像に、管理タグリストからタグを追加
  const handleAddTagToImage = (imageId: string, tag: string) => {
    if (tag.trim() === '') return;
    setImageList(prev =>
      prev.map(img =>
        img.id === imageId && !img.tags.includes(tag)
          ? { ...img, tags: [...img.tags, tag.trim()] }
          : img,
      ),
    );
  };

  // 画像からタグを削除
  const handleRemoveTagFromImage = (imageId: string, tagToRemove: string) => {
    setImageList(prev =>
      prev.map(img =>
        img.id === imageId
          ? { ...img, tags: img.tags.filter(t => t !== tagToRemove) }
          : img,
      ),
    );
  };

  // ===== Tag Management Logic =====
  const handleAddNewManagedTag = () => {
    const newTag = newTagInput.trim();
    if (newTag && !managedTags.includes(newTag)) {
      setManagedTags(prev => [...prev, newTag].sort());
      setNewTagInput('');
    }
  };

  const handleDeleteManagedTag = (tagToDelete: string) => {
    // 1. 管理リストからタグを削除
    setManagedTags(prev => prev.filter(t => t !== tagToDelete));
    // 2. すべての画像から該当タグを削除 (連動)
    setImageList(prev =>
      prev.map(img => ({
        ...img,
        tags: img.tags.filter(t => t !== tagToDelete),
      })),
    );
  };

  const handleStartEditManagedTag = (tag: string) => {
    setEditingTag({ current: tag, newValue: tag });
  };

  const handleCancelEditManagedTag = () => {
    setEditingTag(null);
  };

  const handleSaveEditManagedTag = () => {
    if (!editingTag) return;
    const { current, newValue } = editingTag;
    const newTrimmedValue = newValue.trim();

    if (
      newTrimmedValue &&
      newTrimmedValue !== current &&
      !managedTags.includes(newTrimmedValue)
    ) {
      // 1. 管理リストのタグを更新
      setManagedTags(prev =>
        prev.map(t => (t === current ? newTrimmedValue : t)).sort(),
      );

      // 2. すべての画像の該当タグを更新 (連動)
      setImageList(prev =>
        prev.map(img => ({
          ...img,
          tags: img.tags.map(t => (t === current ? newTrimmedValue : t)),
        })),
      );
      setEditingTag(null);
    } else {
      //
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">画像アップロード & OCR</h1>

      <div className="flex flex-col md:flex-row md:space-x-6">
        {/* Left Column Wrapper */}
        <div className="w-full md:w-1/3">
          {/* Image Folder Card */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-3">画像フォルダ</h2>
            {/* Upload Button */}
            <label
              htmlFor="image-upload"
              className="w-full mb-4 flex items-center justify-center px-4 py-2 bg-orange-50 text-orange-700 font-semibold rounded-lg cursor-pointer hover:bg-orange-100"
            >
              <UploadCloud className="w-5 h-5 mr-2" />
              <span>画像をアップロード</span>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Filter & Sort UI */}
            <div className="flex gap-1 mb-3">
              <select
                value={filterTag}
                onChange={e => setFilterTag(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">すべてのタグ</option>
                {managedTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="date_desc">アップロード日 (新しい順)</option>
                <option value="date_asc">アップロード日 (古い順)</option>
                <option value="name_asc">ファイル名 (昇順)</option>
                <option value="name_desc">ファイル名 (降順)</option>
              </select>
            </div>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
              {processedImages.map(image => (
                <div
                  key={image.id}
                  onClick={() => selectImage(image)}
                  className={`flex items-center p-2 rounded-lg cursor-pointer group ${
                    selectedImageId === image.id
                      ? 'bg-orange-100 ring-2 ring-orange-500'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-12 h-12 object-cover rounded-md mr-3"
                  />
                  <span className="text-sm font-medium text-gray-800 truncate flex-1">
                    {image.name}
                  </span>
                  <button
                    onClick={e => handleDeleteImage(e, image.id)}
                    className="ml-2 p-1 rounded-full text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-colors"
                    aria-label="画像を削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tag Management Card */}
          <div className="bg-white p-4 rounded-lg shadow-md mt-6">
            <h2 className="text-lg font-semibold mb-3">タグ管理</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleAddNewManagedTag();
              }}
              className="flex gap-2 mb-3"
            >
              <input
                type="text"
                value={newTagInput}
                onChange={e => setNewTagInput(e.target.value)}
                placeholder="新規タグ名"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300"
                disabled={!newTagInput.trim()}
                aria-label="新しいタグを追加"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </form>
            <div className="space-y-2 max-h-[25vh] overflow-y-auto pr-2">
              {managedTags.map(tag => (
                <div
                  key={tag}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                >
                  {editingTag?.current === tag ? (
                    <input
                      type="text"
                      value={editingTag.newValue}
                      onChange={e =>
                        setEditingTag({ ...editingTag, newValue: e.target.value })
                      }
                      className="w-full px-2 py-1 border border-orange-500 rounded-lg text-sm focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm">{tag}</span>
                  )}
                  <div className="flex items-center gap-1 ml-2">
                    {editingTag?.current === tag ? (
                      <>
                        <button
                          onClick={handleSaveEditManagedTag}
                          className="p-1 text-green-600 hover:text-green-800"
                          aria-label="保存"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEditManagedTag}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          aria-label="キャンセル"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEditManagedTag(tag)}
                          className="p-1 text-gray-500 hover:text-blue-700"
                          aria-label="編集"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteManagedTag(tag)}
                          className="p-1 text-gray-500 hover:text-red-700"
                          aria-label="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Preview and OCR */}
        <div className="w-full md:w-2/3 mt-6 md:mt-0">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-3">プレビュー & OCR実行</h2>
            <div className="p-4 border rounded-lg bg-gray-50 min-h-[300px] flex justify-center items-center mb-4">
              {selectedImage ? (
                <img
                  src={selectedImage.url}
                  alt="プレビュー"
                  className="max-h-80 w-auto object-contain"
                />
              ) : (
                <p className="text-gray-500">画像を選択してください</p>
              )}
            </div>

            {/* Tag Management */}
            {selectedImage && (
              <div className="mb-4">
                <h3 className="text-md font-semibold mb-2 flex items-center">
                  <Tag className="w-4 h-4 mr-2 text-gray-500" />
                  タグ管理
                </h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedImage.tags.map(tag => (
                    <div
                      key={tag}
                      className="flex items-center bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() =>
                          handleRemoveTagFromImage(selectedImage.id, tag)
                        }
                        className="ml-1.5 -mr-1 p-0.5 rounded-full hover:bg-gray-300"
                        aria-label={`${tag} タグを削除`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    const newTag = e.currentTarget.newTag.value;
                    handleAddTagToImage(selectedImage.id, newTag);
                    e.currentTarget.newTag.value = '';
                  }}
                  className="flex items-center gap-2"
                >
                  <select
                    name="newTag"
                    defaultValue=""
                    className="flex-grow px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="" disabled>
                      タグを選択...
                    </option>
                    {managedTags
                      .filter(t => !selectedImage.tags.includes(t))
                      .map(tag => (
                        <option key={tag} value={tag}>
                          {tag}
                        </option>
                      ))}
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    追加
                  </button>
                </form>
              </div>
            )}

            {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

            <button
              type="button"
              onClick={handleUploadAndOcr}
              disabled={!selectedImage || isLoading}
              className="w-full px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75 disabled:bg-gray-400 flex items-center justify-center"
            >
              <FileText className="w-5 h-5 mr-2" />
              {isLoading ? '処理中...' : '選択した画像のOCRを実行'}
            </button>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">OCR結果</h3>
              <div className="p-4 border rounded-lg bg-gray-50 min-h-[150px] whitespace-pre-wrap">
                {ocrResult ? (
                  <p className="text-gray-800">{ocrResult}</p>
                ) : (
                  <p className="text-gray-500">ここにOCR結果が表示されます</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
