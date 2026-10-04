import { QuizData } from '../types';

export class AppError extends Error {
  code?: number;
  constructor(message: string, code?: number) {
    super(message);
    this.code = code;
    this.name = 'AppError';
  }
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 65000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new AppError('অনুরোধটির সময়সীমা শেষ হয়ে গেছে (Timeout)। অনুগ্রহ করে আবার চেষ্টা করুন।', 408);
    }
    throw new AppError(
      'ইন্টারনেট বা সার্ভার সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে কয়েক সেকেন্ড পরে আবার চেষ্টা করুন।',
      502
    );
  } finally {
    clearTimeout(id);
  }
}

async function handleResponseJson(response: Response): Promise<any> {
  let data: any = null;
  try {
    data = await response.json();
  } catch (e) {
    throw new AppError(
      'এই মুহূর্তে AI সেবায় অনেক বেশি চাপ রয়েছে। অনুগ্রহ করে কয়েক সেকেন্ড পরে আবার চেষ্টা করুন।',
      response.status
    );
  }

  if (!response.ok) {
    throw new AppError(
      data.error || 'এই মুহূর্তে AI সেবায় অনেক বেশি চাপ রয়েছে। অনুগ্রহ করে কয়েক সেকেন্ড পরে আবার চেষ্টা করুন।',
      data.code || response.status
    );
  }

  return data;
}

export async function checkServerHealth(): Promise<{
  status: string;
  aiReady: boolean;
  appName: string;
  primaryModel: string;
}> {
  try {
    const res = await fetchWithTimeout('/api/health', { method: 'GET' }, 5000);
    return await res.json();
  } catch (error) {
    return {
      status: 'error',
      aiReady: false,
      appName: 'StudyMate বাংলা',
      primaryModel: 'gemini-3.8-flash',
    };
  }
}

export async function askQuestion(
  question: string,
  options?: { gradeLevel?: string; subject?: string }
): Promise<string> {
  const response = await fetchWithTimeout('/api/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question,
      gradeLevel: options?.gradeLevel,
      subject: options?.subject,
    }),
  });

  const data = await handleResponseJson(response);
  return data.answer;
}

export async function askWithImage(
  imageBase64: string,
  prompt?: string,
  mimeType: string = 'image/jpeg'
): Promise<string> {
  const response = await fetchWithTimeout('/api/ask-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageBase64,
      prompt,
      mimeType,
    }),
  });

  const data = await handleResponseJson(response);
  return data.answer;
}

export async function generateQuiz(
  topic: string,
  questionCount: number = 5,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<QuizData> {
  const response = await fetchWithTimeout('/api/generate-quiz', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic,
      questionCount,
      difficulty,
    }),
  });

  const data = await handleResponseJson(response);
  return data;
}

export async function summarizeNote(
  text: string,
  format: 'standard' | 'bullet' | 'qa' = 'standard'
): Promise<string> {
  const response = await fetchWithTimeout('/api/generate-note', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      format,
    }),
  });

  const data = await handleResponseJson(response);
  return data.note;
}
