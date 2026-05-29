import fs from 'fs';
import { parseManifest } from './src/utils/manifest.js';

const content = fs.readFileSync('../manifest.txt', 'utf8');
const result = parseManifest(content);
console.log('saved:', result.saved.length, 'skipped:', result.skipped.length);
console.log('saved records:', result.saved.map((s) => `${s.cargoCode}=${s.weightKg}`).join(', '));
console.log('skipped:', result.skipped.map((s) => `${s.cargoCode}=${s.weight}`).join(', '));
