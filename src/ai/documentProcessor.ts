import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs/promises';
import { getEmbedding } from './cerebras.js';
import { upsertVectors } from './pinecone.js';
import { v4 as uuidv4 } from 'uuid';

// Chunk text into smaller pieces
export const chunkText = (text: string, chunkSize: number = 500): string[] => {
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += ' ' + sentence;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

// Parse PDF file
export const parsePDF = async (filePath: string): Promise<string> => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file');
  }
};

// Parse DOCX file
export const parseDOCX = async (filePath: string): Promise<string> => {
  try {
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse DOCX file');
  }
};

// Process and store document
export const processDocument = async (
  userId: string,
  filePath: string,
  fileType: string,
  metadata: Record<string, any> = {}
): Promise<void> => {
  let text: string;

  // Parse document based on type
  if (fileType === 'application/pdf') {
    text = await parsePDF(filePath);
  } else if (
    fileType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileType === 'application/msword'
  ) {
    text = await parseDOCX(filePath);
  } else {
    throw new Error('Unsupported file type');
  }

  // Chunk the text
  const chunks = chunkText(text);
  console.log(`📄 Processing document: ${chunks.length} chunks`);

  // Generate embeddings and prepare vectors
  const vectors = await Promise.all(
    chunks.map(async (chunk, index) => {
      const embedding = await getEmbedding(chunk);
      if (index === 0) {
        console.log(`🔍 First chunk embedding: dim=${embedding.length}, mag=${Math.sqrt(embedding.reduce((s,v) => s+v*v, 0)).toFixed(4)}`);
      }
      return {
        id: `${userId}_${uuidv4()}`,
        values: embedding,
        metadata: {
          userId,
          text: chunk,
          chunkIndex: index,
          ...metadata,
        },
      };
    })
  );

  // Store in Pinecone
  console.log(`💾 Storing ${vectors.length} vectors in Pinecone (dim=${vectors[0]?.values.length})...`);
  await upsertVectors(userId, vectors);
  console.log(`✅ Document processing complete!`);
};
