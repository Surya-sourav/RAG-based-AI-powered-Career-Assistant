import { Pinecone } from '@pinecone-database/pinecone';

let pinecone: Pinecone | null = null;
let index: ReturnType<Pinecone['index']> | null = null;

export const initializePinecone = async () => {
  try {
    const apiKey = process.env.PINECONE_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️  Warning: PINECONE_API_KEY not found. Vector search will not work.');
      return;
    }

    pinecone = new Pinecone({
      apiKey,
    });
    
    const indexName = process.env.PINECONE_INDEX_NAME || 'career-assistant';
    index = pinecone.index(indexName);
    console.log('✅ Pinecone initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Pinecone:', error);
    console.log('Vector search features will be disabled');
  }
};

export const upsertVectors = async (
  userId: string,
  vectors: { id: string; values: number[]; metadata: Record<string, any> }[]
) => {
  if (!index) {
    throw new Error('Pinecone not initialized');
  }

  try {
    // Add userId to all metadata
    const vectorsWithUserId = vectors.map((v) => ({
      ...v,
      metadata: { ...v.metadata, userId },
    }));

    await index.upsert(vectorsWithUserId);
  } catch (error) {
    console.error('Error upserting vectors:', error);
    throw new Error('Failed to store vectors in Pinecone');
  }
};

export const queryVectors = async (
  userId: string,
  queryVector: number[],
  topK: number = 5
): Promise<any[]> => {
  if (!index) {
    throw new Error('Pinecone not initialized');
  }

  try {
    const queryResponse = await index.query({
      vector: queryVector,
      topK,
      includeMetadata: true,
      filter: { userId: { $eq: userId } },
    });

    return queryResponse.matches || [];
  } catch (error) {
    console.error('Error querying vectors:', error);
    throw new Error('Failed to query vectors from Pinecone');
  }
};

export const deleteUserVectors = async (userId: string) => {
  if (!index) {
    throw new Error('Pinecone not initialized');
  }

  try {
    await index.deleteMany({ userId });
  } catch (error) {
    console.error('Error deleting user vectors:', error);
    throw new Error('Failed to delete user vectors');
  }
};
