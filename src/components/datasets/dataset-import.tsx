'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { parseCSV, validateCSV } from '@/utils/csv-parser';

interface DatasetImportProps {
  onImport: (data: Record<string, any>[]) => void;
}

export default function DatasetImport({ onImport }: DatasetImportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        
        // Validate the CSV
        const validation = validateCSV(text);
        if (!validation.valid) {
          toast({
            title: 'Invalid CSV',
            description: validation.error,
            variant: 'destructive',
          });
          setIsImporting(false);
          return;
        }
        
        // Parse the CSV
        const parsedData = parseCSV(text);
        
        if (parsedData.length === 0) {
          toast({
            title: 'Empty CSV',
            description: 'The CSV file contains no valid data rows.',
            variant: 'destructive',
          });
          setIsImporting(false);
          return;
        }
        
        onImport(parsedData);
        
        toast({
          title: 'Import Successful',
          description: `Imported ${parsedData.length} records.`,
        });
      } catch (error) {
        console.error('Error importing CSV:', error);
        toast({
          title: 'Import Failed',
          description: 'Failed to import CSV. Please check the file format.',
          variant: 'destructive',
        });
      } finally {
        setIsImporting(false);
        
        // Reset the file input
        event.target.value = '';
      }
    };
    
    reader.onerror = () => {
      toast({
        title: 'Import Failed',
        description: 'Failed to read file. Please try again.',
        variant: 'destructive',
      });
      setIsImporting(false);
    };
    
    reader.readAsText(file);
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const jsonData = JSON.parse(text);
        
        if (!Array.isArray(jsonData)) {
          toast({
            title: 'Invalid JSON',
            description: 'The JSON file must contain an array of objects.',
            variant: 'destructive',
          });
          setIsImporting(false);
          return;
        }
        
        if (jsonData.length === 0) {
          toast({
            title: 'Empty JSON',
            description: 'The JSON file contains no data.',
            variant: 'destructive',
          });
          setIsImporting(false);
          return;
        }
        
        onImport(jsonData);
        
        toast({
          title: 'Import Successful',
          description: `Imported ${jsonData.length} records.`,
        });
      } catch (error) {
        console.error('Error importing JSON:', error);
        toast({
          title: 'Import Failed',
          description: 'Failed to import JSON. Please check the file format.',
          variant: 'destructive',
        });
      } finally {
        setIsImporting(false);
        
        // Reset the file input
        event.target.value = '';
      }
    };
    
    reader.onerror = () => {
      toast({
        title: 'Import Failed',
        description: 'Failed to read file. Please try again.',
        variant: 'destructive',
      });
      setIsImporting(false);
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="border rounded-md p-4 bg-gray-50">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Import Data</h3>
      <p className="text-sm text-gray-500 mb-4">
        Import data from CSV or JSON files
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <label
            htmlFor="csv-import"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-2 text-green-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5"
              />
            </svg>
            Import from CSV
            <input
              id="csv-import"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isImporting}
              className="hidden"
            />
          </label>
        </div>
        <div>
          <label
            htmlFor="json-import"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-2 text-blue-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            Import from JSON
            <input
              id="json-import"
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              disabled={isImporting}
              className="hidden"
            />
          </label>
        </div>
      </div>
      {isImporting && (
        <p className="mt-2 text-sm text-gray-500">Importing data...</p>
      )}
    </div>
  );
}