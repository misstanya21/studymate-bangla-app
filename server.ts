import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '30mb' }));

// CORS handling for production web requests & iframes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper to sanitize logs and prevent accidental API key leaks in logs
function sanitizeLog(message: any): string {
  if (!message) return '';
  const str = typeof message === 'string' ? message : JSON.stringify(message);
  return str
    .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]')
    .replace(/key=[0-9A-Za-z-_]+/gi, 'key=[REDACTED]');
}

// Helper to get Gemini Client with recommended User-Agent header
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Timeout helper for wrapping promises
function executeWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error('Request timed out');
      err.name = 'TimeoutError';
      reject(err);
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer!);
  });
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Keep track of models that have exhausted their daily per-model quota
const modelQuotaExhaustedUntil: Record<string, number> = {};

function isPerModelQuotaExhausted(error: any): boolean {
  if (!error) return false;
  const msg = (error.message || '').toLowerCase();
  const status = error.status || error.code;

  if (
    msg.includes('quota exceeded for metric') ||
    msg.includes('generaterequestsperdayperprojectpermodel') ||
    msg.includes('please retry in') ||
    (status === 429 && (msg.includes('plan and billing') || msg.includes('quota') || msg.includes('free_tier')))
  ) {
    return true;
  }
  return false;
}

function isTemporaryError(error: any): boolean {
  if (!error) return false;
  const status = error.status || error.code || error.statusCode;
  const msg = (error.message || '').toLowerCase();

  if (
    status === 503 ||
    status === 'UNAVAILABLE' ||
    status === 429 ||
    status === 'RESOURCE_EXHAUSTED' ||
    status === 500
  ) {
    return true;
  }

  if (
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('spikes in demand') ||
    msg.includes('overloaded') ||
    msg.includes('temporarily') ||
    msg.includes('try again later') ||
    msg.includes('timeout') ||
    msg.includes('timed out') ||
    msg.includes('rate limit') ||
    msg.includes('resource exhausted') ||
    msg.includes('quota')
  ) {
    return true;
  }

  return false;
}

function categorizeError(err: any): { code: number; message: string } {
  const status = err?.status || err?.code;
  const msg = (err?.message || '').toLowerCase();

  if (err?.name === 'TimeoutError' || msg.includes('timeout') || msg.includes('timed out')) {
    return {
      code: 408,
      message: 'অনুরোধটির সময়সীমা শেষ হয়ে গেছে (Timeout)। অনুগ্রহ করে আবার চেষ্টা করুন।',
    };
  }

  if (
    status === 503 ||
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('spikes in demand') ||
    msg.includes('overloaded')
  ) {
    return {
      code: 503,
      message: 'এই মুহূর্তে AI সেবায় অনেক বেশি চাপ রয়েছে। অনুগ্রহ করে কয়েক সেকেন্ড পরে আবার চেষ্টা করুন।',
    };
  }

  if (status === 429 || msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('quota')) {
    return {
      code: 429,
      message: 'অনুরোধের দৈনিক সীমা অতিক্রান্ত হয়েছে বা খুব দ্রুত অনুরোধ পাঠানো হয়েছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন।',
    };
  }

  if (
    status === 401 ||
    status === 403 ||
    msg.includes('401') ||
    msg.includes('403') ||
    msg.includes('permission') ||
    msg.includes('api_key') ||
    msg.includes('unauthenticated')
  ) {
    return {
      code: 401,
      message: 'API Key বা অনুমোদনে সমস্যা দেখা দিয়েছে। অনুগ্রহ করে সেটিংস থেকে API Key পরীক্ষা করুন।',
    };
  }

  if (status === 400 || msg.includes('400') || msg.includes('invalid_argument')) {
    return {
      code: 400,
      message: 'অনুরোধের তথ্য বা প্যারামিটার সঠিক নয়। অনুগ্রহ করে আপনার ইনপুট যাচাই করে আবার পাঠান।',
    };
  }

  if (
    msg.includes('enotfound') ||
    msg.includes('econnrefused') ||
    msg.includes('network') ||
    msg.includes('fetch failed')
  ) {
    return {
      code: 502,
      message: 'ইন্টারনেট বা নেটওয়ার্ক সংযোগে সমস্যা হয়েছে। আপনার সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।',
    };
  }

  return {
    code: 500,
    message: 'এই মুহূর্তে AI সেবায় অনেক বেশি চাপ রয়েছে। অনুগ্রহ করে কয়েক সেকেন্ড পরে আবার চেষ্টা করুন।',
  };
}

interface GenerateParams {
  contents: any;
  config?: any;
  timeoutMs?: number;
  label?: string;
}

/**
 * Robust execution with Primary Model (gemini-3.8-flash) + 3 Retries
 * Immediate fallback if per-model daily quota is exhausted (429)
 * and Fallback Models (gemini-3.7-flash, gemini-3.6-flash, gemini-3.1-flash-lite)
 */
