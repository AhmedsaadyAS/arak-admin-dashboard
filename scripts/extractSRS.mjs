import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse/lib/pdf-parse.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfPath = path.join(__dirname, '..', 'srs', 'Arak_SRS_Document_v2.pdf');
const buf = fs.readFileSync(pdfPath);

const data = await pdf(buf);
const outPath = path.join(__dirname, '..', 'srs', 'srs_text.txt');
fs.writeFileSync(outPath, data.text);
console.log('Pages:', data.numpages);
console.log('Characters:', data.text.length);
