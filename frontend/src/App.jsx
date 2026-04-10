import { useState, useEffect, useCallback } from 'react';
import ArticleInput from './components/ArticleInput';
import PostOutput from './components/PostOutput';
import HistoryPanel from './components/HistoryPanel';

const API_URL = import.meta.env.DEV ? 'http://localhost:3001' : '';

export function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const REFINEMENT_INSTRUCTIONS = [
  'Rewrite this post to be under 60 words. Keep all data and structure. Cut filler only.',
  'Rewrite only the first line to be more provocative or counterintuitive. Keep everything else identical.',
  'Translate this post to Spanish maintaining exact structure, register, and all #Hashtags and emojis.',
];

async function streamApi(url, body, onChunk) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = '';
  let buffer = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (raw === '[DONE]') return accumulated;
        try {
          const parsed = JSON.parse(raw);
          if (parsed.error) throw new Error(parsed.error);
          if (parsed.text) { accumulated += parsed.text; onChunk(accumulated); }
        } catch (e) {
          if (e.message && !e.message.startsWith('Unexpected')) throw e;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
  return accumulated;
}

function loadDraft(key, fallback = '') {
  try { return JSON.parse(localStorage.getItem('postlab-draft') || '{}')[key] || fallback; }
  catch { return fallback; }
}

