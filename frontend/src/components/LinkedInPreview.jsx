export default function LinkedInPreview({ post }) {
  if (!post) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-md max-w-lg mx-auto">
      {/* Profile header */}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm select-none">
            AP
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm leading-tight">Antonio Pineda Guerrero</p>
            <p className="text-xs text-gray-500 leading-snug">Medical Student & Researcher · Universitat Jaume I</p>
            <p className="text-xs text-gray-400 mt-0.5">Just now · 🌐</p>
          </div>
          <button className="flex-shrink-0 text-xs text-blue-600 font-semibold border border-blue-500 rounded-full px-3 py-1 hover:bg-blue-50 transition-colors">
            + Follow
          </button>
        </div>

        {/* Post text */}
        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
          {post}
        </pre>
      </div>

      {/* Engagement bar */}
      <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span>👍❤️💡</span>
          <span className="hover:underline cursor-pointer">47</span>
        </div>
        <div className="flex gap-3 text-xs text-gray-500">
          <span className="hover:underline cursor-pointer">8 comments</span>
          <span className="hover:underline cursor-pointer">3 reposts</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="border-t border-gray-100 grid grid-cols-4">
        {[
          { icon: '👍', label: 'Like' },
          { icon: '💬', label: 'Comment' },
          { icon: '🔁', label: 'Repost' },
          { icon: '📤', label: 'Send' },
        ].map(({ icon, label }) => (
          <button
            key={label}
            className="py-3 flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:bg-gray-50 font-semibold transition-colors"
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
