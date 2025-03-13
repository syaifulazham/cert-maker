'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { parseCSV, validateCSV } from '@/utils/csv-parser';
import { useToast } from '@/hooks/use-toast';

interface DatasetUploaderProps {
  onSubmit: (title: string, data: any[]) => void;
  isSubmitting: boolean;
}

export default function DatasetUploader({
  onSubmit,
  isSubmitting,
}: DatasetUploaderProps) {
  const [title, setTitle] = useState('');
  const [csvData, setCsvData] = useState<Record<string, any>[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, any>[]>([]);
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setFileName(file.name);
      
      // Auto-generate title from filename if not already set
      if (!title) {
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
        setTitle(nameWithoutExtension);
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        
        // Validate the CSV
        const validation = validateCSV(text);
        if (!validation.valid) {
          toast({
            title: 'Invalid CSV',
            description: validation.error,
            variant: 'destructive',
          });
          return;
        }
        
        // Parse the CSV
        try {
          const parsedData = parseCSV(text);
          
          // Update state with parsed data
          setCsvData(parsedData);
          
          // Get headers for preview
          if (parsedData.length > 0) {
            setPreviewHeaders(Object.keys(parsedData[0]));
            
            // Show up to 5 rows for preview
            setPreviewRows(parsedData.slice(0, 5));
          }
          
          toast({
            title: 'CSV Loaded',
            description: `Successfully loaded ${parsedData.length} records.`,
          });
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to parse CSV file. Please check the format.',
            variant: 'destructive',
          });
        }
      };
      reader.readAsText(file);
    },
    [title, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast({
        title: 'Missing Title',
        description: 'Please provide a title for your dataset.',
        variant: 'destructive',
      });
      return;
    }
    
    if (csvData.length === 0) {
      toast({
        title: 'No Data',
        description: 'Please upload a CSV file with data.',
        variant: 'destructive',
      });
      return;
    }
    
    onSubmit(title, csvData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Dataset Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Enter a title for your dataset"
            required
          />
        </div>

        <div>
          <div
            {...getRootProps()}
            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
              isDragActive ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300'
            }`}
          >
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <input {...getInputProps()} />
                <p className="pl-1">
                  Drag and drop a CSV file here, or{' '}
                  <span className="text-indigo-600 font-medium">
                    click to browse
                  </span>
                </p>
              </div>
              <p className="text-xs text-gray-500">CSV files only</p>
            </div>
          </div>
          {fileName && (
            <p className="mt-2 text-sm text-indigo-600">
              Uploaded: {fileName}
            </p>
          )}
        </div>

        {previewRows.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900">Data Preview</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    {previewHeaders.map((header) => (
                      <th
                        key={header}
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {previewRows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {previewHeaders.map((header) => (
                        <td
                          key={`${rowIndex}-${header}`}
                          className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                        >
                          {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Showing {previewRows.length} of {csvData.length} rows
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || csvData.length === 0}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-300"
          >
            {isSubmitting ? 'Creating...' : 'Create Dataset'}
          </button>
        </div>
      </div>
    </form>
  );
}