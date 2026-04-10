import { useState, useEffect } from 'react';
import ArticleInput from './components/ArticleInput';
import PostOutput from './components/PostOutput';
import HistoryPanel from './components/HistoryPanel';

// En desarrollo apunta al backend local; en producción usa la misma URL
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
    const parts = [
      `Here is the content to turn into a LinkedIn post:\n\n${abstractText.trim()}`,
    ];
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
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Left panel — input */}
      <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">PostLab</h1>
          <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full font-medium">
            Estilo: Antonio Pineda
          </span>
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

      {/* Center — output */}
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

      {/* Right — history sidebar */}
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
