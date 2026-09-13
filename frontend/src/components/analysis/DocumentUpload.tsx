import { useCallback, useRef } from 'react';
import { Upload, File, X, FileText } from 'lucide-react';
import type { UploadedFile } from '../../types';

interface DocumentUploadProps {
  file: UploadedFile | null;
  onFileSelect: (file: UploadedFile | null) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ACCEPTED_EXTENSIONS = '.pdf,.doc,.docx';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileTypeLabel(type: string): string {
  if (type === 'application/pdf') return 'PDF';
  if (type.includes('word') || type.includes('document')) return 'DOCX';
  return 'Document';
}

export default function DocumentUpload({
  file,
  onFileSelect,
  disabled = false,
}: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (selectedFile: File) => {
      if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
        alert('Please upload a PDF, DOC, or DOCX file.');
        return;
      }
      onFileSelect({
        file: selectedFile,
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        status: 'uploaded',
      });
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [disabled, handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
    // Reset input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  };

  if (file) {
    return (
      <div className="border border-border rounded-lg p-4 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-teal" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary truncate max-w-[200px] sm:max-w-xs">
                {file.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-text-muted">
                  {getFileTypeLabel(file.type)}
                </span>
                <span className="text-text-light">·</span>
                <span className="text-[11px] text-text-muted">
                  {formatFileSize(file.size)}
                </span>
                <span className="text-text-light">·</span>
                <span className="text-[11px] text-success font-medium">
                  Uploaded
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onFileSelect(null)}
            className="p-1.5 rounded-md text-text-light hover:text-error hover:bg-error-light transition-colors"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[11px] text-text-muted mt-3 italic">
          Document processing will be available in a later phase. The file has been uploaded for demonstration purposes.
        </p>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-text-primary mb-2">
        Upload Document
      </label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          disabled
            ? 'border-border bg-surface opacity-50 cursor-not-allowed'
            : 'border-border hover:border-teal/50 hover:bg-teal/3'
        }`}
        role="button"
        aria-label="Upload document"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) inputRef.current?.click();
          }
        }}
      >
        <Upload className="w-8 h-8 text-text-light mx-auto mb-3" />
        <p className="text-sm font-medium text-text-primary mb-1">
          Drag and drop your document here
        </p>
        <p className="text-xs text-text-muted mb-3">or click to browse</p>
        <div className="flex items-center justify-center gap-2">
          <File className="w-3.5 h-3.5 text-text-light" />
          <span className="text-[11px] text-text-light">
            PDF, DOC, DOCX — Max 10 MB
          </span>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
