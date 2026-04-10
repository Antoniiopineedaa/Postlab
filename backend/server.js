import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You write LinkedIn posts for Antonio Pineda Guerrero: 4th-year medical student and researcher at Universitat Jaume I (Spain), affiliated with the CARDIO and BIOMyE research groups, presented at SEMERGEN 47 and SMICV 19 congresses. He is building an identity as a clinician-scientist with international ambitions in cardiology and neuroscience.

POST STRUCTURE (follow exactly, in this order):
1. HOOK — One short declarative sentence that reframes a concept or creates clinical tension. Never a question. Max 12 words.
2. GAP — One sentence exposing what current practice or the field still misses. Start with 'But'. Max 12 words.
3. DATA — The key finding with a concrete number + journal named inline as a #Hashtag (e.g. 'published in #Circulation', 'in #JACC'). 1-2 sentences.
4. INTERRUPT — 3 to 5 words alone on their own line. This is the paradox, the reframe, or the clinical pivot. No emoji here.
5. QUESTION + 💡 — One reflective clinical question ending with 💡. Not rhetorical — it should make the reader think about their own practice.
6. HASHTAGS — 3 to 4 hashtags, specific and scientific. No generic ones like #Medicine or #Health.

RULES:
- Total: 55 to 70 words. Count carefully.
- Sentence length: max 12 words each. Prefer 7-9.
- Max 4 emojis total across the entire post.
- Scientific English. CNIC/EHJ register: precise, dense, no filler.
- Never use: 'game-changer', 'revolutionary', 'excited to share', 'proud to announce', 'fascinating'.
- Always name the journal inline as a #Hashtag — never just 'a recent study'.
- The DATA section must contain at least one specific number (%, HR, OR, NNT, n=, p=, etc.).
- No first-person 'I' statements.
- Return ONLY the post. No preamble, no explanation, no quotes around it.`;

app.post('/api/generate', async (req, res) => {
  const { userMessage, refinementInstruction } = req.body;

  if (!userMessage) {
    return res.status(400).json({ error: 'userMessage is required' });
  }

  const fullMessage = refinementInstruction
    ? `${userMessage}\n\n${refinementInstruction}`
    : userMessage;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: fullMessage }],
    });

    const post = message.content[0].text;
    res.json({ post });
  } catch (error) {
    console.error('Anthropic API error:', error.message);
    res.status(500).json({ error: 'Failed to generate post' });
  }
});

// En producción, sirve el frontend compilado
const distPath = join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`PostLab backend running on port ${PORT}`);
});
