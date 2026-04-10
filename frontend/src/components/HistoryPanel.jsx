import { useState } from 'react';

function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(isoString) {
  const d = new Date(isoString);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function HistoryPanel({ history, isOpen, onToggle, onClear, countWords }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = async (post, id) => {
    await navigator.clipboard.writeText(post);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`flex flex-shrink-0 transition-all duration-200 ${isOpen ? 'w-64' : 'w-9'}`}>
      {/* Toggle tab */}
      <button
        onClick={onToggle}
        title={isOpen ? 'Close history' : 'Open history'}
        className="w-9 flex-shrink-0 flex items-center justify-center border-l border-slate-800/60 transition-colors text-slate-600 hover:text-slate-400"
        style={{ background: '#0d1117' }}
      >
        <span className="text-base font-light select-none">
          {isOpen ? '›' : '‹'}
        </span>
      </button>

      {/* Panel body */}
      {isOpen && (
        <div className="flex-1 border-l border-slate-800/60 flex flex-col overflow-hidden" style={{ background: '#0d1117' }}>
          <div className="px-4 py-3.5 border-b border-slate-800/60 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">History</h2>
            <span className="text-xs text-slate-700 font-medium">{history.length}/20</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <div className="w-8 h-8 rounded-lg border border-slate-800 flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs text-slate-700">No posts yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-800/60">
                {history.map((entry) => {
                  const wc = entry.wordCount ?? countWords(entry.post);
                  const inRange = wc >= 55 && wc <= 70;
                  const firstLine = entry.post.split('\n')[0];
                  const preview = firstLine.length > 48 ? firstLine.slice(0, 48) + '…' : firstLine;

                  return (
                    <li
                      key={entry.id}
                      className="px-4 py-3 group transition-colors cursor-default"
                      style={{ '--hover-bg': '#161b27' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#161b27')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <p className="text-xs text-slate-300 font-medium leading-snug mb-2 truncate">
                        {preview}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                            inRange
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {wc}w
                          </span>
                          <span className="text-xs text-slate-700">
                            {formatDate(entry.timestamp)} {formatTime(entry.timestamp)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopy(entry.post, entry.id)}
                          className="text-xs font-medium text-slate-600 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          {copiedId === entry.id ? '✓' : 'Copy'}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {history.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-800/60">
              <button
                onClick={onClear}
                className="w-full text-xs text-slate-700 hover:text-red-500 py-1 transition-colors font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