export default function App() {
  const [abstractText, setAbstractText] = useState(() => loadDraft('abstractText'));
  const [journalName, setJournalName]   = useState(() => loadDraft('journalName'));
  const [specialty, setSpecialty]       = useState(() => loadDraft('specialty'));
  const [generatedPost, setGeneratedPost]   = useState('');
  const [comparisonPost, setComparisonPost] = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError]           = useState('');
  const [history, setHistory] = useState(() => {
    try { const s = localStorage.getItem('postlab-history'); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });
  const [historyOpen, setHistoryOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState('input');

  // Autosave draft
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem('postlab-draft', JSON.stringify({ abstractText, journalName, specialty }));
    }, 600);
    return () => clearTimeout(t);
  }, [abstractText, journalName, specialty]);

  useEffect(() => {
    localStorage.setItem('postlab-history', JSON.stringify(history));
  }, [history]);

  const addToHistory = (post) => {
    const entry = { id: Date.now(), post, wordCount: countWords(post), timestamp: new Date().toISOString() };
    setHistory((prev) => [entry, ...prev].slice(0, 20));
  };

  const buildUserMessage = (extra) => {
    const parts = [`Here is the content to turn into a LinkedIn post:\n\n${abstractText.trim()}`];
    if (journalName.trim()) parts.push(`Journal: ${journalName.trim()}`);
    if (specialty.trim()) parts.push(`Specialty/topic: ${specialty.trim()}`);
    if (extra) parts.push(extra);
    return parts.join('\n');
  };

  const handleGenerate = async () => {
    if (!abstractText.trim()) return;
    setIsLoading(true); setError(''); setComparisonPost(''); setMobileTab('output');
    try {
      let post = '';
      await streamApi(`${API_URL}/api/generate`, { userMessage: buildUserMessage() },
        (chunk) => { post = chunk; setGeneratedPost(chunk); });
      addToHistory(post);
    } catch (e) { setError(e.message || 'Generation failed.'); }
    finally { setIsLoading(false); }
  };

  const handleRegenerate = async () => {
    if (!abstractText.trim()) return;
    setIsLoading(true); setError(''); setComparisonPost('');
    try {
      let post = '';
      await streamApi(`${API_URL}/api/generate`,
        { userMessage: buildUserMessage('Generate a different version with a different hook and interrupt. Keep the same data and structure.') },
        (chunk) => { post = chunk; setGeneratedPost(chunk); });
      addToHistory(post);
    } catch (e) { setError(e.message || 'Regeneration failed.'); }
    finally { setIsLoading(false); }
  };

  const handleRefinement = useCallback(async (instruction) => {
    if (!generatedPost.trim()) return;
    setIsLoading(true); setError(''); setComparisonPost('');
    try {
      let post = '';
      await streamApi(`${API_URL}/api/generate`,
        { userMessage: generatedPost, refinementInstruction: instruction },
        (chunk) => { post = chunk; setGeneratedPost(chunk); });
      addToHistory(post);
    } catch (e) { setError(e.message || 'Refinement failed.'); }
    finally { setIsLoading(false); }
  }, [generatedPost]);

  const handleCompare = async () => {
    if (!abstractText.trim()) return;
    setIsComparing(true); setComparisonPost('');
    try {
      await streamApi(`${API_URL}/api/generate`,
        { userMessage: buildUserMessage('Generate an alternative version with a completely different hook and interrupt. Keep the same data and structure.') },
        (chunk) => setComparisonPost(chunk));
    } catch (e) { setError(e.message || 'Comparison failed.'); }
    finally { setIsComparing(false); }
  };

  const handleSelectPost = (post) => {
    setGeneratedPost(post); setComparisonPost(''); addToHistory(post);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (!generatedPost || isLoading) return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '1') { e.preventDefault(); handleRefinement(REFINEMENT_INSTRUCTIONS[0]); }
        if (e.key === '2') { e.preventDefault(); handleRefinement(REFINEMENT_INSTRUCTIONS[1]); }
        if (e.key === '3') { e.preventDefault(); handleRefinement(REFINEMENT_INSTRUCTIONS[2]); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [generatedPost, isLoading, handleRefinement]);

  const sharedOutputProps = {
    post: generatedPost, comparisonPost,
    isLoading, isComparing, error,
    onRegenerate: handleRegenerate,
    onRefinement: handleRefinement,
    onCompare: handleCompare,
    onSelectPost: handleSelectPost,
    countWords,
  };

  const sharedInputProps = {
    abstractText, journalName, specialty,
    setAbstractText, setJournalName, setSpecialty,
    onGenerate: handleGenerate, isLoading,
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#080b14' }}>

      {/* ── DESKTOP ── */}
      <div className="hidden md:flex w-80 flex-shrink-0 flex-col border-r border-slate-800/60" style={{ background: '#0d1117' }}>
        <DesktopHeader />
        <ArticleInput {...sharedInputProps} />
      </div>

      <div className="hidden md:flex flex-1 flex-col overflow-hidden">
        <PostOutput {...sharedOutputProps} />
      </div>

      <div className="hidden md:flex">
        <HistoryPanel history={history} isOpen={historyOpen}
          onToggle={() => setHistoryOpen(o => !o)}
          onClear={() => setHistory([])} countWords={countWords} />
      </div>

      {/* ── MOBILE ── */}
      <div className="flex md:hidden flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-slate-800/60 flex items-center justify-between" style={{ background: '#0d1117' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <h1 className="text-sm font-bold text-white">PostLab</h1>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium border"
            style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
            Antonio Pineda
          </span>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          {mobileTab === 'input'   && <ArticleInput {...sharedInputProps} />}
          {mobileTab === 'output'  && <PostOutput {...sharedOutputProps} />}
          {mobileTab === 'history' && (
            <HistoryPanel history={history} isOpen={true} onToggle={() => {}}
              onClear={() => setHistory([])} countWords={countWords} hideSidebar />
          )}
        </div>

        {/* Bottom tab bar */}
        <div className="flex-shrink-0 border-t border-slate-800/60 grid grid-cols-3" style={{ background: '#0d1117' }}>
          {[
            { id: 'input', label: 'Input', icon: <IconEdit /> },
            { id: 'output', label: 'Output', icon: <IconPost />, dot: !!generatedPost },
            { id: 'history', label: 'History', icon: <IconHistory />, count: history.length },
          ].map(({ id, label, icon, dot, count }) => (
            <button key={id} onClick={() => setMobileTab(id)}
              className={`py-2.5 flex flex-col items-center gap-0.5 relative transition-colors ${mobileTab === id ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'}`}>
              {icon}
              <span className="text-xs font-medium">{label}</span>
              {dot && mobileTab !== id && (
                <span className="absolute top-2 right-[calc(50%-14px)] w-1.5 h-1.5 rounded-full bg-indigo-500" />
              )}
              {count > 0 && mobileTab !== id && (
                <span className="absolute top-1.5 right-[calc(50%-16px)] min-w-[16px] h-4 bg-indigo-500/80 rounded-full text-white text-xs flex items-center justify-center px-1">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DesktopHeader() {
  return (
    <div className="px-5 py-4 border-b border-slate-800/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <h1 className="text-base font-bold text-white tracking-tight">PostLab</h1>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-medium border"
          style={{ background: 'linear-gradient(135deg,rgba(59,130,246,.15),rgba(139,92,246,.15))', borderColor: 'rgba(99,102,241,.3)', color: '#a5b4fc' }}>
          Antonio Pineda
        </span>
      </div>
    </div>
  );
}

function IconEdit() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
}
function IconPost() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
}
function IconHistory() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
