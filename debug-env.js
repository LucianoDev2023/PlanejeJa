require('dotenv').config();
console.log('--- DATABASE_URL INSPECTION ---');
const url = process.env.DATABASE_URL;
if (!url) {
  console.log('❌ DATABASE_URL is not set!');
} else {
  console.log(`Value: [${url}]`);
  console.log(`Length: ${url.length}`);
  for (let i = 0; i < url.length; i++) {
    console.log(`Char at ${i}: [${url[i]}] (Code: ${url.charCodeAt(i)})`);
  }
}
