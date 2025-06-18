import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { PDFGenerator } from '@/lib/pdf'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
      const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.email) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }
    const formData = await request.formData()
    const templateId = formData.get('templateId') as string
    // const userId = formData.get('userId') as string
    const file = formData.get('file') as File
    const generationName = formData.get('generationName') as string
    const participants = formData.get('participants') as unknown as number

     const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    console.log('Received data:', { templateId, user, generationName, file: file?.name })

    // Validasi input
    if (!templateId || !user.id || !file || !generationName) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    // Validasi template ownership
    const template = await prisma.template.findFirst({
      where: { 
        id: templateId, 
        userId: user.id 
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template tidak ditemukan atau tidak memiliki akses' }, 
        { status: 404 }
      )
    }

    // Parse data dari file
    const certificateData = await PDFGenerator.parseFileData(file)
    
    if (certificateData.length === 0) {
      return NextResponse.json(
        { error: 'Data tidak ditemukan dalam file' }, 
        { status: 400 }
      )
    }

    console.log(`Found ${certificateData.length} participants`)
    console.log('Sample data:', certificateData[0]) // Debug: lihat struktur data

    // Parse template data dari JSON yang tersimpan di database
    let templateData
    try {
      // Asumsi template.data berisi JSON template, sesuaikan dengan struktur database Anda
      const templateJson = typeof template.data === 'string' 
        ? JSON.parse(template.data) 
        : template.data

      templateData = {
        eventName: generationName,
        templateName: template.name || templateJson.templateName || 'Certificate',
        backgroundImage: templateJson.backgroundImage || '',
        components: templateJson.components || [],
        settings: templateJson.settings || {
          width: 800,
          height: 600,
          padding: '20px'
        }
      }

      // Validasi template
      const validation = PDFGenerator.validateTemplate(templateData)
      if (!validation.isValid) {
        return NextResponse.json(
          { error: `Template tidak valid: ${validation.errors.join(', ')}` },
          { status: 400 }
        )
      }

    } catch (parseError) {
      console.error('Template parsing error:', parseError)
      return NextResponse.json(
        { error: 'Template format tidak valid' },
        { status: 400 }
      )
    }

    console.log('Template data prepared:', {
      eventName: templateData.eventName,
      templateName: templateData.templateName,
      componentCount: templateData.components.length
    })

    // Generate ZIP file berisi semua PDF
    const zipBuffer = await PDFGenerator.generateCertificatesZip(
      templateData, 
      certificateData
    )

    console.log(`Generated ZIP file, size: ${zipBuffer.length} bytes`)

    // Upload ke Supabase Storage
    const zipFileName = `${generationName.replace(/[^a-zA-Z0-9._-]/g, '_')}_${Date.now()}.zip`
    const filePath = `certificates/${user.id}/${zipFileName}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('certificates') // pastikan bucket sudah dibuat
      .upload(filePath, zipBuffer, {
        contentType: 'application/zip',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: `Upload gagal: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('certificates')
      .getPublicUrl(filePath)

    // Save generation record ke database
    const generation = await prisma.generation.create({
      data: {
        name: generationName,
        fileUrl: publicUrl,
        userId: user.id,
        participant : participants
        // id: templateId,
        // participantCount: certificateData.length,
        // status: 'completed'
      }
    })

    console.log('Generation completed successfully')

    return NextResponse.json({
      success: true,
      generation,
      downloadUrl: publicUrl,
      totalCertificates: certificateData.length,
      fileName: zipFileName,
      summary: {
        templateName: templateData.templateName,
        eventName: templateData.eventName,
        participantCount: certificateData.length,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Certificate generation error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}