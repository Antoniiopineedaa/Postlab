export default function ArticleInput({
  abstractText,
  journalName,
  specialty,
  setAbstractText,
  setJournalName,
  setSpecialty,
  onGenerate,
  isLoading,
}) {
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      onGenerate();
    }
  };

  return (
    <div className="flex-1 flex flex-col p-5 gap-4 overflow-y-auto">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Abstract / Key Findings <span className="text-blue-400">*</span>
        </label>
        <textarea
          className="w-full h-52 px-3 py-2.5 text-sm text-gray-800 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-300 leading-relaxed"
          placeholder="Paste abstract or key findings here..."
          value={abstractText}
          onChange={(e) => setAbstractText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Journal Name
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 text-sm text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-300"
          placeholder="e.g. JAMA, Circulation, NEJM"
          value={journalName}
          onChange={(e) => setJournalName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Specialty / Topic
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 text-sm text-gray-800 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-300"
          placeholder="e.g. Cardiology, Heart Failure"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
        />
      </div>

      <button
        onClick={onGenerate}
        disabled={isLoading || !abstractText.trim()}
        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
            Generating…
          </span>
        ) : (
          'Generate'
        )}
      </button>

      <p className="text-xs text-gray-300 text-center">Ctrl+Enter to generate</p>
    </div>
  );
}
