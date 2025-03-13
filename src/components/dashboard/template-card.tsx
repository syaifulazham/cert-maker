'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface TemplateCardProps {
  id: string;
  title: string;
  dimensions?: string;
  createdAt?: string;
  baseTemplate?: string;
  isCreateCard?: boolean;
}

export default function TemplateCard({
  id,
  title,
  dimensions,
  createdAt,
  baseTemplate,
  isCreateCard = false,
}: TemplateCardProps) {
  if (isCreateCard) {
    return (
      <Link
        href="/dashboard/templates/create"
        className="block h-full"
      >
        <div className="h-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mx-auto h-10 w-10 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Create new template
          </h3>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/dashboard/templates/${id}`}
      className="block h-full"
    >
      <div className="h-full rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
        <div className="relative w-full aspect-[3/2] bg-gray-100">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${baseTemplate && !baseTemplate.includes('placehold.co') ? baseTemplate : '/assets/placeholders/certificate-template.png'})`,
            }}
          ></div>
        </div>
        
        <div className="p-4 flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              {dimensions && (
                <p className="mt-1 text-sm text-gray-500">{dimensions}</p>
              )}
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-3 h-3 mr-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                Template
              </span>
            </div>
          </div>
          {createdAt && (
            <p className="mt-4 text-xs text-gray-500">
              Created {formatDistanceToNow(new Date(createdAt))} ago
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}