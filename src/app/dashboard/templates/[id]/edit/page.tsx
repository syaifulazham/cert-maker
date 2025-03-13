'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/header';
import DashboardSidebar from '@/components/dashboard/sidebar';
import TemplateEditor from '@/components/templates/template-editor';
import { useToast } from '@/hooks/use-toast';
import { Template } from '@/types';

export default function EditTemplatePage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleUpdateTemplate = async (templateData: Omit<Template, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    setIsSubmitting(true);

    try {
      // Create a copy of the template data to send
      const dataToSend = {
        ...templateData,
        labels: templateData.labels || [],
        images: templateData.images || [],
      };

      const response = await fetch(`/api/templates/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error('Failed to update template');
      }

      toast({
        title: 'Success',
        description: 'Template updated successfully.',
      });

      router.push(`/dashboard/templates/${params.id}`);
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to update template. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
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
                The template you are trying to edit does not exist or you do not have
                permission to edit it.
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Template: {template.title}
            </h1>
            <p className="mt-1 text-gray-600">
              Update your certificate template design
            </p>
          </div>

          <TemplateEditor 
            template={template}
            onSave={handleUpdateTemplate}
            isSaving={isSubmitting}
          />
        </main>
      </div>
    </div>
  );
}