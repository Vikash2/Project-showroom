import { useRef, useState } from 'react';
import { Upload, X, Eye, FileText, Download, Trash2 } from 'lucide-react';
import type { Booking, DocumentStatus, DocumentFile } from '../../types/booking';
import { useBookings } from '../../state/BookingContext';

interface DocumentUploadSectionProps {
  booking: Booking;
  readOnly?: boolean; // New prop to control if uploads are allowed
}

const DOCUMENT_LABELS: Record<keyof DocumentStatus, string> = {
  aadharCard: 'Aadhaar Card',
  panCard: 'PAN Card',
  drivingLicense: 'Driving License',
  addressProof: 'Address Proof',
  passportPhotos: 'Passport Photos',
};

export default function DocumentUploadSection({ booking, readOnly = false }: DocumentUploadSectionProps) {
  const { uploadDocument, removeDocument } = useBookings();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [preview, setPreview] = useState<{ label: string; file: DocumentFile } | null>(null);
  const [uploadError, setUploadError] = useState<{ docType: string; message: string } | null>(null);

  const handleFile = (docType: keyof DocumentStatus, file: File) => {
    if (readOnly) return;
    
    // Clear any previous errors
    setUploadError(null);
    
    if (file.size > 10 * 1024 * 1024) {
      setUploadError({ docType, message: 'File size must be less than 10MB' });
      return;
    }
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setUploadError({ docType, message: 'Only JPG, PNG, GIF or PDF files are allowed' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      uploadDocument(booking.id, docType, {
        name: file.name,
        type: file.type,
        data: e.target?.result as string,
        uploadedAt: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = (file: DocumentFile) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Read-only view: just show list of required documents
  if (readOnly) {
    return (
      <div className="space-y-3">
        {(Object.keys(DOCUMENT_LABELS) as (keyof DocumentStatus)[]).map((docType) => {
          const file = booking.documents[docType]?.file;
          const label = DOCUMENT_LABELS[docType];

          return (
            <div key={docType} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)]">
              <div className="flex items-center gap-3">
                <FileText size={18} className={file ? 'text-green-600 dark:text-green-400' : 'text-[var(--text-muted)]'} />
                <span className="text-sm font-semibold text-[var(--text-primary)]">{label}</span>
              </div>
              <div className={`text-xs font-bold px-2.5 py-1 rounded ${
                file 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' 
                  : 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300'
              }`}>
                {file ? '✓ Uploaded' : '⚠ Required'}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Full upload view for sales processing
  return (
    <div className="space-y-4">
      {(Object.keys(DOCUMENT_LABELS) as (keyof DocumentStatus)[]).map((docType) => {
        const file = booking.documents[docType]?.file;
        const label = DOCUMENT_LABELS[docType];

        return (
          <div key={docType} className="border border-[var(--border)] rounded-lg p-4 bg-[var(--bg-secondary)]">
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">{label}</p>

            {file ? (
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-green-500 shrink-0" />
                <span className="text-sm text-[var(--text-primary)] truncate flex-1">{file.name}</span>
                <button
                  onClick={() => setPreview({ label, file })}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded transition"
                  title="Preview"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleDownload(file)}
                  className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded transition"
                  title="Download"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={() => removeDocument(booking.id, docType)}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded transition"
                  title="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    setUploadError(null); // Clear error when clicking upload
                    fileInputRefs.current[docType]?.click();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[var(--border)] rounded-lg text-sm text-[var(--text-muted)] hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition"
                >
                  <Upload size={16} />
                  Upload file
                </button>
                {uploadError && uploadError.docType === docType && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded px-3 py-2">
                    ⚠ {uploadError.message}
                  </div>
                )}
              </>
            )}

            <input
              ref={(el) => { fileInputRefs.current[docType] = el; }}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(docType, f);
                e.target.value = '';
              }}
            />
          </div>
        );
      })}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-[var(--card-bg)] rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <span className="font-bold text-[var(--text-primary)]">{preview.label}</span>
              <button onClick={() => setPreview(null)} className="p-1 hover:bg-[var(--hover-bg)] rounded transition">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-[var(--bg-secondary)] flex items-center justify-center">
              {preview.file.type.startsWith('image/') ? (
                <img src={preview.file.data} alt={preview.file.name} className="max-w-full h-auto rounded" />
              ) : (
                <div className="text-center p-8">
                  <FileText size={48} className="mx-auto text-[var(--text-muted)] mb-3" />
                  <p className="text-[var(--text-primary)] font-medium mb-4">{preview.file.name}</p>
                  <button
                    onClick={() => handleDownload(preview.file)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    <Download size={16} /> Download PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
