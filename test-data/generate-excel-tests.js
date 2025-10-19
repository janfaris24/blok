/**
 * Script to generate Excel versions of all CSV test files
 * Run: node test-data/generate-excel-tests.js
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const testFiles = [
  'test-import-complete',
  'test-import-missing-emails',
  'test-import-missing-phones',
  'test-import-missing-type',
  'test-import-minimal',
  'test-import-invalid-data',
  'test-import-mixed-columns',
  'test-import-missing-required',
  'test-import-mixed-scenarios',
];

console.log('🚀 Generating Excel test files...\n');

testFiles.forEach((fileName) => {
  const csvPath = path.join(__dirname, `${fileName}.csv`);
  const xlsxPath = path.join(__dirname, `${fileName}.xlsx`);

  if (!fs.existsSync(csvPath)) {
    console.log(`⚠️  Skipping ${fileName} - CSV not found`);
    return;
  }

  try {
    // Read CSV file
    const csvContent = fs.readFileSync(csvPath, 'utf8');

    // Parse CSV to workbook
    const workbook = XLSX.read(csvContent, { type: 'string' });

    // Write to Excel
    XLSX.writeFile(workbook, xlsxPath);

    console.log(`✅ Generated: ${fileName}.xlsx`);
  } catch (error) {
    console.log(`❌ Error generating ${fileName}.xlsx:`, error.message);
  }
});

console.log('\n✨ Done! All Excel test files generated.');
console.log('\n📍 Test files location: test-data/');
console.log('\n📖 See TEST_CASES_README.md for detailed test descriptions.');
