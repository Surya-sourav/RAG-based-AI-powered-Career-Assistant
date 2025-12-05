import * as dotenv from 'dotenv';
import { processDocument } from '../src/ai/documentProcessor.js';
import { initializePinecone, queryVectors } from '../src/ai/pinecone.js';
import { getEmbedding } from '../src/ai/cerebras.js';
import fs from 'fs/promises';
import path from 'path';
import { Pinecone } from '@pinecone-database/pinecone';

dotenv.config();

const testFullFlow = async () => {
  try {
    console.log('🧪 Testing FULL Document Upload & RAG Flow\n');
    
    // Initialize
    await initializePinecone();
    
    // Create a test document
    console.log('1️⃣ Creating test document...');
    const testText = `John Doe Resume
    
Software Engineer with 5 years of experience in Python, JavaScript, and React.

Skills:
- Python (Django, Flask)
- JavaScript (React, Node.js)
- Machine Learning (TensorFlow, scikit-learn)
- Databases (PostgreSQL, MongoDB)

Experience:
Senior Software Engineer at TechCorp (2021-Present)
- Built scalable web applications
- Implemented ML models for recommendation system
- Led team of 4 developers

Education:
BS in Computer Science, MIT (2018)`;

    const testFile = path.join('/tmp', 'test-resume.txt');
    await fs.writeFile(testFile, testText);
    console.log(`   ✅ Created: ${testFile}\n`);
    
    // Manually chunk and embed (simulating document processor)
    console.log('2️⃣ Testing embedding generation...');
    const testChunk = "Software Engineer with Python and Machine Learning experience";
    const embedding = await getEmbedding(testChunk);
    console.log(`   Chunk: "${testChunk}"`);
    console.log(`   Embedding dimension: ${embedding.length}`);
    console.log(`   First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}]`);
    
    if (embedding.length !== 384) {
      console.log(`\n❌ CRITICAL ERROR: Embedding has ${embedding.length} dimensions, expected 384!`);
      console.log('   This means getEmbedding() is NOT using the transformer model!');
      return;
    }
    console.log('   ✅ Correct dimension (384)\n');
    
    // Check Pinecone stats
    console.log('3️⃣ Checking Pinecone before upload...');
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME || 'career-assistant');
    const statsBefore = await index.describeIndexStats();
    console.log(`   Total vectors: ${statsBefore.totalRecordCount}`);
    console.log(`   Index dimension: ${statsBefore.dimension}\n`);
    
    // Simulate storing (we'll manually upsert to test)
    console.log('4️⃣ Storing test vector in Pinecone...');
    const testUserId = 'test-user-123';
    const testVectors = [{
      id: `${testUserId}_test1`,
      values: embedding,
      metadata: {
        userId: testUserId,
        text: testChunk,
        chunkIndex: 0,
      }
    }];
    
    await index.upsert(testVectors);
    console.log('   ✅ Vector stored\n');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify storage
    console.log('5️⃣ Verifying storage...');
    const statsAfter = await index.describeIndexStats();
    console.log(`   Total vectors: ${statsAfter.totalRecordCount}`);
    console.log(`   Index dimension: ${statsAfter.dimension}\n`);
    
    // Query it back
    console.log('6️⃣ Querying with similar text...');
    const queryText = "Tell me about Python and ML skills";
    const queryEmbedding = await getEmbedding(queryText);
    console.log(`   Query: "${queryText}"`);
    console.log(`   Query embedding dimension: ${queryEmbedding.length}`);
    
    const results = await queryVectors(testUserId, queryEmbedding, 5);
    console.log(`   Found ${results.length} matches:\n`);
    
    results.forEach((match, idx) => {
      console.log(`   Match ${idx + 1}:`);
      console.log(`   - Score: ${match.score?.toFixed(4)}`);
      console.log(`   - Text: ${match.metadata?.text}`);
    });
    
    // Analysis
    console.log('\n7️⃣ Analysis:');
    if (results.length > 0 && results[0].score) {
      const topScore = results[0].score;
      if (topScore > 0.6) {
        console.log(`   ✅ EXCELLENT! Score ${topScore.toFixed(4)} > 0.6`);
        console.log('   The RAG system is working perfectly!');
        console.log('\n   Now please re-upload your actual documents through the frontend.');
      } else if (topScore > 0.3) {
        console.log(`   ⚠️  MODERATE: Score ${topScore.toFixed(4)} (0.3-0.6)`);
        console.log('   Better than before but could be improved.');
      } else {
        console.log(`   ❌ STILL TOO LOW: Score ${topScore.toFixed(4)} < 0.3`);
        console.log('   Something is still wrong with embeddings!');
      }
    }
    
    // Cleanup
    console.log('\n8️⃣ Cleaning up test data...');
    await index.deleteMany({ userId: testUserId });
    await fs.unlink(testFile);
    console.log('   ✅ Done!\n');
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  }
};

testFullFlow();
