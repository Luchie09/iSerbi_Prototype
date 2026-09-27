import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Download, FileText, FolderOpen } from 'lucide-react';

export const ScholarDocuments: React.FC = () => {
  const { data, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'renewal' | 'guidance'>('renewal');

  const renewalDocs = data.documents.filter((doc) => doc.category === 'renewal');
  const guidanceDocs = data.documents.filter(
    (doc) => doc.category === 'guideline' || doc.category === 'policy'
  );

  const handleDownload = (fileName: string) => {
    showToast(`Downloading official template "${fileName}"...`, 'info');
    const element = document.createElement('a');
    const file = new Blob([`Official INYDO / PGIN Document: ${fileName}\nAuthorized Download`], {
      type: 'text/plain',
    });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const renderDocumentList = (docs: typeof data.documents) => (
    <div className="space-y-2">
      {docs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-400">
          <FolderOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          No files available.
        </div>
      ) : (
        docs.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <span className="truncate text-sm font-medium text-slate-800">{doc.fileName}</span>
            </div>

            <button
              type="button"
              onClick={() => handleDownload(doc.fileName)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
          </div>
        ))
      )}
    </div>
  );

  const tabs = [
    {
      key: 'renewal',
      label: 'Renewal Forms',
      activeClass: 'bg-white text-slate-900 border-red-200 shadow-[0_8px_18px_rgba(15,23,42,0.06)]',
      idleClass: 'bg-transparent text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50',
      content: renderDocumentList(renewalDocs),
    },
    {
      key: 'guidance',
      label: 'Guidelines and Policies',
      activeClass: 'bg-white text-slate-900 border-red-200 shadow-[0_8px_18px_rgba(15,23,42,0.06)]',
      idleClass: 'bg-transparent text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50',
      content: renderDocumentList(guidanceDocs),
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_6px_18px_rgba(15,23,42,0.03)]">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Official Scholarship & Service Documents
        </h2>
        <p className="mt-1 text-xs text-slate-500 max-w-2xl">
          Download accredited files needed for renewals, service compliance, and institutional guidance.
        </p>
      </div>

      <div className="rounded-[22px] border border-slate-200 bg-white p-3 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
        <div className="mb-3 flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative inline-flex items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  isActive ? tab.activeClass : tab.idleClass
                }`}
              >
                <span className="relative z-10">{tab.label}</span>
                {isActive && (
                  <span className="absolute inset-x-2 bottom-1.5 h-0.5 rounded-full bg-red-600" />
                )}
              </button>
            );
          })}
        </div>

        <div className="rounded-[18px] border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4">
          {tabs.find((tab) => tab.key === activeTab)?.content}
        </div>
      </div>
    </div>
  );
};
