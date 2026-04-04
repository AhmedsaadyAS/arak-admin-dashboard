const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse/lib/pdf-parse.js');

const pdfPath = path.join(__dirname, '..', 'srs', 'Arak_SRS_Document_v2.pdf');
const buf = fs.readFileSync(pdfPath);

pdf(buf).then(data => {
    const outPath = path.join(__dirname, '..', 'srs', 'srs_text.txt');
    fs.writeFileSync(outPath, data.text);
    console.log('Pages:', data.numpages);
    console.log('Characters:', data.text.length);
    console.log('Written to:', outPath);
}).catch(err => console.error('Error:', err.message));
