console.log('Testing Verb import...');

try {
  const { Verb } = require('verb');
  console.log('Verb imported successfully:', typeof Verb);
  
  const app = new Verb();
  console.log('Verb instance created successfully');
} catch (error) {
  console.error('Error importing Verb:', error.message);
  console.error('Stack:', error.stack);
}