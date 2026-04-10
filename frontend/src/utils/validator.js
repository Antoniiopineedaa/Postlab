export function validatePost(post) {
  if (!post || !post.trim()) return [];
  const issues = [];

  const wordCount = post.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 55) issues.push({ type: 'error', message: `Too short: ${wordCount} words (min 55)` });
  else if (wordCount > 70) issues.push({ type: 'error', message: `Too long: ${wordCount} words (max 70)` });

  if (!/\d/.test(post))
    issues.push({ type: 'error', message: 'Missing specific number (%, HR, OR, p=…)' });

  if (!/#[A-Z][A-Za-z]/.test(post))
    issues.push({ type: 'warning', message: 'No journal #Hashtag found' });

  if (/\bI\b/.test(post))
    issues.push({ type: 'error', message: 'Contains first-person "I"' });

  for (const w of ['game-changer', 'revolutionary', 'excited to share', 'proud to announce', 'fascinating']) {
    if (post.toLowerCase().includes(w))
      issues.push({ type: 'error', message: `Forbidden phrase: "${w}"` });
  }

  const emojiCount = [...post].filter((c) => {
    const cp = c.codePointAt(0);
    return (cp >= 0x1f300 && cp <= 0x1faff) || (cp >= 0x2600 && cp <= 0x27bf);
  }).length;
  if (emojiCount > 4)
    issues.push({ type: 'warning', message: `${emojiCount} emojis (max 4)` });

  const sentences = post.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  const longSentences = sentences.filter((s) => s.trim().split(/\s+/).length > 12).length;
  if (longSentences > 0)
    issues.push({ type: 'warning', message: `${longSentences} sentence(s) over 12 words` });

  return issues;
}

export function scorePost(post) {
  if (!post || !post.trim()) return null;
  const issues = validatePost(post);
  let score = 10;
  for (const { type } of issues) score -= type === 'error' ? 2 : 1;
  return Math.max(1, score);
}
