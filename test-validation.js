// Test file to demonstrate the validation and error handling system
// Run this in the browser console after loading the page

console.log('🧪 Testing TV Show Guide Validation System\n');

// Test 1: Valid show validation
console.log('Test 1: Validating a valid show...');
const validShow = {
  t: 'Test Show',
  c: 'hulu',
  net: 'ABC',
  s: 1,
  start: '2025-01-01',
  end: '2025-05-01',
  eps: 20,
  air: 'Monday',
  ret: true
};

const validResult = ShowValidation.validators.validateShow(validShow);
console.log('Result:', validResult.isValid ? '✅ Valid' : '❌ Invalid');
if (!validResult.isValid) {
  console.log('Errors:', validResult.errors.map(e => e.message));
}

// Test 2: Invalid show validation
console.log('\nTest 2: Validating an invalid show...');
const invalidShow = {
  t: '', // Empty title
  c: 'invalid-platform', // Invalid platform
  net: 'INVALID', // Invalid network
  s: -1, // Invalid season
  start: '2025-13-01', // Invalid date
  eps: 200, // Too many episodes
  air: 'Funday', // Invalid day
  ret: 'yes' // Invalid boolean
};

const invalidResult = ShowValidation.validators.validateShow(invalidShow);
console.log('Result:', invalidResult.isValid ? '✅ Valid' : '❌ Invalid');
if (!invalidResult.isValid) {
  console.log('Errors:');
  invalidResult.errors.forEach(err => {
    console.log(`  - ${err.field}: ${err.message}`);
  });
}

// Test 3: Date validation
console.log('\nTest 3: Testing date validation...');
const dateTests = [
  '2025-01-01', // Valid
  '2025-13-01', // Invalid month
  '2025-01-32', // Invalid day
  'not-a-date', // Invalid format
  '1800-01-01', // Too old
  '2200-01-01'  // Too far in future
];

dateTests.forEach(date => {
  const result = ShowValidation.validators.validateDate(date);
  console.log(`  ${date}: ${result.isValid ? '✅' : '❌'}`);
  if (!result.isValid) {
    console.log(`    Error: ${result.errors[0].message}`);
  }
});

// Test 4: Safe operations
console.log('\nTest 4: Testing safe operations...');

// Test safe JSON parsing
const goodJson = '{"test": "valid"}';
const badJson = '{invalid json}';

console.log('Good JSON:', ShowValidation.safeOperations.safeJsonParse(goodJson).success ? '✅' : '❌');
console.log('Bad JSON:', ShowValidation.safeOperations.safeJsonParse(badJson).success ? '✅' : '❌');

// Test 5: Error notifications
console.log('\nTest 5: Testing error notifications...');
console.log('Creating test error notification...');

// Create a test error
const testError = new ShowValidation.ShowValidationError(
  'This is a test validation error for demonstration',
  'testField',
  ShowValidation.ERROR_CODES.VALIDATION.INVALID_TYPE,
  'test value'
);

// Handle it with the error handler
if (typeof errorHandler !== 'undefined') {
  errorHandler.handleError(testError, true, 'Testing system');
  console.log('✅ Test error notification should appear in top-right corner');
} else {
  console.log('❌ Error handler not available');
}

// Test 6: Show localStorage safety
console.log('\nTest 6: Testing safe localStorage operations...');
const testKey = 'validation-test';
const testData = JSON.stringify({test: 'data'});

const saveResult = ShowValidation.safeOperations.safeLocalStorage.setItem(testKey, testData, errorHandler);
const loadResult = ShowValidation.safeOperations.safeLocalStorage.getItem(testKey, errorHandler);
const deleteResult = ShowValidation.safeOperations.safeLocalStorage.removeItem(testKey, errorHandler);

console.log('Save:', saveResult ? '✅' : '❌');
console.log('Load:', loadResult === testData ? '✅' : '❌');
console.log('Delete:', deleteResult ? '✅' : '❌');

console.log('\n🎉 Validation system tests complete!');
console.log('Try these manual tests:');
console.log('1. Go to the editor section and try entering invalid data');
console.log('2. Try importing invalid JSON data');
console.log('3. Try jumping to an invalid date in week view');
console.log('4. Check the notification system in the top-right');