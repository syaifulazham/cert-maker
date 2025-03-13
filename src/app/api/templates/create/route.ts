import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, baseTemplate, dimensions, labels, images, fileNaming } = await req.json();

    // Validate input
    if (!title) {
      return NextResponse.json(
        { message: 'Template title is required' },
        { status: 400 }
      );
    }

    // Replace placeholder URLs with local asset paths
    let processedBaseTemplate = baseTemplate;
    if (processedBaseTemplate && processedBaseTemplate.includes('placehold.co')) {
      processedBaseTemplate = '/assets/placeholders/certificate-template.png';
    }

    // Process images to replace placeholder URLs
    let processedImages = images || [];
    if (Array.isArray(processedImages)) {
      processedImages = processedImages.map(image => {
        if (image.url && image.url.includes('placehold.co')) {
          return { ...image, url: '/assets/placeholders/image-placeholder.png' };
        }
        return image;
      });
    }

    // Create the template with defaults when needed
    const template = await prisma.certificateTemplate.create({
      data: {
        title,
        baseTemplate: processedBaseTemplate || '/assets/placeholders/certificate-template.png',
        dimensions: dimensions || 'A4',
        labels: labels || [],
        images: processedImages,
        fileNaming: fileNaming || 'certificate_{{name}}_{{index}}',
        userId: session.user.id,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the template' },
      { status: 500 }
    );
  }
}