import * as dotenv from 'dotenv';
import { Pinecone } from '@pinecone-database/pinecone';

dotenv.config();

const clearPinecone = async () => {
  try {
    console.log('🗑️  Clearing Pinecone index...\n');
    
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      console.error('❌ PINECONE_API_KEY not found');
      process.exit(1);
    }

    const pinecone = new Pinecone({ apiKey });
    const indexName = process.env.PINECONE_INDEX_NAME || 'career-assistant';
    const index = pinecone.index(indexName);
    
    console.log(`📊 Checking current stats...`);
    const statsBefore = await index.describeIndexStats();
    console.log(`   Total vectors: ${statsBefore.totalRecordCount}`);
    console.log(`   Dimension: ${statsBefore.dimension}\n`);
    
    if (statsBefore.totalRecordCount === 0) {
      console.log('✅ Index is already empty!');
      return;
    }
    
    console.log(`🗑️  Deleting all vectors...`);
    await index.deleteAll();
    console.log(`   ✅ All vectors deleted\n`);
    
    // Wait a moment for deletion to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`📊 Verifying deletion...`);
    const statsAfter = await index.describeIndexStats();
    console.log(`   Total vectors: ${statsAfter.totalRecordCount}`);
    
    if (statsAfter.totalRecordCount === 0) {
      console.log('\n✅ Index cleared successfully!');
      console.log('\n📝 Next steps:');
      console.log('   1. The backend server will auto-reload');
      console.log('   2. Go to the Documents page in the frontend');
      console.log('   3. Re-upload your resume/documents');
      console.log('   4. The new uploads will use proper 384-dim embeddings');
      console.log('   5. RAG will work with high similarity scores (0.7-0.9)!');
    } else {
      console.log('\n⚠️  Some vectors may still remain. Try again in a moment.');
    }
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

clearPinecone();