async function generateWithRetryAndFallback(params: GenerateParams): Promise<{ text: string; modelUsed: string }> {
  const ai = getGeminiClient();
  if (!ai) {
    const error: any = new Error('Gemini API Key পাওয়া যায়নি।');
    error.status = 401;
    throw error;
  }

  const timeoutMs = params.timeoutMs || 18000;
  const label = params.label || 'Task';

  const PRIMARY_MODEL = 'gemini-3.8-flash';
  const FALLBACK_MODELS = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite'];

  let lastError: any = null;

  // Check if primary model quota is currently in cooldown/exhausted
  const primaryExhaustedUntil = modelQuotaExhaustedUntil[PRIMARY_MODEL] || 0;
  const isPrimaryInCooldown = Date.now() < primaryExhaustedUntil;

  if (isPrimaryInCooldown) {
    console.log(
      `[AI] ${PRIMARY_MODEL} free-tier daily quota exhausted until ${new Date(
        primaryExhaustedUntil
      ).toLocaleTimeString()}. Directly routing to fallback models.`
    );
  } else {
    // 1. Primary Model Attempts (Max 3 tries on 503; immediate fallback on 429 quota exhaustion)
    console.log(`[AI] Primary model attempt: ${PRIMARY_MODEL} for ${label}`);

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`[AI] Retry ${attempt - 1}: ${PRIMARY_MODEL}`);
        }

        const response = await executeWithTimeout(
          ai.models.generateContent({
            model: PRIMARY_MODEL,
            contents: params.contents,
            config: params.config,
          }),
          timeoutMs
        );

        const text = response.text || '';
        if (text.trim()) {
          console.log(`[AI] Success with primary model ${PRIMARY_MODEL} on attempt ${attempt}`);
          return { text, modelUsed: PRIMARY_MODEL };
        }
      } catch (err: any) {
        lastError = err;
        console.log(`[AI] ${PRIMARY_MODEL} attempt ${attempt} failed: ${err.message || err}`);

        // If daily per-model quota is exhausted (429 limit reached), do NOT waste time retrying 3.8
        if (isPerModelQuotaExhausted(err)) {
          modelQuotaExhaustedUntil[PRIMARY_MODEL] = Date.now() + 60 * 60 * 1000; // 1 hour cooldown
          console.log(
            `[AI] ${PRIMARY_MODEL} daily quota limit reached (429). Skipping remaining retries and immediately initiating fallback models...`
          );
          break;
        }

        if (!isTemporaryError(err)) {
          // If not a temporary error (e.g. 400 bad request or 401), fail immediately
          throw err;
        }

        if (attempt === 1) {
          console.log(`[AI] Waiting 1.5s before Retry 1...`);
          await sleep(1500);
        } else if (attempt === 2) {
          console.log(`[AI] Waiting 3.0s before Retry 2...`);
          await sleep(3000);
        }
      }
    }
  }

  // 2. Fallback Models
  console.log(`[AI] Initiating Fallback models for ${label}...`);

  for (const fallbackModel of FALLBACK_MODELS) {
    const fallbackExhaustedUntil = modelQuotaExhaustedUntil[fallbackModel] || 0;
    if (Date.now() < fallbackExhaustedUntil) {
      console.log(`[AI] Skipping ${fallbackModel} (in quota cooldown)`);
      continue;
    }

    console.log(`[AI] Fallback model: ${fallbackModel}`);

    for (let fallbackAttempt = 1; fallbackAttempt <= 2; fallbackAttempt++) {
      try {
        const response = await executeWithTimeout(
          ai.models.generateContent({
            model: fallbackModel,
            contents: params.contents,
            config: params.config,
          }),
          timeoutMs
        );

        const text = response.text || '';
        if (text.trim()) {
          console.log(`[AI] Success with fallback model ${fallbackModel}`);
          return { text, modelUsed: fallbackModel };
        }
      } catch (err: any) {
        lastError = err;
        console.log(`[AI] Fallback ${fallbackModel} attempt ${fallbackAttempt} failed: ${err.message || err}`);

        if (isPerModelQuotaExhausted(err)) {
          modelQuotaExhaustedUntil[fallbackModel] = Date.now() + 60 * 60 * 1000;
          console.log(`[AI] ${fallbackModel} quota reached. Moving to next fallback model immediately...`);
          break;
        }

        if (!isTemporaryError(err)) {
          throw err;
        }

        if (fallbackAttempt === 1) {
          await sleep(1500);
        }
      }
    }
  }

  console.log(`[AI] Final failure: All primary and fallback models exhausted.`);
  throw lastError || new Error('All AI models are currently unavailable.');
}

