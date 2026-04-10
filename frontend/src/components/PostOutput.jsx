import { useState } from 'react';
import LinkedInPreview from './LinkedInPreview';
import { validatePost, scorePost } from '../utils/validator';

const REFINEMENTS = [
  { label: 'Shorter',       key: '1', instruction: 'Rewrite this post to be under 60 words. Keep all data and structure. Cut filler only.' },
  { label: 'Stronger hook', key: '2', instruction: 'Rewrite only the first line to be more provocative or counterintuitive. Keep everything else identical.' },
  { label: 'En español',    key: '3', instruction: 'Translate this post to Spanish maintaining exact structure, register, and all #Hashtags and emojis.' },
];

function charCount(text) { return [...(text || '')].length; }

function ScoreBadge({ score }) {
  if (score === null) return null;
  const { ring, bg, text, label } =
    score >= 9 ? { ring: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Excellent' } :
    score >= 7 ? { ring: 'border-blue-500/40',    bg: 'bg-blue-500/10',    text: 'text-blue-400',    label: 'Good' } :
    score >= 5 ? { ring: 'border-amber-500/40',   bg: 'bg-amber-500/10',   text: 'text-amber-400',   label: 'Fair' } :
                 { ring: 'border-red-500/40',      bg: 'bg-red-500/10',     text: 'text-red-400',     label: 'Needs work' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${ring} ${bg} ${text}`}>
      <span className="text-sm leading-none font-bold">{score}</span>/10 · {label}
    </span>
  );
}

export default function PostOutput({
  post, comparisonPost, isLoading, isComparing, error,
  onRegenerate, onRefinement, onCompare, onSelectPost, countWords,
}) {
  const [viewMode, setViewMode] = useState('post');
  const [copied, setCopied] = useState(false);
  const [copiedAlt, setCopiedAlt] = useState(false);

  const wordCount = countWords(post);
  const chars = charCount(post);
  const inRange = wordCount >= 55 && wordCount <= 70;
  const charRatio = chars / 3000;
  const charColor = charRatio < 0.8 ? 'text-slate-600' : charRatio < 0.93 ? 'text-amber-400' : 'text-red-400';

  const issues = validatePost(post);
  const score = scorePost(post);
  const showComparison = !!comparisonPost || isComparing;

  const copy = async (text, set) => {
    await navigator.clipboard.writeText(text);
    set(true); setTimeout(() => set(false), 2000);
  };

  const handleExport = () => {
    const safePost = post.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>PostLab Export</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:52px;max-width:640px;margin:0 auto;color:#111}
.brand{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6366f1;margin-bottom:6px}
.meta{font-size:12px;color:#999;margin-bottom:36px}pre{white-space:pre-wrap;font-family:inherit;font-size:15px;line-height:1.75}
.stats{margin-top:32px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#bbb}</style>
</head><body><p class="brand">PostLab</p>
<p class="meta">${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
<pre>${safePost}</pre>
<p class="stats">${wordCount} words &nbsp;·&nbsp; ${chars} characters</p>
</body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 300);
  };

  const darkCard = 'rounded-2xl border border-slate-700/40 flex flex-col overflow-hidden card-glow';
  const darkCardBg = { background: '#0d1117' };
  const btnBase = 'rounded-lg border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-all';

  return (
    <div className="flex-1 flex flex-col p-5 md:p-8 overflow-y-auto min-h-0">
      <div className={`mx-auto w-full flex flex-col gap-4 transition-all ${showComparison ? 'max-w-4xl' : 'max-w-xl'}`}>

        {/* View toggle */}
        {post && !isLoading && (
          <div className="flex self-end bg-slate-800/50 border border-slate-700/40 rounded-lg p-1">
            {['post', 'linkedin'].map((m) => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === m ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                {m === 'post' ? 'Post' : 'LinkedIn'}
              </button>
            ))}
          </div>
        )}

        {/* Cards row */}
        <div className={`flex gap-4 ${showComparison ? 'flex-col lg:flex-row' : 'flex-col'}`}>

          {/* Main card */}
          <div className="flex-1 flex flex-col gap-3">
            {viewMode === 'linkedin' && post && !isLoading ? (
              <LinkedInPreview post={post} />
            ) : (
              <div className={`${darkCard} min-h-64`} style={darkCardBg}>
                {isLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
                    <div className="relative w-10 h-10">
                      <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
                      <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin" />
                    </div>
                    <p className="text-xs text-slate-600 tracking-wide">Generating…</p>
                  </div>
                ) : error ? (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <p className="text-sm text-red-400 text-center">{error}</p>
                  </div>
                ) : post ? (
                  <div className="flex-1 p-6">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-200 leading-relaxed">{post}</pre>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-slate-800 flex items-center justify-center">
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-700">Your post will appear here.</p>
                  </div>
                )}

                {post && !isLoading && (
                  <div className="px-5 py-3 border-t border-slate-800/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${inRange ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                        {wordCount}w {inRange ? '✓' : '(55–70)'}
                      </span>
                      <span className={`text-xs font-medium tabular-nums ${charColor}`}>{chars}/3000</span>
                    </div>
                    <button onClick={() => copy(post, setCopied)}
                      className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-200 transition-colors flex-shrink-0">
                      {copied
                        ? <span className="text-emerald-400">✓ Copied</span>
                        : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Score + validator */}
            {post && !isLoading && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <ScoreBadge score={score} />
                  {issues.length === 0 && (
                    <span className="text-xs text-emerald-600 font-medium">✓ All rules passed</span>
                  )}
                </div>
                {issues.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {issues.map((issue, i) => (
                      <span key={i} className={`text-xs px-2 py-0.5 rounded-full border ${
                        issue.type === 'error'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {issue.type === 'error' ? '✗' : '⚠'} {issue.message}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comparison card */}
          {showComparison && (
            <div className="flex-1 flex flex-col gap-2">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Alternative version</p>
              <div className={`${darkCard} min-h-64`} style={darkCardBg}>
                {isComparing && !comparisonPost ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
                    <div className="relative w-10 h-10">
                      <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
                      <div className="absolute inset-0 rounded-full border-2 border-t-violet-500 animate-spin" />
                    </div>
                    <p className="text-xs text-slate-600 tracking-wide">Generating alternative…</p>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 p-6">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-slate-200 leading-relaxed">{comparisonPost}</pre>
                    </div>
                    <div className="px-5 py-3 border-t border-slate-800/60 flex items-center justify-between">
                      <button onClick={() => copy(comparisonPost, setCopiedAlt)}
                        className="text-xs font-medium text-slate-500 hover:text-slate-200 transition-colors">
                        {copiedAlt ? '✓ Copied' : 'Copy'}
                      </button>
                      <button onClick={() => onSelectPost(comparisonPost)}
                        className="text-xs font-semibold px-3 py-1 rounded-lg text-white transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #7c3aed)' }}>
                        Use this ↑
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {post && !isLoading && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button onClick={onRegenerate}
                className={`flex-1 py-2 text-sm font-medium ${btnBase}`} style={darkCardBg}>
                Regenerate
              </button>
              <button onClick={onCompare} disabled={isComparing}
                className={`flex-1 py-2 text-sm font-medium ${btnBase} disabled:opacity-40`} style={darkCardBg}>
                {isComparing ? 'Comparing…' : 'Compare'}
              </button>
              <button onClick={handleExport} title="Export to PDF"
                className={`py-2 px-3 ${btnBase}`} style={darkCardBg}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>

            <div className="flex gap-2">
              {REFINEMENTS.map(({ label, key, instruction }) => (
                <button key={label} onClick={() => onRefinement(instruction)}
                  className={`flex-1 py-2 text-xs font-medium ${btnBase} flex items-center justify-center gap-1.5`} style={darkCardBg}>
                  {label}
                  <kbd className="hidden sm:inline-block text-slate-700 font-mono">⌃{key}</kbd>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
