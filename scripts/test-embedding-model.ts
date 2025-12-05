import * as dotenv from 'dotenv';
import { getProperEmbedding, initializeEmbedding } from '../src/ai/embeddings.js';

dotenv.config();

const testEmbedding = async () => {
  try {
    console.log('🧪 Testing embedding model...\n');
    
    // Initialize
    console.log('1️⃣ Initializing model...');
    await initializeEmbedding();
    console.log('   ✅ Model initialized\n');
    
    // Test 1: Simple text
    console.log('2️⃣ Testing simple text embedding...');
    const text1 = "software engineer with python experience";
    const embedding1 = await getProperEmbedding(text1);
    console.log(`   Text: "${text1}"`);
    console.log(`   Embedding dimension: ${embedding1.length}`);
    console.log(`   First 5 values: [${embedding1.slice(0, 5).map(v => v.toFixed(4)).join(', ')}]`);
    console.log(`   Magnitude: ${Math.sqrt(embedding1.reduce((s, v) => s + v*v, 0)).toFixed(4)}`);
    
    // Test 2: Similar text
    console.log('\n3️⃣ Testing similar text embedding...');
    const text2 = "python developer with programming skills";
    const embedding2 = await getProperEmbedding(text2);
    console.log(`   Text: "${text2}"`);
    console.log(`   Embedding dimension: ${embedding2.length}`);
    
    // Calculate cosine similarity
    console.log('\n4️⃣ Calculating cosine similarity...');
    let dotProduct = 0;
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
    }
    console.log(`   Similarity: ${dotProduct.toFixed(4)}`);
    console.log(`   Expected: >0.6 for similar texts\n`);
    
    // Test 3: Different text
    console.log('5️⃣ Testing different text embedding...');
    const text3 = "cooking recipes and kitchen techniques";
    const embedding3 = await getProperEmbedding(text3);
    console.log(`   Text: "${text3}"`);
    
    let dotProduct2 = 0;
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct2 += embedding1[i] * embedding3[i];
    }
    console.log(`   Similarity with text1: ${dotProduct2.toFixed(4)}`);
    console.log(`   Expected: <0.3 for different topics\n`);
    
    if (dotProduct > 0.6) {
      console.log('✅ Embeddings are working correctly!');
    } else {
      console.log('❌ Embeddings seem broken - similarity too low for similar texts');
      console.log('💡 This means the transformer model is not working properly');
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
};

testEmbedding();
