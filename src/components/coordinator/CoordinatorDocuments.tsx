import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentRecord, DocumentCategory } from '../../types';
import { formatDateOnly } from '../../logic/core';
import {
  FolderOpen,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  FileText,
  X,
  Upload,
} from 'lucide-react';

export const CoordinatorDocuments: React.FC = () => {
  const { data, uploadDocument, replaceDocument, deleteDocument, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [replacingDocId, setReplacingDocId] = useState<string | null>(null);

  // Upload Form
  const [fileName, setFileName] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('renewal');
  const [description, setDescription] = useState('');

  // Replace Form
  const [replaceFileName, setReplaceFileName] = useState('');

  const handleOpenUpload = () => {
    setFileName('');
    setCategory('renewal');
    setDescription('');
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) {
      showToast('Document file name is required.', 'error');
      return;
    }

    uploadDocument({
      fileName: fileName.endsWith('.pdf') || fileName.endsWith('.docx') ? fileName.trim() : `${fileName.trim()}.pdf`,
      category,
      description: description.trim(),
      fileSize: '1.8 MB',
    });

    setIsUploadModalOpen(false);
  };

  const handleReplaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacingDocId || !replaceFileName.trim()) return;

    replaceDocument(
      replacingDocId,
      replaceFileName.endsWith('.pdf') ? replaceFileName.trim() : `${replaceFileName.trim()}.pdf`,
      '2.2 MB'
    );
    setReplacingDocId(null);
    setReplaceFileName('');
  };

  const handleDelete = (docId: string, name: string) => {
    if (confirm(`Remove document "${name}" from repository?`)) {
      deleteDocument(docId);
    }
  };

  const filteredDocs = data.documents.filter((doc) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        doc.fileName.toLowerCase().includes(q) ||
        (doc.description && doc.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Document Management Repository
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Publish official scholarship forms, community service guidelines, and policy circulars. Synchronized in real time with the scholar portal.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenUpload}
          className="px-4 py-2 text-xs font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Document</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search repository files..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {filteredDocs.length} Total Files
        </span>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">File Name & Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Uploaded By</th>
                <th className="py-3 px-4">Date Uploaded</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-start gap-2.5">
                      <FileText className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 block">{doc.fileName}</span>
                        {doc.description && (
                          <span className="text-[11px] text-slate-500 line-clamp-1">
                            {doc.description}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {doc.fileSize || '1.5 MB'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 capitalize font-medium text-slate-700">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">
                      {doc.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{doc.uploadedBy}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 tabular-nums">
                    {formatDateOnly(doc.uploadedAt)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setReplacingDocId(doc.id);
                          setReplaceFileName(`${doc.fileName.replace(/\.[^/.]+$/, '')}_v2.pdf`);
                        }}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"
                        title="Replace revision"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(doc.id, doc.fileName)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded"
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Upload New Document</h3>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Document Filename <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. INYDO_Service_Log_Sheet_2026.pdf"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Document Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                >
                  <option value="renewal">Renewal (Form)</option>
                  <option value="guideline">Guideline (Instruction)</option>
                  <option value="policy">Policy (Ordinance / Legal)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Summary Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the document purpose and audience"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-lg shadow-xs"
                >
                  Upload & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Replace Modal */}
      {replacingDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Replace Document Revision</h3>
              <button
                type="button"
                onClick={() => setReplacingDocId(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReplaceSubmit} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Provide the new filename or revision tag. The download URL will immediately reflect this file for all scholars.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New Revision Filename
                </label>
                <input
                  type="text"
                  required
                  value={replaceFileName}
                  onChange={(e) => setReplaceFileName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReplacingDocId(null)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Replace File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
