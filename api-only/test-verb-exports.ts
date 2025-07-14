console.log('Testing Verb exports...');

try {
  const verb = require('verb');
  console.log('Verb exports:', Object.keys(verb));
  console.log('Default export:', verb.default);
  console.log('Direct exports:', verb);
  
  // Try different import patterns
  if (verb.Verb) {
    console.log('Found Verb in exports');
  } else if (verb.default) {
    console.log('Found default export');
  } else {
    console.log('Checking for other patterns...');
    console.log('verb:', typeof verb);
  }
} catch (error) {
  console.error('Error:', error.message);
}