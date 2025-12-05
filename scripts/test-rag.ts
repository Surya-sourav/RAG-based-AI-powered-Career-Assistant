import * as dotenv from 'dotenv';
import { getEmbedding } from '../src/ai/cerebras.js';
import { queryVectors, initializePinecone } from '../src/ai/pinecone.js';

dotenv.config();

const testRAG = async () => {
  try {
    console.log('🧪 Testing RAG functionality...\n');
    
    // Initialize Pinecone first
    console.log('⚙️  Initializing Pinecone...');
    await initializePinecone();
    console.log('   ✅ Pinecone initialized\n');
    
    // Use the actual userId from the Pinecone data
    const userId = '6932f3aa45a308abf7011438';
    const query = 'Based on my resume, give me some advice';
    
    console.log(`👤 User ID: ${userId}`);
    console.log(`💬 Query: "${query}"\n`);
    
    // Step 1: Generate embedding for the query
    console.log('1️⃣ Generating embedding for query...');
    const queryEmbedding = await getEmbedding(query);
    console.log(`   ✅ Generated ${queryEmbedding.length}-dimensional embedding\n`);
    
    // Step 2: Query Pinecone for relevant context
    console.log('2️⃣ Querying Pinecone for relevant context...');
    const matches = await queryVectors(userId, queryEmbedding, 5);
    console.log(`   ✅ Found ${matches.length} matches\n`);
    
    // Step 3: Filter by score and extract text
    console.log('3️⃣ Processing matches:\n');
    matches.forEach((match, idx) => {
      console.log(`   Match ${idx + 1}:`);
      console.log(`   - Score: ${match.score}`);
      console.log(`   - ID: ${match.id}`);
      if (match.metadata?.text) {
        const text = match.metadata.text as string;
        console.log(`   - Text: ${text.substring(0, 150)}...`);
      }
      console.log();
    });
    
    const context = matches
      .filter((match) => match.score && match.score > 0.15)
      .map((match) => match.metadata?.text || '')
      .filter((text) => text.length > 0);
    
    console.log(`4️⃣ Filtered context (score > 0.15):`);
    console.log(`   ✅ ${context.length} chunks passed the threshold\n`);
    
    if (context.length === 0) {
      console.log('⚠️  NO CONTEXT WAS RETRIEVED!');
      console.log('🔍 This is the problem - the score threshold (0.15) is too high!');
      console.log('\n💡 The highest score was:', Math.max(...matches.map(m => m.score || 0)));
      console.log('💡 Recommendation: Lower the threshold or improve embedding quality\n');
    } else {
      console.log('✅ Context retrieved successfully!');
      context.forEach((text, idx) => {
        console.log(`\n   Context ${idx + 1}:`);
        console.log(`   ${text.substring(0, 200)}...`);
      });
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
};

testRAG();
