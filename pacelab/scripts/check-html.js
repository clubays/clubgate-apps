import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const htmlPath = path.resolve(process.cwd(), 'index.html');
const content = fs.readFileSync(htmlPath, 'utf8');

const forbidden = ['preconnect', 'preload', 'https://'];
const errors = [];

for (const term of forbidden) {
  if (content.includes(term)) {
    errors.push(`Forbidden term found in index.html: "${term}"`);
  }
}

const scriptMatches = content.match(/<script/gi) || [];
if (scriptMatches.length > 1) {
  errors.push(`index.html contains ${scriptMatches.length} <script tags, expected at most 1.`);
}

if (errors.length > 0) {
  console.error('check:html FAILED:');
  for (const err of errors) {
    console.error(` - ${err}`);
  }
  process.exit(1);
}

console.log('check:html PASSED: index.html meets all privacy and local packaging constraints.');
