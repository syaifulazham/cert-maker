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

    const { title, data } = await req.json();

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

    // Create the dataset
    const dataset = await prisma.dataset.create({
      data: {
        title,
        data: data as any,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ dataset }, { status: 201 });
  } catch (error) {
    console.error('Error creating dataset:', error);
    return NextResponse.json(
      { message: 'An error occurred while creating the dataset' },
      { status: 500 }
    );
  }
}