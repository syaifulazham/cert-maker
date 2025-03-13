/**
 * Converts an array of objects to CSV format
 * @param data - Array of objects to convert
 * @returns CSV string
 */
export function convertToCSV(data: Record<string, any>[]): string {
  if (data.length === 0) return '';

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const headerRow = headers.join(',');
  
  // Create data rows
  const rows = data.map(obj => {
    return headers.map(header => {
      // Handle values with commas by wrapping in quotes
      const value = obj[header]?.toString() || '';
      return value.includes(',') ? `"${value}"` : value;
    }).join(',');
  });
  
  // Combine header and data rows
  return [headerRow, ...rows].join('\n');
}

/**
 * Exports data as a CSV file that will be downloaded by the browser
 * @param data - Array of objects to export
 * @param filename - Name of the file to download
 */
export function exportToCSV(data: Record<string, any>[], filename: string): void {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }
  
  // Convert data to CSV
  const csv = convertToCSV(data);
  
  // Create a Blob from the CSV string
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  // Create a temporary link element
  const link = document.createElement('a');
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Set link properties
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  // Append link to the document
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports data as a JSON file that will be downloaded by the browser
 * @param data - Data to export
 * @param filename - Name of the file to download
 */
export function exportToJSON(data: any, filename: string): void {
  if (!data) {
    console.error('No data to export');
    return;
  }
  
  // Convert data to JSON string
  const json = JSON.stringify(data, null, 2);
  
  // Create a Blob from the JSON string
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  
  // Create a temporary link element
  const link = document.createElement('a');
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Set link properties
  link.href = url;
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  
  // Append link to the document
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}