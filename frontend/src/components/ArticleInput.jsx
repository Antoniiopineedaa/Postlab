import { useRef, useState } from 'react';

const API_URL = import.meta.env.DEV ? 'http://localhost:3001' : '';

const inputClass =
  'w-full px-3 py-2.5 text-sm text-slate-100 rounded-lg border border-slate-700/60 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 placeholder-slate-600 transition-all';
const inputStyle = { background: '#161b27' };

export default function ArticleInput({
  abstractText, journalName, specialty,
  setAbstractText, setJournalName, setSpecialty,
  onGenerate, isLoading,
}) {
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const fileInputRef = useRef(null);

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') onGenerate();
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setParseError('Solo se aceptan archivos PDF.');
      return;
    }
    setIsParsing(true);
    setParseError('');
    const formData = new FormData();
    formData.append('pdf', file);
    try {
      const res = await fetch(`${API_URL}/api/parse-pdf`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAbstractText(data.text);
    } catch {
      setParseError('Error al leer el PDF. Pega el texto manualmente.');
    } finally {
      setIsParsing(false);
      e.target.value = '';
    }
  };

  const canGenerate = !isLoading && !isParsing && abstractText.trim();

  return (
    <div className="flex-1 flex flex-col p-5 gap-4 overflow-y-auto min-h-0">

      {/* Abstract */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Abstract / Key Findings <span className="text-indigo-400">*</span>
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsing || isLoading}
            className="flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: '#818cf8' }}
          >
            {isParsing ? (
              <>
                <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin inline-block" />
                Leyendo…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload PDF
              </>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
        </div>

        <textarea
          className={`${inputClass} h-52 resize-none leading-relaxed`}
          style={inputStyle}
          placeholder="Paste abstract or key findings here, or upload a PDF above..."
          value={abstractText}
          onChange={(e) => setAbstractText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {parseError && <p className="text-xs text-red-400">{parseError}</p>}
      </div>

      {/* Journal */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Journal Name
        </label>
        <input
          type="text"
          className={inputClass}
          style={inputStyle}
          placeholder="e.g. JAMA, Circulation, NEJM"
          value={journalName}
          onChange={(e) => setJournalName(e.target.value)}
        />
      </div>

      {/* Specialty */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Specialty / Topic
        </label>
        <input
          type="text"
          className={inputClass}
          style={inputStyle}
          placeholder="e.g. Cardiology, Heart Failure"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
        />
      </div>

      {/* Generate button */}
      <button
        onClick={onGenerate}
        disabled={!canGenerate}
        className="btn-glow w-full py-2.5 px-4 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        style={{
          background: canGenerate
            ? 'linear-gradient(135deg, #3b82f6, #7c3aed)'
            : '#1e293b',
        }}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-white/60 border-t-white rounded-full animate-spin inline-block" />
            Generating…
          </span>
        ) : (
          'Generate'
        )}
      </button>

      <p className="text-xs text-slate-700 text-center">Ctrl+Enter to generate</p>
    </div>
  );
}
