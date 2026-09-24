import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Las claves se leen de forma 100% segura en el servidor
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

function cleanBase64(base64Data: string): { data: string; mimeType: string } {
  const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  if (match) return { mimeType: match[1], data: match[2] };
  return { mimeType: 'image/jpeg', data: base64Data };
}

function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });
}

async function callGroqFallback(
  messages: Array<{ role: string; content: string }>,
  options?: { jsonMode?: boolean; temperature?: number; maxTokens?: number }
): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages,
      temperature: options?.temperature ?? 0.4,
      max_tokens: options?.maxTokens ?? 2048,
      ...(options?.jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    hasGemini: !!process.env.GEMINI_API_KEY,
    hasGroq: !!GROQ_API_KEY,
  });
});

// Endpoint: Generar examen a partir de fotos de apuntes
app.post('/api/exam/generate', async (req, res) => {
  const { images = [], mode = 'both', topicHint = '', questionCount = 5, difficulty = 'medio' } = req.body;
  if (!Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: 'Sube al menos una imagen de tus apuntes.' });
  }

  const systemPrompt = `Eres un tribunal examinador universitario. Analiza minuciosamente las imágenes de estudio y genera un examen estructurado en formato JSON con title, subject, summaryOfMaterial, keyConcepts y questions (orales y escritas con rúbrica).`;

  try {
    const ai = getGeminiClient();
    const parts: any[] = [];
    for (const img of images) {
      const cleaned = cleanBase64(typeof img === 'string' ? img : img.data);
      parts.push({ inlineData: { mimeType: cleaned.mimeType, data: cleaned.data } });
    }
    parts.push({ text: `Analiza las imágenes sobre "${topicHint || 'apuntes'}" y genera el examen JSON con ${questionCount} preguntas.` });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: parts,
      config: { systemInstruction: systemPrompt, responseMimeType: 'application/json', temperature: 0.35 },
    });
    return res.json(JSON.parse(response.text || '{}'));
  } catch (err) {
    console.log('🔄 Gemini agotado o con error, usando respaldo Groq...');
    const groqRaw = await callGroqFallback(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: `Tema: ${topicHint}` }],
      { jsonMode: true }
    );
    return res.json(JSON.parse(groqRaw));
  }
});

// Endpoint: Tutor de Tareas (con visión de imágenes y resolución paso a paso)
app.post('/api/chat/tutor', async (req, res) => {
  const { messages = [] } = req.body;
  const systemPrompt = `Eres StudyAI Homework Tutor. Si el alumno sube una foto de su tarea o libro, transcribe primero el ejercicio detectado y resuélvelo paso a paso justificando cada cálculo y fórmula con rigor pedagógico.`;

  try {
    const ai = getGeminiClient();
    const contents: any[] = [];
    for (const msg of messages) {
      const parts: any[] = [];
      if (msg.image?.data) {
        const cleaned = cleanBase64(msg.image.data);
        parts.push({ inlineData: { mimeType: cleaned.mimeType, data: cleaned.data } });
      }
      parts.push({ text: msg.content || 'Resuelve el problema de la imagen paso a paso.' });
      contents.push({ role: msg.role === 'model' ? 'model' : 'user', parts });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: { systemInstruction: systemPrompt, temperature: 0.4 },
    });
    return res.json({ reply: response.text });
  } catch (err) {
    console.log('🔄 Cambiando a Groq API para responder al estudiante...');
    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.content })),
    ];
    const groqReply = await callGroqFallback(groqMessages);
    return res.json({ reply: groqReply, provider: 'groq-fallback' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`StudyAI activo en http://localhost:${PORT}`));
}
startServer();