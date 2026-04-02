#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PKG_PATH = join(ROOT, 'plugins/opencode/package.json');
const MARKETPLACE_PATH = join(ROOT, '.claude-plugin/marketplace.json');

const raw = await readFile(PKG_PATH, 'utf-8');
const pkg = JSON.parse(raw);

const [major, minor, patch] = pkg.version.split('.').map(Number);
const oldVersion = pkg.version;
const newVersion = `${major}.${minor}.${patch + 1}`;
pkg.version = newVersion;

await writeFile(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n');

const mktRaw = await readFile(MARKETPLACE_PATH, 'utf-8');
const mkt = JSON.parse(mktRaw);
mkt.metadata.version = newVersion;
mkt.plugins[0].version = newVersion;
await writeFile(MARKETPLACE_PATH, JSON.stringify(mkt, null, 2) + '\n');

console.log(`${oldVersion} → ${newVersion}`);
