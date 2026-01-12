import React, { useRef } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ScreenshotUploaderProps {
  onUpload: (dataUrl: string) => void;
  currentScreenshot: string | null;
}

export const ScreenshotUploader: React.FC<ScreenshotUploaderProps> = ({
  onUpload,
  currentScreenshot,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum size is 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onUpload(result);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleClear = () => {
    onUpload('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs text-slate-500 mb-1">App Screenshot</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {currentScreenshot ? (
        <div className="relative group">
          <img
            src={currentScreenshot}
            alt="Uploaded screenshot"
            className="w-full h-40 object-cover rounded-lg border border-slate-700"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md transition-colors"
            >
              Change
            </button>
            <button
              onClick={handleClear}
              className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full h-32 border-2 border-dashed border-slate-700 rounded-lg hover:border-blue-500 transition-colors flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-blue-400 bg-slate-800/50"
        >
          <PhotoIcon className="w-8 h-8" />
          <span className="text-xs font-medium">Upload Screenshot</span>
          <span className="text-[10px] text-slate-500">PNG, JPG up to 10MB</span>
        </button>
      )}

      <p className="text-[10px] text-slate-500">
        This image will appear inside the device mockup
      </p>
    </div>
  );
};
