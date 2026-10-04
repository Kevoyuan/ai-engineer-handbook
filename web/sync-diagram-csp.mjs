// Preserve the checked standalone documents byte-for-byte. Permit only their
// exact scripts, and the Google Fonts stylesheet's exact load handler.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const configPath = fileURLToPath(new URL('./vercel.json', import.meta.url));
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const hash = value => `'sha256-${createHash('sha256').update(value).digest('base64')}'`;
const scripts = new Set();
const handlers = new Set();
for (const name of ['skills-zh', 'skills-en', 'memory-zh']) {
  const source = readFileSync(new URL(`./site/diagrams/${name}.html`, import.meta.url), 'utf8');
  for (const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\btype\s*=\s*["']application\/json["']/i.test(match[1])) continue;
    if (/\bsrc\s*=/i.test(match[1])) continue;
    scripts.add(hash(match[2]));
  }
  // This is the only event attribute in the verified document template.
  if (source.includes('onload="this.media=\'all\'"')) handlers.add(hash("this.media='all'"));
}
const strict = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
const documentPolicy = "default-src 'self'; script-src 'self' " +
  [...scripts].sort().join(' ') + " 'unsafe-hashes' " + [...handlers].sort().join(' ') +
  "; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob:; connect-src 'self'; font-src 'self' https://fonts.gstatic.com; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
// Mutually exclusive paths avoid multiple CSP headers restricting each other.
config.headers = config.headers.map(rule => ({
  ...rule,
  headers: rule.headers.filter(header => header.key.toLowerCase() !== 'content-security-policy'),
})).filter(rule => rule.headers.length);
config.headers.push(
  { source: '/((?!diagrams/).*)', headers: [{ key: 'Content-Security-Policy', value: strict }] },
  { source: '/diagrams/(.*)', headers: [{ key: 'Content-Security-Policy', value: documentPolicy }] },
);
writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
console.log(`Updated standalone document CSP for ${scripts.size} verified scripts and ${handlers.size} font-load handlers.`);
