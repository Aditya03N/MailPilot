import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('[Gemini AI] Initialized with API Key');
  } catch (err) {
    console.error('[Gemini AI Init Error]', err.message);
  }
} else {
  console.warn('[Gemini AI] Warning: GEMINI_API_KEY is not defined in environment variables.');
}

export const getGeminiModel = (modelName = 'gemini-1.5-flash') => {
  if (!genAI) {
    throw new Error('Gemini API key is not configured.');
  }
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      topK: 40,
    }
  });
};

export default genAI;

