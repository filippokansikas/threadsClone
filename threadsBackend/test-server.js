// Simple test to verify server can start
console.log('Testing server startup...');

try {
  require('./index.js');
  console.log('✅ Server started successfully!');
} catch (error) {
  console.error('❌ Server failed to start:', error.message);
  console.error(error.stack);
} 