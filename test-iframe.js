// Test script to check for embedded player URLs in API responses
const axios = require('axios');

const API_BASE_URL = 'https://yyy-mocha-five.vercel.app';

async function testEmbedUrls(episodeId) {
  console.log(`\n=== Testing embed URLs for: ${episodeId} ===`);
  
  const servers = ['vidcloud', 'vidstreaming', 'streamsb'];
  
  for (const server of servers) {
    try {
      const url = `${API_BASE_URL}/anime/zoro/watch/${encodeURIComponent(episodeId)}?server=${server}`;
      console.log(`Testing: ${url}`);
      
      const response = await axios.get(url, { timeout: 10000 });
      const data = response.data;
      
      console.log(`✓ ${server} response:`, JSON.stringify(data, null, 2));
      
      // Check for potential embed URLs in the response
      if (data.headers?.Referer) {
        console.log(`  📺 Potential embed URL: ${data.headers.Referer}`);
        
        // Test if this URL can be embedded
        try {
          const embedResponse = await axios.get(data.headers.Referer, { 
            timeout: 5000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          console.log(`  ✅ Embed URL is accessible (status: ${embedResponse.status})`);
        } catch (embedError) {
          console.log(`  ❌ Embed URL failed: ${embedError.message}`);
        }
      }
      
      if (data.sources && data.sources.length > 0) {
        console.log(`  📺 Found ${data.sources.length} direct sources`);
      } else {
        console.log(`  ❌ No direct sources found`);
      }
      
    } catch (error) {
      console.log(`✗ ${server}: ERROR - ${error.response?.status || error.message}`);
    }
  }
}

async function main() {
  const episodeIds = [
    'lord-of-mysteries-19802$episode$141322',
    'spy-x-family-17977$episode$83128',
  ];
  
  for (const episodeId of episodeIds) {
    await testEmbedUrls(episodeId);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

main().catch(console.error);