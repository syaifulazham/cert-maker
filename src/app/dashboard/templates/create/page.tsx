'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/header';
import DashboardSidebar from '@/components/dashboard/sidebar';
import TemplateEditor from '@/components/templates/template-editor';
import { useToast } from '@/hooks/use-toast';
import { Template } from '@/types';

export default function CreateTemplatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTemplate = async (templateData: Omit<Template, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    setIsSubmitting(true);

    try {
      // Create a copy of the template data to send
      const dataToSend = {
        ...templateData,
        labels: templateData.labels || [],
        images: templateData.images || [],
      };

      const response = await fetch('/api/templates/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error('Failed to create template');
      }

      const data = await response.json();

      toast({
        title: 'Success',
        description: 'Template created successfully.',
      });

      router.push(`/dashboard/templates/${data.template.id}`);
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create template. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader user={session?.user} />
      <div className="flex">
        <DashboardSidebar activeItem="templates" />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Template
            </h1>
            <p className="mt-1 text-gray-600">
              Design your certificate template with custom labels and images
            </p>
          </div>

          <TemplateEditor 
            template={{
              id: 'new',
              userId: session?.user?.id || '',
              title: 'New Template',
              baseTemplate: '/assets/placeholders/certificate-template.png',
              dimensions: 'A4',
              labels: [],
              images: [],
              fileNaming: 'certificate_{{name}}_{{index}}',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }}
            onSave={handleCreateTemplate}
            isSaving={isSubmitting}
          />
        </main>
      </div>
    </div>
  );
}