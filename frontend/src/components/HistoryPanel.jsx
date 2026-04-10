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
    <div className={`flex flex-shrink-0 transition-all duration-200 ${isOpen ? 'w-72' : 'w-10'}`}>
      {/* Toggle tab */}
      <button
        onClick={onToggle}
        title={isOpen ? 'Close history' : 'Open history'}
        className="w-10 flex-shrink-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200 border-l border-gray-200 transition-colors text-gray-400 hover:text-gray-600"
      >
        <span className="text-sm font-bold select-none">
          {isOpen ? '›' : '‹'}
        </span>
      </button>

      {/* Panel body */}
      {isOpen && (
        <div className="flex-1 bg-gray-50 border-l border-gray-200 flex flex-col overflow-hidden">
          <div className="px-4 py-3.5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              History
            </h2>
            <span className="text-xs text-gray-400">{history.length}/20</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-xs text-gray-300 text-center py-10">No posts yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {history.map((entry) => {
                  const wc = entry.wordCount ?? countWords(entry.post);
                  const inRange = wc >= 55 && wc <= 70;
                  const firstLine = entry.post.split('\n')[0];
                  const preview =
                    firstLine.length > 50
                      ? firstLine.slice(0, 50) + '…'
                      : firstLine;

                  return (
                    <li
                      key={entry.id}
                      className="px-4 py-3 hover:bg-white transition-colors group"
                    >
                      <p className="text-xs text-gray-700 font-medium leading-snug mb-1.5 truncate">
                        {preview}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                              inRange
                                ? 'bg-green-50 text-green-600'
                                : 'bg-amber-50 text-amber-600'
                            }`}
                          >
                            {wc}w
                          </span>
                          <span className="text-xs text-gray-300">
                            {formatDate(entry.timestamp)} {formatTime(entry.timestamp)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopy(entry.post, entry.id)}
                          className="text-xs font-medium text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          {copiedId === entry.id ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {history.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <button
                onClick={onClear}
                className="w-full text-xs text-gray-300 hover:text-red-400 py-1 transition-colors font-medium"
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
