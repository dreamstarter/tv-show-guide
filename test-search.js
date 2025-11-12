// Test file for the debounced search functionality
// Run this in the browser console after loading the page

console.log('🔍 Testing TV Show Guide Search System\n');

// Test 1: Basic search functionality
console.log('Test 1: Basic search functionality...');
const searchResults = search.performSearch('law');
console.log(`Search for "law" returned ${searchResults.length} results:`);
searchResults.forEach(result => {
  const show = shows[result.id];
  console.log(`  - ${result.id}: ${show.t} (Score: ${result.score})`);
});

// Test 2: Platform-specific search
console.log('\nTest 2: Platform-specific search...');
const peacockResults = search.performSearch('peacock');
console.log(`Search for "peacock" returned ${peacockResults.length} results:`);
peacockResults.slice(0, 5).forEach(result => {
  const show = shows[result.id];
  console.log(`  - ${result.id}: ${show.t} on ${show.c} (Score: ${result.score})`);
});

// Test 3: Network search
console.log('\nTest 3: Network search...');
const nbcResults = search.performSearch('nbc');
console.log(`Search for "nbc" returned ${nbcResults.length} results:`);
nbcResults.slice(0, 5).forEach(result => {
  const show = shows[result.id];
  console.log(`  - ${result.id}: ${show.t} on ${show.net} (Score: ${result.score})`);
});

// Test 4: Partial title search
console.log('\nTest 4: Partial title search...');
const chicagoResults = search.performSearch('chicago');
console.log(`Search for "chicago" returned ${chicagoResults.length} results:`);
chicagoResults.forEach(result => {
  const show = shows[result.id];
  console.log(`  - ${result.id}: ${show.t} (Score: ${result.score})`);
});

// Test 5: Multi-word search
console.log('\nTest 5: Multi-word search...');
const multiResults = search.performSearch('law order');
console.log(`Search for "law order" returned ${multiResults.length} results:`);
multiResults.forEach(result => {
  const show = shows[result.id];
  console.log(`  - ${result.id}: ${show.t} (Score: ${result.score})`);
});

// Test 6: Case insensitive search
console.log('\nTest 6: Case insensitive search...');
const caseResults1 = search.performSearch('GREY');
const caseResults2 = search.performSearch('grey');
const caseResults3 = search.performSearch('Grey');
console.log(`"GREY" (${caseResults1.length}), "grey" (${caseResults2.length}), "Grey" (${caseResults3.length})`);
console.log('All should return the same results:', 
  caseResults1.length === caseResults2.length && 
  caseResults2.length === caseResults3.length);

// Test 7: Empty search
console.log('\nTest 7: Empty search...');
const emptyResults = search.performSearch('');
console.log(`Empty search returned ${emptyResults.length} results (should return all shows)`);

// Test 8: No matches
console.log('\nTest 8: No matches search...');
const noResults = search.performSearch('zzzznonexistent');
console.log(`Search for "zzzznonexistent" returned ${noResults.length} results`);

// Test 9: Air day search
console.log('\nTest 9: Air day search...');
const thursdayResults = search.performSearch('thursday');
console.log(`Search for "thursday" returned ${thursdayResults.length} results:`);
thursdayResults.slice(0, 5).forEach(result => {
  const show = shows[result.id];
  console.log(`  - ${result.id}: ${show.t} airs on ${show.air} (Score: ${result.score})`);
});

// Test 10: Test filtered show IDs
console.log('\nTest 10: Test filtered show IDs...');
// Simulate a search
currentSearchTerm = 'law';
searchResults = search.performSearch(currentSearchTerm);
const filteredIds = search.getFilteredShowIds();
console.log(`Current search: "${currentSearchTerm}"`);
console.log(`Filtered IDs: [${filteredIds.slice(0, 5).join(', ')}${filteredIds.length > 5 ? '...' : ''}]`);
console.log(`Total shows matching filters: ${filteredIds.length}`);

// Clean up
currentSearchTerm = '';
searchResults = null;

console.log('\n🎉 Search functionality tests complete!');
console.log('\nManual tests you can try:');
console.log('1. Type "law" in the search box and watch the results filter');
console.log('2. Try searching for "chicago" to see the Chicago shows');
console.log('3. Search for "thursday" to see shows that air on Thursday');
console.log('4. Search for "peacock" to see shows on the Peacock platform');
console.log('5. Try clearing the search and see all shows return');
console.log('6. Test the keyboard shortcuts: Escape to clear, Enter for immediate search');

// Performance test
console.log('\n⚡ Performance test:');
const startTime = performance.now();
for (let i = 0; i < 1000; i++) {
  search.performSearch('test search query');
}
const endTime = performance.now();
console.log(`1000 searches took ${(endTime - startTime).toFixed(2)}ms (avg: ${((endTime - startTime) / 1000).toFixed(3)}ms per search)`);

// Test debounce functionality
console.log('\n⏱️  Debounce test:');
console.log('Creating debounced function with 100ms delay...');
let callCount = 0;
const testFunc = utils.debounce(() => {
  callCount++;
  console.log(`Debounced function called ${callCount} times`);
}, 100);

console.log('Calling debounced function 5 times rapidly...');
for (let i = 0; i < 5; i++) {
  testFunc();
}

setTimeout(() => {
  console.log(`Final call count: ${callCount} (should be 1 due to debouncing)`);
}, 200);