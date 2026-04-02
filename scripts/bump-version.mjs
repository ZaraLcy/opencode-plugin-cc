#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PKG_PATH = join(ROOT, 'plugins/opencode/package.json');

const raw = await readFile(PKG_PATH, 'utf-8');
const pkg = JSON.parse(raw);

const [major, minor, patch] = pkg.version.split('.').map(Number);
const oldVersion = pkg.version;
pkg.version = `${major}.${minor}.${patch + 1}`;

await writeFile(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n');
console.log(`${oldVersion} → ${pkg.version}`);
