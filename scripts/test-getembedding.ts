import * as dotenv from 'dotenv';
import { getEmbedding } from '../src/ai/cerebras.js';

dotenv.config();

const quickTest = async () => {
  try {
    console.log('Testing getEmbedding from cerebras.ts...\n');
    
    const text = "software engineer with python experience";
    console.log(`Text: "${text}"`);
    
    const embedding = await getEmbedding(text);
    
    console.log(`\nResult:`);
    console.log(`- Dimension: ${embedding.length}`);
    console.log(`- First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}]`);
    console.log(`- Last 5 values: [${embedding.slice(-5).map(v => v.toFixed(4)).join(', ')}]`);
    
    const magnitude = Math.sqrt(embedding.reduce((s, v) => s + v*v, 0));
    console.log(`- Magnitude: ${magnitude.toFixed(4)}`);
    
    if (embedding.length === 384) {
      console.log('\n✅ Correct dimension (384)');
    } else if (embedding.length === 768) {
      console.log('\n❌ WRONG dimension (768) - still using old hash method!');
    } else {
      console.log(`\n⚠️  Unexpected dimension: ${embedding.length}`);
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
};

quickTest();
