const fs = require('fs');
const content = fs.readFileSync('.env', 'utf8');
const lines = content.split('\n');
const dbUrlLine = lines.find(l => l.trimStart().startsWith('DATABASE_URL='));

if (!dbUrlLine) {
  fs.writeFileSync('debug-url.log', 'No DATABASE_URL found\n');
  process.exit(1);
}

const urlValue = dbUrlLine.split('DATABASE_URL=')[1].trim();
let log = '--- RAW VALUE ---\n';
log += JSON.stringify(urlValue) + '\n\n';

log += '--- HEX ---\n';
log += Buffer.from(urlValue).toString('hex') + '\n\n';

try {
  const u = new URL(urlValue);
  log += '--- URL PARTS ---\n';
  log += JSON.stringify({
    protocol: u.protocol,
    username: u.username,
    password: u.password,
    hostname: u.hostname,
    port: u.port,
    pathname: u.pathname,
    search: u.search
  }, null, 2) + '\n';
} catch (e) {
  log += 'URL Parsing Error: ' + e.message + '\n';
}

fs.writeFileSync('debug-url.log', log);
