import * as dotenv from 'dotenv';
import { Pinecone } from '@pinecone-database/pinecone';

// Load environment variables
dotenv.config();

const checkPinecone = async () => {
  try {
    console.log('🔍 Checking Pinecone database...\n');
    
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      console.error('❌ PINECONE_API_KEY not found');
      process.exit(1);
    }

    const pinecone = new Pinecone({ apiKey });
    const indexName = process.env.PINECONE_INDEX_NAME || 'career-assistant';
    const index = pinecone.index(indexName);

    console.log(`📊 Fetching stats for index: ${indexName}\n`);
    const stats = await index.describeIndexStats();
    
    console.log('Index Statistics:');
    console.log('─'.repeat(60));
    console.log(`Total vectors: ${stats.totalRecordCount}`);
    console.log(`Dimension: ${stats.dimension}`);
    console.log(`Index fullness: ${stats.indexFullness}`);
    console.log('\nNamespaces:');
    console.log(JSON.stringify(stats.namespaces, null, 2));
    console.log('─'.repeat(60));

    if (stats.totalRecordCount === 0) {
      console.log('\n⚠️  No vectors found in the database!');
      console.log('💡 This means no documents have been uploaded yet.');
      console.log('📝 Please upload a resume or document through the frontend.');
    } else {
      console.log(`\n✅ Found ${stats.totalRecordCount} vectors in the database!`);
      
      // Try to query some sample vectors
      console.log('\n🔍 Fetching sample vectors...\n');
      
      // Create a dummy query vector
      const dummyVector = new Array(768).fill(0.1);
      
      try {
        const queryResult = await index.query({
          vector: dummyVector,
          topK: 3,
          includeMetadata: true,
        });
        
        console.log(`Found ${queryResult.matches?.length || 0} sample vectors:`);
        queryResult.matches?.forEach((match, idx) => {
          console.log(`\n${idx + 1}. Score: ${match.score}`);
          console.log(`   ID: ${match.id}`);
          console.log(`   Metadata:`, JSON.stringify(match.metadata, null, 2));
          if (match.metadata?.text) {
            const text = match.metadata.text as string;
            console.log(`   Text preview: ${text.substring(0, 100)}...`);
          }
        });
      } catch (err: any) {
        console.log('⚠️  Could not query sample vectors:', err.message);
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkPinecone();