// Health & Config status check
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    aiReady: hasKey,
    appName: 'StudyMate বাংলা',
    version: '1.1.1',
    primaryModel: 'gemini-3.8-flash',
    fallbackModels: ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite'],
  });
});

// 1. AI Question Answer API
app.post('/api/ask', async (req, res) => {
  try {
    const { question, gradeLevel, subject } = req.body;
    if (!question || typeof question !== 'string' || !question.trim()) {
      res.status(400).json({ error: 'অনুগ্রহ করে আপনার প্রশ্নটি লিখুন।' });
      return;
    }

    const systemInstruction = `You are "StudyMate বাংলা", a polite, highly encouraging, and expert AI tutor designed specifically for school and college students in Bangladesh and West Bengal (Class 1 to 12 & Undergraduate).
Primary Language: Standard, natural, easy-to-understand Bengali (সহজ ও সাবলীল বাংলা).
Tone: Patient, supportive, inspiring, educational.

When answering any question:
1. Provide the direct core answer first (📌 মূল উত্তর).
2. Explain clearly step-by-step (🔍 ধাপে ধাপে বিস্তারিত ব্যাখ্যা).
3. If it is a Mathematical or Physics/Chemistry calculation:
   - State the relevant formula/সূত্র clearly.
   - Show each step of calculation clearly (প্রতিটি ক্যালকুলেশন ধাপ).
   - State the final unit/উত্তর with emphasis.
4. Give a practical real-life example or analogy (💡 বাস্তব উদাহরণ / প্রয়োগ).
5. Add a quick exam tip or key point to remember (📝 মনে রাখার টিপস / পরীক্ষার জন্য গুরুত্বপূর্ণ).
6. When mentioning key English scientific or academic terms, provide the Bengali term followed by the English in parentheses (যেমন: সালোকসংশ্লেষণ (Photosynthesis)).
7. Use neat markdown with bold titles, clean bullet points, and code/math blocks where appropriate.`;

    const userPrompt = `শিক্ষার্থী স্তর: ${gradeLevel || 'সাধারণ শিক্ষার্থী'}
বিষয়: ${subject || 'সাধারণ শিক্ষা'}
প্রশ্ন: ${question.trim()}

দয়া করে প্রশ্নটি সহজ ও স্পষ্ট বাংলায় ধাপে ধাপে সমাধান ও ব্যাখ্যা করে দিন।`;

    const result = await generateWithRetryAndFallback({
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
      label: `Question: "${question.slice(0, 30)}..."`,
    });

    res.json({ answer: result.text, modelUsed: result.modelUsed });
  } catch (error: any) {
    const { code, message } = categorizeError(error);
    res.status(code).json({ error: message, code });
  }
});

// 2. Image Question Solver API
app.post('/api/ask-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', prompt = '' } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: 'অনুগ্রহ করে একটি ছবি নির্বাচন করুন।' });
      return;
    }

    const cleanBase64 = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;

    const systemInstruction = `You are "StudyMate বাংলা", an expert educational vision AI tutor for Bengali students.
Your task:
1. Carefully analyze the uploaded image of a textbook page, handwritten notes, exam question paper, diagram, geometry figure, or math problem.
2. Accurately identify and transcribe the question or problem in Bengali/English.
3. Solve the question completely and comprehensively in easy, pleasant Bengali (সহজ বাংলায় সমাধান).
4. If it's a mathematics or physics problem, show every step of algebraic simplification, arithmetic, and units.
5. If it's a diagram or biology/geography/chemistry scheme, explain what each part represents.
6. Provide helpful exam tips at the end.`;

    const textPrompt = prompt.trim()
      ? `ব্যবহারকারীর অতিরিক্ত নির্দেশনা: ${prompt.trim()}\n\nঅনুগ্রহ করে ছবিতে থাকা প্রশ্নের নির্ভুল সমাধান ও সুন্দর বাংলা ব্যাখ্যা দিন।`
      : 'অনুগ্রহ করে ছবিতে থাকা প্রশ্ন বা সমস্যাটি শনাক্ত করুন এবং সহজ বাংলায় ধাপে ধাপে সঠিক সমাধান ও বিস্তারিত ব্যাখ্যা দিন।';

    const result = await generateWithRetryAndFallback({
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: textPrompt,
          },
        ],
      },
      config: {
        systemInstruction,
        temperature: 0.5,
      },
      label: 'Image Solver',
    });

    res.json({ answer: result.text, modelUsed: result.modelUsed });
  } catch (error: any) {
    const { code, message } = categorizeError(error);
    res.status(code).json({ error: message, code });
  }
});

