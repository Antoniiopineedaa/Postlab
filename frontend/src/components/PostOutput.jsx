import { useState } from 'react';

const REFINEMENTS = [
  {
    label: 'Shorter',
    instruction: 'Rewrite this post to be under 60 words. Keep all data and structure. Cut filler only.',
  },
  {
    label: 'Stronger hook',
    instruction: 'Rewrite only the first line to be more provocative or counterintuitive. Keep everything else identical.',
  },
  {
    label: 'En español',
    instruction: 'Translate this post to Spanish maintaining exact structure, register, and all #Hashtags and emojis.',
  },
];

export default function PostOutput({ post, isLoading, error, onRegenerate, onRefinement, countWords }) {
  const [copied, setCopied] = useState(false);

  const wordCount = countWords(post);
  const inRange = wordCount >= 55 && wordCount <= 70;

  const handleCopy = async () => {
    if (!post) return;
    await navigator.clipboard.writeText(post);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto">
      <div className="max-w-xl mx-auto w-full flex flex-col gap-4">

        {/* Post card */}
        <div
          className="card-glow rounded-2xl border border-slate-700/40 flex flex-col min-h-72 overflow-hidden"
          style={{ background: '#0d1117' }}
        >
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
                <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin" />
              </div>
              <p className="text-sm text-slate-500">Generating post…</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          ) : post ? (
            <div className="flex-1 p-6">
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-200 leading-relaxed">
                {post}
              </pre>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-slate-700/60 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-slate-600">Your post will appear here.</p>
            </div>
          )}

          {/* Footer */}
          {post && !isLoading && (
            <div className="px-6 py-3 border-t border-slate-800/60 flex items-center justify-between">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                inRange
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {wordCount} words{inRange ? ' ✓' : ' — target: 55–70'}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-200 transition-colors"
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {post && !isLoading && (
          <div className="flex flex-col gap-2">
            <button
              onClick={onRegenerate}
              className="w-full py-2 px-4 text-sm font-medium rounded-lg border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-500 transition-all"
              style={{ background: '#0d1117' }}
            >
              Regenerate
            </button>

            <div className="flex gap-2">
              {REFINEMENTS.map(({ label, instruction }) => (
                <button
                  key={label}
                  onClick={() => onRefinement(instruction)}
                  className="flex-1 py-2 px-2 text-xs font-medium rounded-lg border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-all"
                  style={{ background: '#0d1117' }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
