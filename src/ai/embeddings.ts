import { pipeline, Pipeline } from '@xenova/transformers';

let embeddingPipeline: Pipeline | null = null;
let isInitializing = false;

// Initialize the embedding model (BGE-small - 384 dimensions, good quality)
const initializeEmbedding = async () => {
  if (embeddingPipeline) return embeddingPipeline;
  
  if (isInitializing) {
    // Wait for initialization to complete
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return embeddingPipeline;
  }
  
  try {
    isInitializing = true;
    console.log('🤖 Initializing embedding model (all-MiniLM-L6-v2)...');
    console.log('   This may take a moment on first run (downloading ~25MB model)...');
    
    embeddingPipeline = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
    
    console.log('✅ Embedding model initialized successfully (384 dimensions)');
    return embeddingPipeline;
  } catch (error) {
    console.error('❌ Failed to initialize embedding model:', error);
    throw error;
  } finally {
    isInitializing = false;
  }
};

// Generate embeddings using transformer model (384 dimensions)
export const getProperEmbedding = async (text: string): Promise<number[]> => {
  try {
    const model = await initializeEmbedding();
    
    if (!model) {
      throw new Error('Embedding model not initialized');
    }
    
    // Generate embeddings
    const output = await model(text, { pooling: 'mean', normalize: true });
    
    // Convert to array (384 dimensions)
    const embedding = Array.from(output.data as Float32Array);
    
    return embedding;
  } catch (error) {
    console.error('Error generating proper embedding:', error);
    throw error;
  }
};

// Export for use in other modules
export { initializeEmbedding };
