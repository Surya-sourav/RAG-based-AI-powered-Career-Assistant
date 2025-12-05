import { Pinecone } from '@pinecone-database/pinecone';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const setupPinecone = async () => {
  try {
    const apiKey = process.env.PINECONE_API_KEY;
    
    if (!apiKey) {
      console.error('❌ PINECONE_API_KEY not found in .env file');
      process.exit(1);
    }

    console.log('🔄 Connecting to Pinecone...');
    const pinecone = new Pinecone({ apiKey });

    const indexName = process.env.PINECONE_INDEX_NAME || 'career-assistant';
    
    console.log(`🔍 Checking if index "${indexName}" exists...`);
    
    try {
      // Check if index exists
      const indexes = await pinecone.listIndexes();
      const indexExists = indexes.indexes?.some(idx => idx.name === indexName);
      
      if (indexExists) {
        console.log(`✅ Index "${indexName}" already exists!`);
        console.log('📊 Index details:');
        const indexStats = await pinecone.index(indexName).describeIndexStats();
        console.log(JSON.stringify(indexStats, null, 2));
      } else {
        console.log(`📝 Creating index "${indexName}"...`);
        console.log('⏳ This may take 1-2 minutes...');
        
        await pinecone.createIndex({
          name: indexName,
          dimension: 384, // Using all-MiniLM-L6-v2 embeddings (384 dimensions)
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          }
        });
        
        console.log('✅ Index created successfully!');
        console.log('⏳ Waiting for index to be ready...');
        
        // Wait for index to be ready
        let isReady = false;
        let attempts = 0;
        const maxAttempts = 60; // 2 minutes max
        
        while (!isReady && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          
          try {
            const stats = await pinecone.index(indexName).describeIndexStats();
            isReady = true;
            console.log('✅ Index is ready!');
            console.log('📊 Index stats:', JSON.stringify(stats, null, 2));
          } catch (err) {
            attempts++;
            process.stdout.write('.');
          }
        }
        
        if (!isReady) {
          console.log('\n⚠️  Index created but may still be initializing. Try again in a minute.');
        }
      }
      
      console.log('\n🎉 Pinecone setup complete!');
      console.log(`📌 Index name: ${indexName}`);
      console.log('📌 Dimension: 384 (all-MiniLM-L6-v2)');
      console.log('📌 Metric: cosine');
      
    } catch (error: any) {
      console.error('❌ Error setting up Pinecone:', error.message);
      console.error('Full error:', error);
      process.exit(1);
    }
    
  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
};

setupPinecone();
