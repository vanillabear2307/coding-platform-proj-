const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'Thermo fisher _Question Bank_All Department_ 2025.xlsx');
const workbook = XLSX.readFile(filePath);

workbook.SheetNames.forEach(sheetName => {
  console.log(`\n=== SHEET: ${sheetName} ===`);
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  // Print FIRST row (header row)
  const nonEmptyRows = data.filter(row => row.some(cell => cell !== ''));
  if (nonEmptyRows.length > 0) {
    console.log(`HEADER: ${JSON.stringify(nonEmptyRows[0])}`);
    console.log(`Total non-empty rows (including header): ${nonEmptyRows.length}`);
  }
  // Also check the merge info
  const merges = sheet['!merges'];
  if (merges) {
    console.log(`Merged cells: ${JSON.stringify(merges.slice(0, 5))}`);
  }
});
