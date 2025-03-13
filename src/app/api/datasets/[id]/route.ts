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

    const dataset = await prisma.dataset.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!dataset) {
      return NextResponse.json(
        { message: 'Dataset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ dataset });
  } catch (error) {
    console.error('Error fetching dataset:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching the dataset' },
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

    const { title, data } = await request.json();

    // Validate input
    if (!title) {
      return NextResponse.json(
        { message: 'Dataset title is required' },
        { status: 400 }
      );
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { message: 'Dataset must contain data' },
        { status: 400 }
      );
    }

    // Check if dataset exists and belongs to the user
    const existingDataset = await prisma.dataset.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingDataset) {
      return NextResponse.json(
        { message: 'Dataset not found' },
        { status: 404 }
      );
    }

    // Update the dataset
    const updatedDataset = await prisma.dataset.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        data: data as any,
      },
    });

    return NextResponse.json({ dataset: updatedDataset });
  } catch (error) {
    console.error('Error updating dataset:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating the dataset' },
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

    // Check if dataset exists and belongs to the user
    const existingDataset = await prisma.dataset.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingDataset) {
      return NextResponse.json(
        { message: 'Dataset not found' },
        { status: 404 }
      );
    }

    // Delete the dataset
    await prisma.dataset.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(
      { message: 'Dataset deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting dataset:', error);
    return NextResponse.json(
      { message: 'An error occurred while deleting the dataset' },
      { status: 500 }
    );
  }
}