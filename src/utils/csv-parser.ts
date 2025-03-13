/**
 * Parses CSV data into an array of objects
 * @param csv - The CSV string to parse
 * @returns An array of objects with keys from the CSV header
 */
export function parseCSV(csv: string): Record<string, any>[] {
  // Handle different line endings
  const normalizedCsv = csv.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalizedCsv.split('\n');
  
  // Get headers from the first line
  const headers = lines[0].split(',').map(header => header.trim());
  
  // Process data rows
  return lines
    .slice(1)
    .filter(line => line.trim() !== '') // Skip empty lines
    .map(line => {
      const values = parseCsvLine(line);
      const entry: Record<string, any> = {};
      
      // Map values to headers
      headers.forEach((header, index) => {
        entry[header] = values[index] || '';
      });
      
      return entry;
    });
}

/**
 * Parse a CSV line handling quoted values and commas within quotes
 * @param line - A single CSV line
 * @returns Array of values from the line
 */
function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      // Toggle the insideQuotes flag when we see a quote
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      // If we're not inside quotes and see a comma, end the current value
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      // Otherwise add the character to the current value
      currentValue += char;
    }
  }
  
  // Add the last value
  values.push(currentValue.trim());
  
  return values;
}

/**
 * Validate if a CSV string has the correct format
 * @param csv - The CSV string to validate
 * @returns An object with validation result and possible error message
 */
export function validateCSV(csv: string): { valid: boolean; error?: string } {
  if (!csv.trim()) {
    return { valid: false, error: 'CSV data is empty' };
  }
  
  const lines = csv.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length < 2) {
    return { valid: false, error: 'CSV must have a header row and at least one data row' };
  }
  
  const headerColumns = lines[0].split(',').length;
  
  // Check if all data rows have the same number of columns as the header
  for (let i = 1; i < lines.length; i++) {
    const dataColumns = parseCsvLine(lines[i]).length;
    
    if (dataColumns !== headerColumns) {
      return { 
        valid: false, 
        error: `Row ${i + 1} has ${dataColumns} columns, but header has ${headerColumns} columns` 
      };
    }
  }
  
  return { valid: true };
}