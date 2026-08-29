const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function extractPages1to6() {
  const dataBuffer = fs.readFileSync('Team Management Application Scope of Work Updated.pdf');
  const parser = new PDFParse({ data: dataBuffer });
  await parser.load();
  const text = await parser.getText();
  const pages = text.text.split(/-- \d+ of \d+ --/);
  console.log('=== PAGES 7 TO 10 ===');
  for (let i = 6; i < pages.length; i++) {
    console.log(`\n--- PAGE ${i + 1} ---`);
    console.log(pages[i]);
  }
}

extractPages1to6().catch(console.error);
