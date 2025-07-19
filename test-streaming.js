// Simple test script to verify streaming endpoints
// Run with: node test-streaming.js

const axios = require('axios');

const API_BASE_URL = 'https://yyy-mocha-five.vercel.app';

async function testStreamingEndpoint(episodeId) {
  console.log(`\n=== Testing streaming endpoints for: ${episodeId} ===`);
  
  const testEndpoints = [
    { provider: 'zoro', server: 'vidcloud' },
    { provider: 'zoro', server: 'vidstreaming' },
    { provider: 'zoro', server: 'streamsb' },
    { provider: 'zoro', server: 'streamtape' },
    { provider: 'zoro', server: 'filemoon' },
  ];

  // Test with original episode ID and URL encoded version
  const testIds = [episodeId, encodeURIComponent(episodeId)];
  
  for (const testId of testIds) {
    console.log(`\nTesting with ID: ${testId}`);
    
    for (const endpoint of testEndpoints) {
      try {
        const url = `${API_BASE_URL}/anime/${endpoint.provider}/watch/${testId}?server=${endpoint.server}`;
        console.log(`Testing: ${url}`);
        
        const response = await axios.get(url, { timeout: 10000 });
        const hasValidSources = response.data.sources && Array.isArray(response.data.sources) && response.data.sources.length > 0;
        
        console.log(`✓ ${endpoint.provider}/${endpoint.server}: ${hasValidSources ? 'SUCCESS' : 'NO_SOURCES'}`);
        
        if (hasValidSources) {
          console.log(`  Found ${response.data.sources.length} sources`);
          response.data.sources.forEach((source, index) => {
            console.log(`    ${index + 1}. ${source.quality || 'unknown'}: ${source.url?.substring(0, 80)}...`);
          });
          return; // Exit early if we find working sources
        }
      } catch (error) {
        console.log(`✗ ${endpoint.provider}/${endpoint.server}: ERROR - ${error.response?.status || error.message}`);
      }
    }
  }
  
  // Test alternative providers
  console.log('\nTesting alternative providers...');
  const altProviders = ['gogoanime', '9anime', 'animefox'];
  
  for (const provider of altProviders) {
    for (const testId of testIds) {
      try {
        const url = `${API_BASE_URL}/anime/${provider}/watch/${testId}`;
        console.log(`Testing: ${url}`);
        
        const response = await axios.get(url, { timeout: 10000 });
        const hasValidSources = response.data.sources && Array.isArray(response.data.sources) && response.data.sources.length > 0;
        
        console.log(`✓ ${provider}: ${hasValidSources ? 'SUCCESS' : 'NO_SOURCES'}`);
        
        if (hasValidSources) {
          console.log(`  Found ${response.data.sources.length} sources`);
          response.data.sources.forEach((source, index) => {
            console.log(`    ${index + 1}. ${source.quality || 'unknown'}: ${source.url?.substring(0, 80)}...`);
          });
          return;
        }
      } catch (error) {
        console.log(`✗ ${provider}: ERROR - ${error.response?.status || error.message}`);
      }
    }
  }
}

// Test with the episode ID you provided
async function main() {
  const episodeIds = [
    'lord-of-mysteries-19802$episode$141322',
    'takopis-original-sin-19799$episode$141316',
    'spy-x-family-17977$episode$83128',
    'one-piece-100$episode$1',
    'demon-slayer-kimetsu-no-yaiba-47$episode$1',
  ];
  
  for (const episodeId of episodeIds) {
    await testStreamingEndpoint(episodeId);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
  
  console.log('\n=== Testing Complete ===');
}

main().catch(console.error);