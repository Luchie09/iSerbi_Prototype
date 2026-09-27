import React, { useRef, useState } from 'react';
import { Application, Task } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, UploadCloud, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

interface EvidenceModalProps {
  application: Application;
  task: Task;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  application,
  task,
  onClose,
}) => {
  const { submitEvidence, showToast } = useApp();

  const [fileName, setFileName] = useState(application.evidenceFile || '');
  const [notes, setNotes] = useState(application.evidenceNotes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) {
      showToast('Please select an evidence document before submitting.', 'error');
      return;
    }
    if (!notes.trim()) {
      showToast('Please provide duty summary notes detailing your rendered service.', 'error');
      return;
    }

    setIsSubmitting(true);
    submitEvidence(application.id, fileName.trim(), notes.trim());
    setIsSubmitting(false);
    onClose();
  };

  const handleSimulateFileSelect = (name: string) => {
    setFileName(name);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFileName(selectedFile.name);
    }
  };

  const handleClearFile = () => {
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.files = null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {application.status === 'rejected' ? 'Resubmit Service Evidence' : 'Submit Service Evidence'}
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">{task.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Previous Rejection Feedback Warning if applicable */}
        {application.status === 'rejected' && application.rejectionReason && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200 flex items-start gap-2.5 text-xs text-red-900">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold block">Coordinator Revision Request:</span>
              <p className="mt-0.5 text-red-800">{application.rejectionReason}</p>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Credit Hours Summary */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 block">Credit Hours upon Verification</span>
              <span className="font-mono text-sm font-bold text-slate-900">
                {task.creditHours} Hours
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Target Location</span>
              <span className="font-medium text-slate-700 truncate max-w-[180px] block">
                {task.location}
              </span>
            </div>
          </div>

          {/* File Upload Simulation Box */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Signed Attendance Sheet or Certificate <span className="text-red-500">*</span>
            </label>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-red-400 transition-colors bg-slate-50/50">
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
              <p className="font-medium text-slate-700">
                Click or drag & drop attendance document
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                PDF, JPG, or PNG (Max 10MB) 
              </p>

             

              <div className="mt-3 flex flex-col items-center justify-center gap-2 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  id="evidence-upload-input"
                />
                <label
                  htmlFor="evidence-upload-input"
                  className="inline-flex items-center justify-center px-3 py-2 text-[10px] font-semibold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-lg cursor-pointer"
                >
                  Choose file
                </label>
                <span className="text-[10px] text-slate-500"></span>
              </div>
            </div>

            {fileName && (
              <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800 gap-2">
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium truncate">{fileName}</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-900 underline shrink-0"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Shift & Attendance Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Duty Notes & Accomplishment Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Rendered full 8-hour shift. Assisted with coastal sorting and mangrove planting under Site Supervisor Mr. Corpuz."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-slate-400 text-xs"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Submit for Verification</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
