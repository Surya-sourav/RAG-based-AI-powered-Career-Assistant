import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { getProperEmbedding } from './embeddings.js';

let cerebras: Cerebras | null = null;
let initialized = false;

// Initialize Cerebras client lazily
const initializeCerebras = () => {
  if (!initialized) {
    if (process.env.CEREBRAS_API_KEY) {
      cerebras = new Cerebras({
        apiKey: process.env.CEREBRAS_API_KEY,
      });
      console.log('✅ Cerebras AI initialized successfully');
    } else {
      console.warn('⚠️  Warning: CEREBRAS_API_KEY not found. AI features will not work.');
    }
    initialized = true;
  }
  return cerebras;
};

// Use proper transformer-based embeddings
export const getEmbedding = async (text: string): Promise<number[]> => {
  return await getProperEmbedding(text);
};

export const generateResponse = async (
  prompt: string,
  context: string[]
): Promise<string> => {
  const client = initializeCerebras();
  
  if (!client) {
    throw new Error('Cerebras API not configured. Please set CEREBRAS_API_KEY in .env');
  }
  
  try {
    const contextText = context.length > 0
      ? `\n\nRelevant information from user's profile:\n${context.join('\n\n')}`
      : '';

    const systemPrompt = `You are a professional career advisor assistant. You help students and professionals with career guidance, resume improvement, skill development, and career planning. 

Use the provided context about the user's profile to give personalized advice. Be encouraging, constructive, and specific in your recommendations.${contextText}`;

    const stream = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b',
      stream: true,
      max_completion_tokens: 2048,
      temperature: 0.7,
      top_p: 1,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const content = (chunk as any).choices[0]?.delta?.content || '';
      fullResponse += content;
    }

    return fullResponse;
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate AI response');
  }
};
