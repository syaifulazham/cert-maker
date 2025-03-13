import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and merges Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to a readable string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Parses CSV data into a JSON object
 */
export function parseCSV(csv: string): Record<string, any>[] {
  const lines = csv.split('\n');
  const headers = lines[0].split(',').map((header) => header.trim());
  
  return lines.slice(1).map((line) => {
    if (!line.trim()) return {};
    
    const values = line.split(',').map((value) => value.trim());
    const entry: Record<string, any> = {};
    
    headers.forEach((header, index) => {
      entry[header] = values[index] || '';
    });
    
    return entry;
  }).filter((entry) => Object.keys(entry).length > 0);
}

/**
 * Generates a unique filename for a certificate
 */
export function generateFileName(
  namingPattern: string,
  index: number,
  data: Record<string, any>
): string {
  let filename = namingPattern;
  
  // Replace placeholders with data values
  Object.keys(data).forEach((key) => {
    filename = filename.replace(`{{${key}}}`, data[key] || '');
  });
  
  // Replace index placeholder
  filename = filename.replace('{{index}}', index.toString().padStart(3, '0'));
  
  // Sanitize filename
  filename = filename
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
  
  return `${filename}.pdf`;
}