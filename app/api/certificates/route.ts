// app/api/certificates/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth' // Pastikan ini mengarah ke authOptions kamu
import { prisma } from '@/lib/prisma' // Pastikan prisma client sudah dibuat di lib/prisma.ts


export async function GET() {
  // Ambil session user yang sedang login
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Ambil user dari database berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Ambil semua certificate milik user ini
    const certificates = await prisma.generation.findMany({
      where: {
        userId: user.id, // Pastikan field ini ada di tabel certificate
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(certificates, { status: 200 })
  } catch (error) {
    console.error('[GET CERTIFICATES ERROR]', error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
