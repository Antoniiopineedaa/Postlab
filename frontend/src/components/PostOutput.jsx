import { useState } from 'react';

const REFINEMENTS = [
  {
    label: 'Shorter',
    instruction:
      'Rewrite this post to be under 60 words. Keep all data and structure. Cut filler only.',
  },
  {
    label: 'Stronger hook',
    instruction:
      'Rewrite only the first line to be more provocative or counterintuitive. Keep everything else identical.',
  },
  {
    label: 'En español',
    instruction:
      'Translate this post to Spanish maintaining exact structure, register, and all #Hashtags and emojis.',
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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-72">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="flex items-center gap-3 text-gray-400">
                <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Generating post…</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <p className="text-sm text-red-500 text-center">{error}</p>
            </div>
          ) : post ? (
            <div className="flex-1 p-6">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                {post}
              </pre>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <p className="text-sm text-gray-300">
                Your generated post will appear here.
              </p>
            </div>
          )}

          {/* Card footer */}
          {post && !isLoading && (
            <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  inRange
                    ? 'bg-green-50 text-green-700'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                {wordCount} words{inRange ? ' ✓' : ' — target: 55–70'}
              </span>
              <button
                onClick={handleCopy}
                className="text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>

        {/* Action buttons — only visible when there's a post */}
        {post && !isLoading && (
          <div className="flex flex-col gap-2">
            <button
              onClick={onRegenerate}
              className="w-full py-2 px-4 text-sm font-medium bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg transition-colors text-gray-700"
            >
              Regenerate
            </button>

            <div className="flex gap-2">
              {REFINEMENTS.map(({ label, instruction }) => (
                <button
                  key={label}
                  onClick={() => onRefinement(instruction)}
                  className="flex-1 py-2 px-2 text-xs font-medium bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg transition-colors text-gray-600"
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
