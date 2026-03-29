const { parseFAQs } = require('./lib/parser');
const result = parseFAQs('NUST_FAQs_Complete.txt');
console.log(`Parsed ${result.length} FAQs`);
console.log(result.slice(0, 3));
