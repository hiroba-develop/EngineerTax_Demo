import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  UploadCloud,
  FileText,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker?worker&url';
import { useVouchers } from '../contexts/VoucherContext'; // useVouchersをインポート
import { useNavigate } from 'react-router-dom'; // useNavigateをインポート

import type { ImageFile } from '../contexts/VoucherContext';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// ImageFileの型定義はVoucherContextと共有するため、ここでは削除またはコメントアウト
// interface ImageFile { ... }

const ImageUpload = () => {
  const { addImageFile } = useVouchers();
  const navigate = useNavigate();

  // 選択中の画像プレビューなど、この画面内でのみ使用するUI状態
  const [selectedImage, setSelectedImage] = useState<{ name: string; url: string; file: File } | null>(null);
  const [ocrResult, setOcrResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset state for new upload
    setSelectedImage(null);
    setOcrResult('');
    setError('');
    
    const processFile = (url: string) => {
        setSelectedImage({ name: file.name, url, file });
    };

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        processFile(reader.result as string);
        event.target.value = '';
      };
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
          processFile(canvas.toDataURL());
        } catch (pdfError) {
          console.error('PDF processing error:', pdfError);
          setError('PDFファイルのプレビュー生成に失敗しました。');
        } finally {
          event.target.value = '';
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError('対応していないファイル形式です。');
      event.target.value = '';
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

    try {
      // ダミーのOCR処理
      await new Promise(resolve => setTimeout(resolve, 1500));
      const dummyText = `これはOCRで抽出されたテキストのサンプルです。\nファイル名: ${selectedImage.name}`;
      setOcrResult(dummyText);

      // Contextに新しい画像ファイルを追加
      const fileType: ImageFile['fileType'] = selectedImage.file.type.includes('pdf') ? 'pdf' : 'image';

      const newImageFile: ImageFile = {
        id: uuidv4(),
        name: selectedImage.name,
        url: selectedImage.url,
        file: selectedImage.file,
        tags: [],
        createdAt: new Date(),
        fileType,
        ocrText: dummyText,
      };
      addImageFile(newImageFile);

      // 成功したらVoucherListページに遷移
      navigate('/vouchers');

    } catch (err) {
      setError('OCR処理中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  }, [selectedImage, addImageFile, navigate]);

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
          />
           {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        {/* Step 2: Preview & OCR Execution */}
        {/* selectedFileが存在する場合のみこのセクションを表示 */}
        {selectedImage && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 border-b pb-3">
              ステップ2: 内容確認と保存
            </h2>
            <div className="p-4 border rounded-lg bg-gray-50 min-h-[300px] flex justify-center items-center mb-6">
              <img
                src={selectedImage.url}
                alt="プレビュー"
                className="max-h-80 w-auto object-contain"
              />
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

            {/* Step 3: OCR Result */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">OCR結果</h3>
              <div className="p-4 border rounded-lg bg-gray-50 min-h-[150px] whitespace-pre-wrap">
                {ocrResult ? (
                  <p className="text-gray-800">{ocrResult}</p>
                ) : (
                  <p className="text-gray-500">
                    {isLoading
                      ? 'テキストを抽出中です...'
                      : 'ここにOCR結果が表示されます'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
