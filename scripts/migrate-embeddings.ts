import * as dotenv from 'dotenv';
import { Pinecone } from '@pinecone-database/pinecone';

dotenv.config();

const migratePineconeIndex = async () => {
  try {
    console.log('🔄 Migrating Pinecone index to 384 dimensions...\n');
    
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      console.error('❌ PINECONE_API_KEY not found');
      process.exit(1);
    }

    const pinecone = new Pinecone({ apiKey });
    const indexName = process.env.PINECONE_INDEX_NAME || 'career-assistant';
    
    // Step 1: Check if old index exists
    console.log(`1️⃣ Checking existing index "${indexName}"...`);
    const indexes = await pinecone.listIndexes();
    const indexExists = indexes.indexes?.some(idx => idx.name === indexName);
    
    if (indexExists) {
      console.log(`   ✅ Found existing index`);
      console.log(`\n2️⃣ Deleting old index (768 dimensions)...`);
      await pinecone.deleteIndex(indexName);
      console.log(`   ✅ Old index deleted`);
      
      // Wait a bit for deletion to complete
      console.log(`   ⏳ Waiting for deletion to complete...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      console.log(`   ⚠️  Index doesn't exist yet`);
    }
    
    // Step 2: Create new index with 384 dimensions
    console.log(`\n3️⃣ Creating new index with 384 dimensions...`);
    await pinecone.createIndex({
      name: indexName,
      dimension: 384, // Changed from 768 to 384
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    });
    console.log(`   ✅ New index created`);
    
    // Step 3: Wait for index to be ready
    console.log(`\n4️⃣ Waiting for index to be ready...`);
    let isReady = false;
    let attempts = 0;
    const maxAttempts = 60;
    
    while (!isReady && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        const index = pinecone.index(indexName);
        const stats = await index.describeIndexStats();
        isReady = true;
        console.log(`   ✅ Index is ready!`);
        console.log(`\n📊 New Index Configuration:`);
        console.log(`   - Name: ${indexName}`);
        console.log(`   - Dimension: ${stats.dimension}`);
        console.log(`   - Metric: cosine`);
        console.log(`   - Total vectors: ${stats.totalRecordCount}`);
      } catch (err) {
        attempts++;
        process.stdout.write('.');
      }
    }
    
    if (!isReady) {
      console.log('\n⚠️  Index created but may still be initializing.');
    }
    
    console.log(`\n✅ Migration complete!`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Restart the backend server`);
    console.log(`   2. Re-upload your documents through the frontend`);
    console.log(`   3. The new embeddings will use proper transformer models`);
    console.log(`   4. RAG will work with much better similarity scores!`);
    
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

migratePineconeIndex();
