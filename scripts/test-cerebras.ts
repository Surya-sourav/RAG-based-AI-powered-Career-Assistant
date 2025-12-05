import * as dotenv from 'dotenv';
import { generateResponse } from '../src/ai/cerebras.js';

// Load environment variables
dotenv.config();

const testCerebras = async () => {
  try {
    console.log('🧪 Testing Cerebras AI integration...\n');
    
    const prompt = "What are the top 3 skills needed for a software engineer in 2024?";
    console.log(`📝 Prompt: ${prompt}\n`);
    
    console.log('⏳ Generating response...\n');
    const response = await generateResponse(prompt, []);
    
    console.log('✅ Response received:\n');
    console.log('─'.repeat(60));
    console.log(response);
    console.log('─'.repeat(60));
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    if (error.message.includes('not configured')) {
      console.log('\n💡 Make sure CEREBRAS_API_KEY is set in your .env file');
    }
    process.exit(1);
  }
};

testCerebras();
