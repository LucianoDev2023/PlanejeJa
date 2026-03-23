const fs = require('fs');
const buf = fs.readFileSync('.env');
console.log('HEX:', buf.slice(0, 10).toString('hex'));
