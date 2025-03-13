'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface ExecutionCardProps {
  id: string;
  templateName: string;
  datasetName: string;
  status: 'Queued' | 'Processing' | 'Completed';
  createdAt: string;
  fileCount: number;
}

export default function ExecutionCard({
  id,
  templateName,
  datasetName,
  status,
  createdAt,
  fileCount,
}: ExecutionCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'Queued':
        return 'bg-yellow-50 text-yellow-700';
      case 'Processing':
        return 'bg-blue-50 text-blue-700';
      case 'Completed':
        return 'bg-green-50 text-green-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <Link
      href={`/dashboard/execute/${id}`}
      className="block"
    >
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{templateName}</h3>
            <p className="mt-1 text-sm text-gray-500">Dataset: {datasetName}</p>
          </div>
          <div className="flex-shrink-0">
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor()}`}
            >
              {status}
            </span>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(createdAt))} ago
          </p>
          <p className="text-xs text-gray-500">
            {status === 'Completed'
              ? `${fileCount} certificate${fileCount === 1 ? '' : 's'} generated`
              : 'No certificates generated yet'}
          </p>
        </div>
      </div>
    </Link>
  );
}