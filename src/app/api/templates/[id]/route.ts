import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const template = await prisma.certificateTemplate.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!template) {
      return NextResponse.json(
        { message: 'Template not found' },
        { status: 404 }
      );
    }

    // Replace placeholder URLs with local asset paths
    if (template.baseTemplate && template.baseTemplate.includes('placehold.co')) {
      template.baseTemplate = '/assets/placeholders/certificate-template.png';
    }

    // Handle placeholder URLs in images
    if (template.images) {
      const images = JSON.parse(JSON.stringify(template.images));
      if (Array.isArray(images)) {
        for (let i = 0; i < images.length; i++) {
          if (images[i].url && images[i].url.includes('placehold.co')) {
            images[i].url = '/assets/placeholders/image-placeholder.png';
          }
        }
        template.images = images;
      }
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching the template' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, baseTemplate, dimensions, labels, images, fileNaming } = await request.json();

    // Validate input
    if (!title) {
      return NextResponse.json(
        { message: 'Template title is required' },
        { status: 400 }
      );
    }

    if (!baseTemplate) {
      return NextResponse.json(
        { message: 'Template background is required' },
        { status: 400 }
      );
    }

    if (!dimensions) {
      return NextResponse.json(
        { message: 'Template dimensions are required' },
        { status: 400 }
      );
    }

    if (!fileNaming) {
      return NextResponse.json(
        { message: 'File naming pattern is required' },
        { status: 400 }
      );
    }

    // Check if template exists and belongs to the user
    const existingTemplate = await prisma.certificateTemplate.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { message: 'Template not found' },
        { status: 404 }
      );
    }

    // Update the template
    const updatedTemplate = await prisma.certificateTemplate.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        baseTemplate,
        dimensions,
        labels: labels || [],
        images: images || [],
        fileNaming,
      },
    });

    return NextResponse.json({ template: updatedTemplate });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the template' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if template exists and belongs to the user
    const existingTemplate = await prisma.certificateTemplate.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { message: 'Template not found' },
        { status: 404 }
      );
    }

    // Delete the template
    await prisma.certificateTemplate.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(
      { message: 'Template deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting the template' },
      { status: 500 }
    );
  }
}