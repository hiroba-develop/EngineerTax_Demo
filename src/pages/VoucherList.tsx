import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  Trash2,
  PlusCircle,
  Edit,
  Save,
  XCircle,
  ChevronRight,
  Search,
  X,
} from 'lucide-react';
import { useVouchers } from '../contexts/VoucherContext';
import type { ImageFile } from '../contexts/VoucherContext';

const VoucherList = () => {
  // Contextから状態とロジックを取得
  const {
    imageList,
    managedTags,
    deleteImageFile,
    addTagToImage,
    removeTagFromImage,
    addNewManagedTag,
    deleteManagedTag,
    updateManagedTag,
  } = useVouchers();

  const location = useLocation();
  const navigate = useNavigate();

  // ローカルで管理するUI状態
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('date_desc');
  const [editingTag, setEditingTag] = useState<{
    current: string;
    newValue: string;
  } | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [highlightedImageIds, setHighlightedImageIds] = useState<string[]>([]);

  useEffect(() => {
    const state = location.state as { recentlyAddedImageIds?: string[] } | undefined;
    if (state?.recentlyAddedImageIds && state.recentlyAddedImageIds.length > 0) {
      setFilterTag('');
      setSelectedImageId(state.recentlyAddedImageIds[0]);
      setHighlightedImageIds(state.recentlyAddedImageIds);
      navigate(location.pathname, { replace: true, state: undefined });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (highlightedImageIds.length === 0) return;
    const timeoutId = window.setTimeout(() => {
      setHighlightedImageIds([]);
    }, 3000);
    return () => window.clearTimeout(timeoutId);
  }, [highlightedImageIds]);

  const processedImages = useMemo(() => {
    let images = [...imageList]; // グローバルなvouchersを使用
    if (filterTag) {
      images = images.filter(image => image.tags.includes(filterTag));
    }
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

  const selectImage = (image: ImageFile) => {
    // 既に選択されているものを再度クリックした場合は選択解除
    setSelectedImageId(prevId => (prevId === image.id ? null : image.id));
  };

  const handleDeleteImage = (imageId: string) => {
    deleteImageFile(imageId); // Contextの関数を呼び出し
    if (selectedImageId === imageId) {
      setSelectedImageId(null);
    }
  };

  // handleAddTagToImage はContextの関数をそのまま使用

  // handleRemoveTagFromImage はContextの関数をそのまま使用

  const handleAddNewManagedTag = () => {
    if (addNewManagedTag(newTagInput)) { // Contextの関数を呼び出し
      setNewTagInput('');
    }
  };

  const handleDeleteManagedTag = (tagToDelete: string) => {
    deleteManagedTag(tagToDelete); // Contextの関数を呼び出し
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
    if (updateManagedTag(current, newValue)) { // Contextの関数を呼び出し
      setEditingTag(null);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">証票管理</h1>
      <div className="flex flex-col md:flex-row md:space-x-6">
        {/* Left Column: List and Filters */}
        <div className="w-full md:w-1/3">
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-3">タグ管理</h2>
            {/* Tag Management Form */}
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
            {/* Tag List */}
            <div className="space-y-2 max-h-[25vh] overflow-y-auto pr-2">
              {managedTags.map(tag => (
                <div key={tag} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
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
                        <button onClick={handleSaveEditManagedTag} className="p-1 text-green-600 hover:text-green-800" aria-label="保存"><Save className="w-4 h-4" /></button>
                        <button onClick={handleCancelEditManagedTag} className="p-1 text-gray-500 hover:text-gray-700" aria-label="キャンセル"><XCircle className="w-4 h-4" /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleStartEditManagedTag(tag)} className="p-1 text-gray-500 hover:text-blue-700" aria-label="編集"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteManagedTag(tag)} className="p-1 text-gray-500 hover:text-red-700" aria-label="削除"><Trash2 className="w-4 h-4" /></button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Main Content */}
        <div className="w-full md:w-2/3">
           {/* Filter and View Controls */}
           <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative col-span-1">
                        <input
                            type="text"
                            placeholder="キーワード検索..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    <select
                        value={filterTag}
                        onChange={e => setFilterTag(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="">すべてのタグ</option>
                        {managedTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                        ))}
                    </select>
                    <select
                        value={sortOrder}
                        onChange={e => setSortOrder(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="date_desc">アップロード日 (新しい順)</option>
                        <option value="date_asc">アップロード日 (古い順)</option>
                        <option value="name_asc">ファイル名 (昇順)</option>
                        <option value="name_desc">ファイル名 (降順)</option>
                    </select>
                </div>
            </div>

            {/* Vouchers List */}
            <div className="space-y-4">
              {processedImages.map(image => {
                const isSelected = selectedImageId === image.id;
                const isHighlighted = highlightedImageIds.includes(image.id);
                const cardClassName = `bg-white rounded-lg shadow-md transition-all duration-300 ease-in-out overflow-hidden ${isSelected ? 'ring-2 ring-orange-500' : isHighlighted ? 'ring-2 ring-green-400' : 'hover:shadow-lg'}`;

                return (
                <div
                  key={image.id}
                  className={cardClassName}
                >
                  <button
                    type="button"
                    onClick={() => selectImage(image)}
                    className="w-full p-4 flex items-center cursor-pointer text-left focus:outline-none"
                  >
                    <div className="relative w-16 h-16 mr-4 flex-shrink-0">
                      <img src={image.url} alt={image.name} className="w-16 h-16 object-cover rounded-md" />
                      {image.fileType === 'pdf' && (
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full shadow p-0.5"><FileText className="w-4 h-4 text-red-500" /></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 truncate">{image.name}</p>
                      <p className="text-sm text-gray-500">{image.createdAt.toLocaleDateString()}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {image.tags.map(tag => (
                          <span key={tag} className="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className={`w-6 h-6 text-gray-400 transition-transform ${isSelected ? 'transform rotate-90' : ''}`} />
                  </button>

                  {/* Expanded View */}
                  {isSelected && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* OCR Text */}
                            <div>
                                <h4 className="text-md font-semibold mb-2">OCR結果</h4>
                                <div className="p-3 border rounded-lg bg-white min-h-[120px] whitespace-pre-wrap text-sm text-gray-700">
                                    {image.ocrText || 'OCRデータがありません。'}
                                </div>
                            </div>
                            {/* Tagging UI */}
                            <div>
                                <h4 className="text-md font-semibold mb-2">タグ付け</h4>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {image.tags.map(tag => (
                                    <div key={tag} className="flex items-center bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
                                      <span>{tag}</span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeTagFromImage(image.id, tag);
                                        }}
                                        className="ml-1 p-0.5 rounded-full hover:bg-gray-300"
                                        aria-label={`${tag} を削除`}
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                  {image.tags.length === 0 && (
                                    <span className="text-xs text-gray-500">タグが未設定です</span>
                                  )}
                                </div>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const newTag = e.currentTarget.newTag.value;
                                        addTagToImage(image.id, newTag);
                                        e.currentTarget.newTag.value = '';
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    <select name="newTag" defaultValue="" className="flex-grow px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                                        <option value="" disabled>タグを選択...</option>
                                        {managedTags.filter(t => !image.tags.includes(t)).map(tag => (
                                            <option key={tag} value={tag}>{tag}</option>
                                        ))}
                                    </select>
                                    <button type="submit" className="px-4 py-1.5 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-900">追加</button>
                                </form>
                                <div className="text-right mt-4">
                                     <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // 親要素へのイベント伝播を停止
                                            handleDeleteImage(image.id)
                                        }}
                                        className="inline-flex items-center text-sm text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        この証票を削除
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                  )}
                </div>
              );
              })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherList;

