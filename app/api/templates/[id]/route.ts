import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/templates/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Await params before destructuring
  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template || template.userId !== user.id) {
      return NextResponse.json({ message: 'Template not found or forbidden' }, { status: 403 });
    }

    return NextResponse.json(template, { status: 200 });
  } catch (error) {
    console.error('[GET TEMPLATE BY ID ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}