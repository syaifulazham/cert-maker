'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/header';
import DashboardSidebar from '@/components/dashboard/sidebar';
import TemplateCard from '@/components/dashboard/template-card';
import { Template } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function TemplatesPage() {
  const { data: session, status } = useSession();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Create a local variable to track if the component is mounted
    let isMounted = true;
    
    async function fetchTemplates() {
      if (status !== 'authenticated') return;
      
      try {
        const response = await fetch('/api/templates/list');
        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }
        const data = await response.json();
        
        // Only update state if the component is still mounted
        if (isMounted) {
          setTemplates(data.templates || []);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
        // Only show toast and update state if the component is still mounted
        if (isMounted) {
          toast({
            title: 'Error',
            description: 'Failed to load templates. Please try again.',
            variant: 'destructive',
          });
          setIsLoading(false);
        }
      }
    }

    fetchTemplates();
    
    // Clean up function to set isMounted to false when the component unmounts
    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status === 'loading' || isLoading) {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader user={session?.user} />
      <div className="flex">
        <DashboardSidebar activeItem="templates" />
        <main className="flex-1 p-6">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Certificate Templates</h1>
            <Link
              href="/dashboard/templates/create"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Create Template
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.length > 0 ? (
              templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  id={template.id}
                  title={template.title}
                  dimensions={template.dimensions}
                  baseTemplate={template.baseTemplate}
                  createdAt={template.createdAt}
                />
              ))
            ) : (
              <>
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900">
                    No templates found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create your first certificate template to get started.
                  </p>
                </div>
                <TemplateCard
                  id="new"
                  title="Create New Template"
                  isCreateCard={true}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}