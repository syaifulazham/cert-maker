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

    const execution = await prisma.certificateExecution.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        template: {
          select: {
            title: true,
          },
        },
        dataset: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!execution) {
      return NextResponse.json(
        { message: 'Execution not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ execution });
  } catch (error) {
    console.error('Error fetching execution status:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching execution status' },
      { status: 500 }
    );
  }
}