import { useState, useCallback } from 'react';
import {
  UploadCloud,
  FileText,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker?worker&url';
import { useVouchers } from '../contexts/VoucherContext'; // useVouchersをインポート
import { useNavigate } from 'react-router-dom'; // useNavigateをインポート


pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// ImageFileの型定義はVoucherContextと共有するため、ここでは削除またはコメントアウト
// interface ImageFile { ... }

const ImageUpload = () => {
  const { addImageFile } = useVouchers();
  const navigate = useNavigate();

  // 選択中の画像プレビューなど、この画面内でのみ使用するUI状態
  const [selectedImages, setSelectedImages] = useState<{ name: string; url: string; file: File }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Reset state for new upload
    setSelectedImages([]);
    setError('');

    const filePromises = Array.from(files).map(file => {
      return new Promise<{ name: string; url: string; file: File }>((resolve, reject) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({ name: file.name, url: reader.result as string, file });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        } else if (file.type === 'application/pdf') {
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const arrayBuffer = reader.result as ArrayBuffer;
              const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
              const page = await pdf.getPage(1);
              const viewport = page.getViewport({ scale: 1.5 });

              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              if (!context) throw new Error('Failed to get canvas context');
              canvas.height = viewport.height;
              canvas.width = viewport.width;

              const renderTask = page.render({ canvasContext: context, viewport, canvas });
              await renderTask.promise;
              resolve({ name: file.name, url: canvas.toDataURL(), file });
            } catch (pdfError) {
              console.error('PDF processing error:', pdfError);
              reject(new Error('PDFファイルのプレビュー生成に失敗しました。'));
            }
          };
          reader.onerror = reject;
          reader.readAsArrayBuffer(file);
        } else {
          reject(new Error('対応していないファイル形式です。'));
        }
      });
    });
    
    Promise.all(filePromises)
      .then(newImages => {
        setSelectedImages(prev => [...prev, ...newImages]);
      })
      .catch(err => {
        setError(err.message);
      });

    event.target.value = '';
  };

  const handleUploadAndOcr = useCallback(async () => {
    if (selectedImages.length === 0) {
      setError('画像ファイルを選択してください。');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 成功したらVoucherListページに遷移
      navigate('/vouchers');

    } catch (err) {
      setError('OCR処理中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  }, [selectedImages, addImageFile, navigate]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">証票アップロード</h1>

      {/* 2カラムレイアウトを廃止し、単一カラムのステップ形式に変更 */}
      <div className="max-w-3xl mx-auto">
        {/* Step 1: Upload Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-3">
            ステップ1: ファイルをアップロード
          </h2>
          <label
            htmlFor="image-upload"
            className="w-full mb-4 flex flex-col items-center justify-center px-6 py-10 bg-orange-50 text-orange-700 font-semibold rounded-lg cursor-pointer hover:bg-orange-100 border-2 border-dashed border-orange-200"
          >
            <UploadCloud className="w-10 h-10 mb-3" />
            <span className="text-lg">
              画像(PNG, JPG)またはPDFを選択
            </span>
            <p className="text-sm text-gray-500 mt-1">または、ファイルをここにドラッグ＆ドロップ</p>
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="hidden"
            multiple // 複数ファイルの選択を許可
          />
           {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        {/* Step 2: Preview & OCR Execution */}
        {/* selectedFileが存在する場合のみこのセクションを表示 */}
        {selectedImages.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 border-b pb-3">
              ステップ2: 内容確認と保存
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50 min-h-[300px] mb-6">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative aspect-square border rounded-lg overflow-hidden">
                  <img
                    src={image.url}
                    alt={`プレビュー ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                   <p className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center p-1 truncate">
                    {image.name}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleUploadAndOcr}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-75 disabled:bg-gray-400 flex items-center justify-center text-base"
            >
              <FileText className="w-5 h-5 mr-2" />
              {isLoading ? '処理中...' : 'OCRを実行して証票一覧に追加'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