// 3. Quiz Generator API
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { topic, questionCount = 5, difficulty = 'medium' } = req.body;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      res.status(400).json({ error: 'অনুগ্রহ করে কুইজের বিষয় লিখুন।' });
      return;
    }

    const count = Math.min(Math.max(Number(questionCount) || 5, 3), 20);

    const systemInstruction = `You are a high-quality educational quiz author for Bengali students.
Generate an engaging, multiple-choice quiz (MCQ) on the requested subject in Bengali.
Each question must have:
- Exactly 4 distinct options (A, B, C, D) in Bengali.
- Exactly one correct option index (0 for first option, 1 for second, 2 for third, 3 for fourth).
- A clear, concise educational explanation (ব্যাখ্যা) in Bengali explaining why the correct answer is right.
Ensure factual accuracy, curriculum relevance (Bangladesh NCTB / West Bengal board standards), and appropriate difficulty level (${difficulty}).`;

    const userPrompt = `বিষয়: "${topic.trim()}"
প্রশ্নের সংখ্যা: ${count} টি
কঠিনতার স্তর: ${difficulty === 'hard' ? 'কঠিন (উচ্চ মাধ্যমিক/কলেজ)' : difficulty === 'easy' ? 'সহজ (প্রাথমিক/নিম্ন মাধ্যমিক)' : 'মাঝারি (মাধ্যমিক/SSC)'}

এই বিষয়ের ওপর ${count}টি মানসম্মত বহুনির্বাচনী প্রশ্ন (MCQ) তৈরি করুন।`;

    const result = await generateWithRetryAndFallback({
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quizTitle: {
              type: Type.STRING,
              description: 'কুইজের নাম বা শিরোনাম বাংলায়',
            },
            topic: {
              type: Type.STRING,
              description: 'কুইজের মূল বিষয়',
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING, description: 'প্রশ্নের বিবরণ বাংলায়' },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '৪টি উত্তরের বিকল্প',
                  },
                  correctIndex: {
                    type: Type.INTEGER,
                    description: 'সঠিক উত্তরের ইন্ডেক্স (০ থেকে ৩ পর্যন্ত)',
                  },
                  explanation: {
                    type: Type.STRING,
                    description: 'সঠিক উত্তরের সুন্দর ও সহজ ব্যাখ্যা বাংলায়',
                  },
                },
                required: ['id', 'question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
          required: ['quizTitle', 'topic', 'questions'],
        },
      },
      label: `Quiz: "${topic}"`,
    });

    const parsedData = JSON.parse(result.text.trim());
    res.json(parsedData);
  } catch (error: any) {
    const { code, message } = categorizeError(error);
    res.status(code).json({ error: message, code });
  }
});

// 4. Note Generator API (Both /api/generate-note and /api/summarize-note)
async function handleNoteGeneration(req: express.Request, res: express.Response) {
  try {
    const { text, format = 'standard' } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'অনুগ্রহ করে নোট তৈরির জন্য পাঠ্য বা অধ্যায় প্রদান করুন।' });
      return;
    }

    const systemInstruction = `You are "StudyMate বাংলা", a master study notes creator for Bengali students.
Convert any large chapter text, article, lecture notes, or complex topic into an organized, easy-to-review study summary.
Format requirements in neat Markdown:
# 📑 [অধ্যায়/বিষয়ের শিরোনাম]

## 🌟 সহজ কথায় মূল ধারণা (Brief Overview in simple terms)
[A 2-3 sentence overview]

## 📌 গুরুত্বপূর্ণ বুলেট পয়েন্টসমূহ (Key High-Yield Points)
- [Important point 1]
- [Important point 2]
- [Important point 3]

## 🔑 দরকারি পারিভাষিক শব্দ / সূত্র / সাল ও তথ্য (Key Terms, Formulas or Dates)
- **শব্দ/সূত্র**: অর্থ বা গুরুত্ব

## ❓ সম্ভাব্য পরীক্ষার প্রশ্নাবলী (Expected Exam Questions)
1. সংক্ষিপ্ত প্রশ্ন
2. রচনামূলক বা অনুধাবনমূলক প্রশ্ন

## 💡 মনে রাখার সহজ কৌশল (Mnemonics or Quick Memory Tips)`;

    const userPrompt = `নিচের লেখাটি বিশ্লেষণ করে পরীক্ষার জন্য অতি প্রয়োজনীয় ও গোছানো সংক্ষিপ্ত নোট তৈরি করে দিন:

---
${text.trim().slice(0, 15000)}
---`;

    const result = await generateWithRetryAndFallback({
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
      label: 'Note Generator',
    });

    res.json({ note: result.text, modelUsed: result.modelUsed });
  } catch (error: any) {
    const { code, message } = categorizeError(error);
    res.status(code).json({ error: message, code });
  }
}

app.post('/api/generate-note', handleNoteGeneration);
app.post('/api/summarize-note', handleNoteGeneration);

// Dedicated 404 handler for unknown API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'অনুরোধকৃত API Endpoint পাওয়া যায়নি।' });
});

// Vite middleware or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production' || !process.env.VITE_DEV_SERVER;
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyMate বাংলা server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
