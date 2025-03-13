'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import DashboardHeader from '@/components/dashboard/header';
import DashboardSidebar from '@/components/dashboard/sidebar';
import TemplatePreview from '@/components/templates/template-preview';
import { Template } from '@/types';
import { formatDate } from '@/lib/utils';

export default function TemplateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Create a local variable to track if the component is mounted
    let isMounted = true;
    
    async function fetchTemplate() {
      if (status !== 'authenticated') return;
      
      try {
        const response = await fetch(`/api/templates/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch template');
        }
        const data = await response.json();
        
        // Only update state if the component is still mounted
        if (isMounted) {
          setTemplate(data.template);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching template:', error);
        // Only show toast and update state if the component is still mounted
        if (isMounted) {
          toast({
            title: 'Error',
            description: 'Failed to load template. Please try again.',
            variant: 'destructive',
          });
          setIsLoading(false);
        }
      }
    }

    fetchTemplate();
    
    // Clean up function to set isMounted to false when the component unmounts
    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/templates/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      toast({
        title: 'Success',
        description: 'Template deleted successfully.',
      });

      router.push('/dashboard/templates');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-100">
        <DashboardHeader user={session?.user} />
        <div className="flex">
          <DashboardSidebar activeItem="templates" />
          <main className="flex-1 p-6">
            <div className="bg-white shadow rounded-md p-6">
              <h2 className="text-xl font-semibold text-red-600">
                Template not found
              </h2>
              <p className="mt-2">
                The template you are looking for does not exist or you do not have
                permission to view it.
              </p>
              <button
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500"
                onClick={() => router.push('/dashboard/templates')}
              >
                Back to Templates
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader user={session?.user} />
      <div className="flex">
        <DashboardSidebar activeItem="templates" />
        <main className="flex-1 p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {template.title}
              </h1>
              <p className="text-sm text-gray-500">
                Created on {formatDate(new Date(template.createdAt))}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push(`/dashboard/templates/${params.id}/edit`)}
                className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500"
              >
                Edit Template
              </button>
              <button
                onClick={() => router.push(`/dashboard/execute/new?templateId=${params.id}`)}
                className="bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-500"
              >
                Generate Certificates
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:bg-red-400"
              >
                {isDeleting ? 'Deleting...' : 'Delete Template'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-md p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Template Preview</h2>
                <div className="flex justify-center">
                  <TemplatePreview template={template} />
                </div>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => router.push(`/dashboard/templates/${params.id}/edit`)}
                    className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500"
                  >
                    Open in Editor
                  </button>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-white shadow rounded-md p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Template Details</h2>
                <dl className="divide-y divide-gray-200">
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Dimensions</dt>
                    <dd className="text-sm text-gray-900">{template.dimensions}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">File Naming</dt>
                    <dd className="text-sm text-gray-900">{template.fileNaming}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Labels</dt>
                    <dd className="text-sm text-gray-900">{(template.labels as any[]).length} labels</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Images</dt>
                    <dd className="text-sm text-gray-900">{(template.images as any[]).length} images</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}