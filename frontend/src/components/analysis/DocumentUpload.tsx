import { useCallback } from 'react';
import { X, FileText, AlertCircle, FileArchive } from 'lucide-react';
import type { UploadedFile } from '../../types';

interface DocumentUploadProps {
  file: UploadedFile | null;
  onFileSelect: (file: UploadedFile | null) => void;
  disabled?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentUpload({
  file,
  onFileSelect,
  disabled = false,
}: DocumentUploadProps) {
  const loadDemoDocument = useCallback(() => {
    const demoFile = new window.File(
      ['Sample Municipal LED Streetlight Tender Extract (Demo Document)'],
      'Sample_Municipal_LED_Streetlight_Tender_Extract.pdf',
      { type: 'application/pdf' }
    );
    onFileSelect({
      file: demoFile,
      name: 'Sample_Municipal_LED_Streetlight_Tender_Extract.pdf',
      type: 'application/pdf',
      size: 45200,
      status: 'uploaded',
    });
  }, [onFileSelect]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (disabled) return;
      loadDemoDocument();
    },
    [disabled, loadDemoDocument]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-3">
      {/* Prominent Prototype Limitation Notice */}
      <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold text-amber-950">Prototype limitation: </strong>
          arbitrary uploaded documents are not parsed in this version. Use the procurement text input or the provided demo sample.
        </p>
      </div>

      {file ? (
        <div className="border border-border rounded-xl p-4 bg-card shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-teal" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-text-primary truncate max-w-[200px] sm:max-w-xs font-mono">
                    {file.name}
                  </p>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-100 text-amber-800 border border-amber-200">
                    Demo Sample
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-text-muted">
                    PDF
                  </span>
                  <span className="text-text-light">·</span>
                  <span className="text-[11px] text-text-muted">
                    {formatFileSize(file.size)}
                  </span>
                  <span className="text-text-light">·</span>
                  <span className="text-[11px] text-slate-500">
                    Pre-configured demonstration tender extract
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onFileSelect(null)}
              className="p-1.5 rounded-md text-text-light hover:text-error hover:bg-error-light transition-colors shrink-0 ml-2"
              aria-label="Remove demo file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
            disabled
              ? 'border-border bg-surface opacity-50 cursor-not-allowed'
              : 'border-border hover:border-teal/50 hover:bg-teal/3'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center mx-auto mb-2 text-[#0F766E]">
            <FileArchive className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            Demonstration Tender Document
          </h3>
          <p className="text-xs text-text-muted mb-4 max-w-md mx-auto leading-relaxed">
            Arbitrary PDF/DOCX document text extraction is disabled in this prototype version. Load the standardized municipal lighting tender extract to evaluate requirement parsing and BIS matching.
          </p>
          <button
            type="button"
            onClick={loadDemoDocument}
            disabled={disabled}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs sm:text-sm font-semibold cursor-pointer shadow-xs transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4" />
            <span>Load Demo Tender Document</span>
          </button>
        </div>
      )}
    </div>
  );
}
