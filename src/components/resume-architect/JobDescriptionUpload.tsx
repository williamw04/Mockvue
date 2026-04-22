import { useState, useCallback } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';

interface CompanyChat {
  id: string;
  name: string;
  jobDescription?: string;
}

interface JobDescriptionUploadProps {
  chat: CompanyChat;
  onUpload: (text: string) => void;
}

export function JobDescriptionUpload({ chat, onUpload }: JobDescriptionUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = useCallback(async () => {
    try {
      setUploading(true);
      const result = await window.electronAPI?.showOpenDialog({
        filters: [{ name: 'Documents', extensions: ['txt', 'md', 'pdf', 'doc', 'docx'] }],
      });
      
      if (result && result.content) {
        onUpload(result.content);
      } else if (result && result.filePath) {
        onUpload(result.filePath);
      }
    } catch (err) {
      console.error('Failed to read file:', err);
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      try {
        setUploading(true);
        const text = await file.text();
        onUpload(text);
      } catch (err) {
        console.error('Failed to read dropped file:', err);
      } finally {
        setUploading(false);
      }
    }
  }, [onUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  if (chat.jobDescription) {
    return (
      <div className="bg-card border border-rule px-4 py-3">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-[#3d8a4a]" />
          <div className="flex-1">
            <div className="text-sm font-medium text-ink">
              Job description loaded for {chat.name}
            </div>
            <div className="text-xs text-ink-3 mt-0.5">
              {chat.jobDescription.slice(0, 100)}...
            </div>
          </div>
          <button
            onClick={() => onUpload('')}
            className="p-1 text-ink-3 hover:text-ink hover:bg-bg rounded-sm"
            title="Remove"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-card border px-4 py-6 text-center cursor-pointer transition-colors ${
        dragOver ? 'border-accent-hi bg-accent-lo' : 'border-rule hover:bg-bg'
      }`}
      onClick={handleFileSelect}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {uploading ? (
        <div className="text-sm text-ink-2">Loading...</div>
      ) : (
        <>
          <Upload className="w-5 h-5 mx-auto mb-3 text-ink-3" />
          <div className="text-sm font-medium text-ink mb-1">
            Upload Job Description
          </div>
          <div className="text-xs text-ink-3">
            Drop a file here or click to select — enables keyword coverage analysis
          </div>
        </>
      )}
    </div>
  );
}