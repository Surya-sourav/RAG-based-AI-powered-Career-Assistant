import * as dotenv from 'dotenv';
import { Pinecone } from '@pinecone-database/pinecone';
import { getEmbedding } from '../src/ai/cerebras.js';
import { initializePinecone, queryVectors } from '../src/ai/pinecone.js';

dotenv.config();

const debugRAG = async () => {
  try {
    console.log('🔍 Debugging RAG System\n');
    
    // Initialize
    await initializePinecone();
    
    const apiKey = process.env.PINECONE_API_KEY;
    const pinecone = new Pinecone({ apiKey: apiKey! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME || 'career-assistant');
    
    // Check stats
    console.log('1️⃣ Pinecone Stats:');
    const stats = await index.describeIndexStats();
    console.log(`   Total vectors: ${stats.totalRecordCount}`);
    console.log(`   Dimension: ${stats.dimension}\n`);
    
    if (stats.totalRecordCount === 0) {
      console.log('⚠️  No vectors in database! Please upload documents first.\n');
      return;
    }
    
    // Test query
    console.log('2️⃣ Testing Query:');
    const queryText = "Based on my resume, give me advice";
    console.log(`   Query: "${queryText}"`);
    
    const queryEmbedding = await getEmbedding(queryText);
    console.log(`   Query embedding dimension: ${queryEmbedding.length}`);
    console.log(`   Query magnitude: ${Math.sqrt(queryEmbedding.reduce((s,v) => s+v*v, 0)).toFixed(4)}\n`);
    
    // Direct Pinecone query to see raw results
    console.log('3️⃣ Raw Pinecone Query:');
    const rawResult = await index.query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true,
    });
    
    console.log(`   Found ${rawResult.matches?.length || 0} matches:`);
    rawResult.matches?.forEach((match, idx) => {
      console.log(`\n   Match ${idx + 1}:`);
      console.log(`   - ID: ${match.id}`);
      console.log(`   - Score: ${match.score?.toFixed(4)}`);
      console.log(`   - Vector dimension: ${match.values?.length || 'N/A'}`);
      if (match.metadata?.text) {
        const text = match.metadata.text as string;
        console.log(`   - Text preview: ${text.substring(0, 80)}...`);
      }
      if (match.values && match.values.length > 0) {
        const vectorMag = Math.sqrt(match.values.reduce((s: number, v: number) => s + v*v, 0));
        console.log(`   - Vector magnitude: ${vectorMag.toFixed(4)}`);
      }
    });
    
    // Check if it's a normalization issue
    console.log('\n4️⃣ Analysis:');
    if (rawResult.matches && rawResult.matches.length > 0) {
      const topScore = rawResult.matches[0].score || 0;
      if (topScore < 0.5) {
        console.log(`   ⚠️  Low similarity score: ${topScore.toFixed(4)}`);
        console.log('   Possible causes:');
        console.log('   - Vectors not normalized properly');
        console.log('   - Different embedding models used for storage vs query');
        console.log('   - Text preprocessing differences');
      } else {
        console.log(`   ✅ Good similarity score: ${topScore.toFixed(4)}`);
      }
    }
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  }
};

debugRAG();
