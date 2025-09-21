const axios = require('axios');

const services = [
  { name: 'Dinosaur Service', url: 'http://localhost:3001/health' },
  { name: 'Analytics Service', url: 'http://localhost:3004/health' }
];

async function checkHealth() {
  console.log('🏥 Checking microservices health...\n');
  
  const results = [];
  
  for (const service of services) {
    try {
      const response = await axios.get(service.url, { timeout: 5000 });
      const health = response.data;
      
      console.log(`✅ ${service.name}: HEALTHY`);
      console.log(`   Status: ${health.status}`);
      console.log(`   Uptime: ${health.uptime || 'N/A'}`);
      console.log(`   Timestamp: ${health.timestamp}`);
      
      if (health.stats) {
        console.log(`   Stats: ${JSON.stringify(health.stats)}`);
      }
      
      results.push({ service: service.name, status: 'healthy', details: health });
      
    } catch (error) {
      console.log(`❌ ${service.name}: UNHEALTHY`);
      console.log(`   Error: ${error.message}`);
      console.log(`   URL: ${service.url}`);
      
      results.push({ service: service.name, status: 'unhealthy', error: error.message });
    }
    
    console.log('');
  }
  
  const healthyCount = results.filter(r => r.status === 'healthy').length;
  const totalCount = results.length;
  
  console.log('='.repeat(50));
  console.log(`📊 Health Check Summary: ${healthyCount}/${totalCount} services healthy`);
  
  if (healthyCount === totalCount) {
    console.log('🎉 All microservices are running perfectly!');
    process.exit(0);
  } else {
    console.log('⚠️  Some services are down. Check the logs above.');
    process.exit(1);
  }
}

checkHealth().catch(error => {
  console.error('❌ Health check failed:', error.message);
  process.exit(1);
});