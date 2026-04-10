import { useState, useEffect } from 'react';
import ArticleInput from './components/ArticleInput';
import PostOutput from './components/PostOutput';
import HistoryPanel from './components/HistoryPanel';

const API_URL = import.meta.env.DEV ? 'http://localhost:3001' : '';

export function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function App() {
  const [abstractText, setAbstractText] = useState('');
  const [journalName, setJournalName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('postlab-history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [historyOpen, setHistoryOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem('postlab-history', JSON.stringify(history));
  }, [history]);

  const addToHistory = (post) => {
    const entry = {
      id: Date.now(),
      post,
      wordCount: countWords(post),
      timestamp: new Date().toISOString(),
    };
    setHistory((prev) => [entry, ...prev].slice(0, 20));
  };

  const callApi = async (userMessage, refinementInstruction) => {
    const res = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage, refinementInstruction }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.post;
  };

  const buildUserMessage = (extraInstruction) => {
    const parts = [`Here is the content to turn into a LinkedIn post:\n\n${abstractText.trim()}`];
    if (journalName.trim()) parts.push(`Journal: ${journalName.trim()}`);
    if (specialty.trim()) parts.push(`Specialty/topic: ${specialty.trim()}`);
    if (extraInstruction) parts.push(extraInstruction);
    return parts.join('\n');
  };

  const handleGenerate = async () => {
    if (!abstractText.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const post = await callApi(buildUserMessage());
      setGeneratedPost(post);
      addToHistory(post);
    } catch (e) {
      setError(e.message || 'Generation failed. Check backend and API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!abstractText.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const post = await callApi(
        buildUserMessage(
          'Generate a different version with a different hook and interrupt. Keep the same data and structure.'
        )
      );
      setGeneratedPost(post);
      addToHistory(post);
    } catch (e) {
      setError(e.message || 'Regeneration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefinement = async (instruction) => {
    if (!generatedPost.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const post = await callApi(generatedPost, instruction);
      setGeneratedPost(post);
      addToHistory(post);
    } catch (e) {
      setError(e.message || 'Refinement failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#080b14' }}>
      {/* Left panel */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r border-slate-800/60" style={{ background: '#0d1117' }}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <h1 className="text-base font-bold text-white tracking-tight">PostLab</h1>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium border"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
                borderColor: 'rgba(99,102,241,0.3)',
                color: '#a5b4fc',
              }}>
              Antonio Pineda
            </span>
          </div>
        </div>

        <ArticleInput
          abstractText={abstractText}
          journalName={journalName}
          specialty={specialty}
          setAbstractText={setAbstractText}
          setJournalName={setJournalName}
          setSpecialty={setSpecialty}
          onGenerate={handleGenerate}
          isLoading={isLoading}
        />
      </div>

      {/* Center */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <PostOutput
          post={generatedPost}
          isLoading={isLoading}
          error={error}
          onRegenerate={handleRegenerate}
          onRefinement={handleRefinement}
          countWords={countWords}
        />
      </div>

      {/* Right — history */}
      <HistoryPanel
        history={history}
        isOpen={historyOpen}
        onToggle={() => setHistoryOpen((o) => !o)}
        onClear={() => setHistory([])}
        countWords={countWords}
      />
    </div>
  );
}
