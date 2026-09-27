import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HelpCircle, X, Search, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

export const FloatingFAQ: React.FC = () => {
  const { data, currentUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Present on scholar screens (and helpful across the prototype)
  if (!currentUser || currentUser.role !== 'scholar') {
    return null;
  }

  const filteredFaqs = data.faq.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Circular Action Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-[#d92d20] hover:bg-[#b42318] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 group"
          aria-label="Open Frequently Asked Questions"
        >
          <HelpCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span className="text-xs font-semibold pr-0.5"> FAQ</span>
        </button>
      )}

      {/* Floating Panel Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] max-h-[580px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">iSerbi Help Center</h3>
                <p className="text-[11px] text-slate-300">INYDO Guidelines & FAQ</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close FAQ dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search community service rules, FIFO, hours..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          {/* Q&A List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-10 px-4">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-slate-600 font-medium">No answers match your query.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Try searching for "FIFO", "evidence", "hours", or contact INYDO support.
                </p>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isExpanded = expandedId === (faq.id || String(index));
                const itemKey = faq.id || String(index);

                return (
                  <div
                    key={itemKey}
                    className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpand(itemKey)}
                      className="w-full text-left px-4 py-3 flex items-start justify-between gap-3 bg-white hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-xs font-semibold text-slate-900 leading-snug">
                        {faq.question}
                      </span>
                      <span className="text-slate-400 mt-0.5 shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-red-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                        {faq.answer}
                        {faq.category && (
                          <div className="mt-2 text-[10px] text-slate-400 font-medium">
                            Category: <span className="text-slate-600">{faq.category}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Contact Support notice */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
            <span className="text-[11px] text-slate-500">
              Still have questions? Email{' '}
              <a
                href="mailto:support@inydo.ilocosnorte.gov.ph"
                className="text-blue-600 font-medium hover:underline"
              >
                support@inydo.ilocosnorte.gov.ph
              </a>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
