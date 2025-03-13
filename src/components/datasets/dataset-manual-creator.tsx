'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface DatasetManualCreatorProps {
  onSubmit: (title: string, data: any[]) => void;
  isSubmitting: boolean;
  initialTitle?: string;
  initialData?: Record<string, string>[];
}

export default function DatasetManualCreator({
  onSubmit,
  isSubmitting,
  initialTitle = '',
  initialData = [],
}: DatasetManualCreatorProps) {
  const [title, setTitle] = useState(initialTitle);
  
  // Initialize columns and rows based on initial data if provided
  const [columns, setColumns] = useState<string[]>(() => {
    if (initialData.length > 0) {
      return Object.keys(initialData[0]);
    }
    return ['name', 'email'];
  });
  
  const [rows, setRows] = useState<Record<string, string>[]>(() => {
    if (initialData.length > 0) {
      return initialData;
    }
    return [{ name: '', email: '' }];
  });
  const { toast } = useToast();

  const handleAddColumn = () => {
    const newColumnName = prompt('Enter column name');
    if (!newColumnName) return;
    
    // Validate column name (no spaces, special chars only underscores)
    if (!/^[a-zA-Z0-9_]+$/.test(newColumnName)) {
      toast({
        title: 'Invalid Column Name',
        description: 'Column names can only contain letters, numbers, and underscores.',
        variant: 'destructive',
      });
      return;
    }
    
    // Check for duplicate column names
    if (columns.includes(newColumnName)) {
      toast({
        title: 'Duplicate Column',
        description: `Column "${newColumnName}" already exists.`,
        variant: 'destructive',
      });
      return;
    }
    
    // Add new column to columns array
    setColumns([...columns, newColumnName]);
    
    // Add empty value for the new column to all existing rows
    setRows(rows.map(row => ({ ...row, [newColumnName]: '' })));
  };

  const handleRemoveColumn = (columnIndex: number) => {
    const columnToRemove = columns[columnIndex];
    
    // Create new columns array without the removed column
    const newColumns = columns.filter((_, index) => index !== columnIndex);
    
    // Create new rows without the removed column
    const newRows = rows.map(row => {
      const newRow = { ...row };
      delete newRow[columnToRemove];
      return newRow;
    });
    
    setColumns(newColumns);
    setRows(newRows);
  };

  const handleAddRow = () => {
    // Create a new empty row with all columns
    const newRow: Record<string, string> = {};
    columns.forEach(column => {
      newRow[column] = '';
    });
    
    setRows([...rows, newRow]);
  };

  const handleRemoveRow = (rowIndex: number) => {
    setRows(rows.filter((_, index) => index !== rowIndex));
  };

  const handleCellChange = (rowIndex: number, column: string, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [column]: value };
    setRows(newRows);
  };

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
    
    if (columns.length === 0) {
      toast({
        title: 'No Columns',
        description: 'Please add at least one column to your dataset.',
        variant: 'destructive',
      });
      return;
    }
    
    if (rows.length === 0) {
      toast({
        title: 'No Data',
        description: 'Please add at least one row of data.',
        variant: 'destructive',
      });
      return;
    }
    
    // Filter out empty rows
    const nonEmptyRows = rows.filter(row => {
      return Object.values(row).some(value => value.trim() !== '');
    });
    
    if (nonEmptyRows.length === 0) {
      toast({
        title: 'Empty Data',
        description: 'Please add at least one row with some data.',
        variant: 'destructive',
      });
      return;
    }
    
    onSubmit(title, nonEmptyRows);
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
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-900">Dataset Structure</h3>
            <button
              type="button"
              onClick={handleAddColumn}
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mr-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Add Column
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300 border">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column, columnIndex) => (
                    <th
                      key={columnIndex}
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 border-r last:border-r-0"
                    >
                      <div className="flex items-center justify-between">
                        <span>{column}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColumn(columnIndex)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </th>
                  ))}
                  <th scope="col" className="relative px-3 py-3.5 w-10">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {columns.map((column, columnIndex) => (
                      <td
                        key={`${rowIndex}-${columnIndex}`}
                        className="whitespace-nowrap px-1 py-1 text-sm text-gray-500 border-r last:border-r-0"
                      >
                        <input
                          type="text"
                          value={row[column] || ''}
                          onChange={(e) =>
                            handleCellChange(rowIndex, column, e.target.value)
                          }
                          className="w-full p-1 border-0 focus:ring-0"
                          placeholder={`Enter ${column}`}
                        />
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-1 py-1 text-sm text-gray-500 w-10">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(rowIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mr-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Add Row
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || columns.length === 0 || rows.length === 0}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-300"
          >
            {isSubmitting ? 'Creating...' : 'Create Dataset'}
          </button>
        </div>
      </div>
    </form>
  );
}