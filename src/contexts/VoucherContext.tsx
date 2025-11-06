import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

// 初期データ
const initialImages: ImageFile[] = [
  {
    id: uuidv4(),
    name: 'サンプル領収書.png',
    url: '/sample_receipt.png',
    tags: ['領収書', '2025年'],
    createdAt: new Date('2025-11-01T10:00:00Z'),
    fileType: 'image',
    ocrText: '領収書\n合計: 10,800円\n但し、品代として',
  },
  {
    id: uuidv4(),
    name: 'サンプル名刺.jpg',
    url: '/sample_business_card.jpg',
    tags: ['名刺', '取引先'],
    createdAt: new Date('2025-10-15T14:30:00Z'),
    fileType: 'image',
    ocrText: '株式会社サンプル\n代表取締役 鈴木一郎',
  },
];
const initialTags = ['領収書', '2025年', '名刺', '取引先'];

// 型定義
export interface ImageFile {
  id: string;
  name: string;
  url: string;
  file?: File;
  tags: string[];
  createdAt: Date;
  fileType: 'image' | 'pdf';
  ocrText?: string;
}

interface VoucherContextType {
  imageList: ImageFile[];
  managedTags: string[];
  addImageFile: (file: ImageFile) => void;
  deleteImageFile: (imageId: string) => void;
  addTagToImage: (imageId: string, tag: string) => void;
  removeTagFromImage: (imageId: string, tagToRemove: string) => void;
  addNewManagedTag: (newTag: string) => boolean;
  deleteManagedTag: (tagToDelete: string) => void;
  updateManagedTag: (current: string, newValue: string) => boolean;
}

const VoucherContext = createContext<VoucherContextType | undefined>(undefined);

export const useVouchers = () => {
  const context = useContext(VoucherContext);
  if (!context) {
    throw new Error('useVouchers must be used within a VoucherProvider');
  }
  return context;
};

interface VoucherProviderProps {
  children: ReactNode;
}

export const VoucherProvider: React.FC<VoucherProviderProps> = ({ children }) => {
  const [imageList, setImageList] = useState<ImageFile[]>(initialImages);
  const [managedTags, setManagedTags] = useState<string[]>(initialTags);

  const addImageFile = (file: ImageFile) => {
    setImageList(prev => [file, ...prev]);
  };

  const deleteImageFile = (imageId: string) => {
    setImageList(prev => prev.filter(img => img.id !== imageId));
  };

  const addTagToImage = (imageId: string, tag: string) => {
    if (tag.trim() === '') return;
    setImageList(prev =>
      prev.map(img =>
        img.id === imageId && !img.tags.includes(tag)
          ? { ...img, tags: [...img.tags, tag.trim()] }
          : img,
      ),
    );
  };

  const removeTagFromImage = (imageId: string, tagToRemove: string) => {
    setImageList(prev =>
      prev.map(img =>
        img.id === imageId
          ? { ...img, tags: img.tags.filter(t => t !== tagToRemove) }
          : img,
      ),
    );
  };

  const addNewManagedTag = (newTag: string) => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !managedTags.includes(trimmedTag)) {
      setManagedTags(prev => [...prev, trimmedTag].sort());
      return true;
    }
    return false;
  };

  const deleteManagedTag = (tagToDelete: string) => {
    setManagedTags(prev => prev.filter(t => t !== tagToDelete));
    setImageList(prev =>
      prev.map(img => ({
        ...img,
        tags: img.tags.filter(t => t !== tagToDelete),
      })),
    );
  };

  const updateManagedTag = (current: string, newValue: string) => {
    const newTrimmedValue = newValue.trim();
    if (
      newTrimmedValue &&
      newTrimmedValue !== current &&
      !managedTags.includes(newTrimmedValue)
    ) {
      setManagedTags(prev =>
        prev.map(t => (t === current ? newTrimmedValue : t)).sort(),
      );
      setImageList(prev =>
        prev.map(img => ({
          ...img,
          tags: img.tags.map(t => (t === current ? newTrimmedValue : t)),
        })),
      );
      return true;
    }
    return false;
  };

  const value = {
    imageList,
    managedTags,
    addImageFile,
    deleteImageFile,
    addTagToImage,
    removeTagFromImage,
    addNewManagedTag,
    deleteManagedTag,
    updateManagedTag,
  };

  return <VoucherContext.Provider value={value}>{children}</VoucherContext.Provider>;
};
