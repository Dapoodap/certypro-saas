import { parse } from 'csv-parse/sync'
import * as XLSX from 'xlsx'
import JSZip from 'jszip'
import { jsPDF } from 'jspdf'

interface CertificateData {
  [key: string]: any
}

interface TemplateComponent {
  id: string
  type: "text" | "image" | "shape"
  content: string
  style: {
    position: { x: number; y: number }
    fontSize?: string
    fontWeight?: string
    color?: string
    textAlign?: string
    width?: string
    height?: string
    backgroundColor?: string
    borderRadius?: string
  }
}

interface TemplateData {
  eventName: string
  templateName: string
  backgroundImage: string
  components: TemplateComponent[]
  settings: {
    width: number
    height: number
    padding: string
  }
}

// Server-side function to get image as base64
async function getImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'image/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    // Get the image as array buffer
    const arrayBuffer = await response.arrayBuffer()
    
    // Convert to base64
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    
    // Determine content type from response headers
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    return `data:${contentType};base64,${base64}`
  } catch (error) {
    console.error('Error fetching image:', error)
    throw error
  }
}

// Fallback function for client-side (if needed)
async function getImageAsBase64Canvas(url: string): Promise<string> {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    // We're in Node.js, use the server-side method
    return getImageAsBase64(url)
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous' // Important for CORS
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        
        canvas.width = img.width
        canvas.height = img.height
        
        ctx.drawImage(img, 0, 0)
        
        const dataURL = canvas.toDataURL('image/jpeg', 0.8)
        resolve(dataURL)
      } catch (error) {
        console.error('Canvas error:', error)
        reject(error)
      }
    }
    
    img.onerror = (error) => {
      console.error('Image load error:', error)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

export class PDFGenerator {
  
  static replaceTemplatePlaceholders(content: string, data: CertificateData): string {
    return content.replace(/\{\{(.*?)\}\}/g, (match, key) => {
      const trimmedKey = key.trim()
      if (data[trimmedKey] !== undefined && data[trimmedKey] !== null) {
        return String(data[trimmedKey])
      } else {
        console.warn(`⚠️ Placeholder {{${trimmedKey}}} tidak ditemukan di data`)
        return match // biarkan placeholder tetap tampil
      }
    })
  }

  static async parseFileData(file: File): Promise<CertificateData[]> {
    const fileBuffer = await file.arrayBuffer()
    let certificateData: CertificateData[]

    if (file.name.endsWith('.csv')) {
      const csvText = new TextDecoder().decode(fileBuffer)
      certificateData = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        delimiter: [',', ';', '\t'], // Support multiple delimiters
        quote: ['"', "'"]
      })
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const workbook = XLSX.read(fileBuffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      certificateData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
    } else {
      throw new Error('Format file tidak didukung. Gunakan CSV atau Excel (.xlsx/.xls)')
    }

    // Clean and validate data
    certificateData = certificateData
      .filter(row => Object.keys(row).length > 0) // Remove empty rows
      .map(row => {
        const cleanRow: CertificateData = {}
        // Clean column names (remove extra spaces, etc.)
        Object.keys(row).forEach(key => {
          const cleanKey = key.trim().toLowerCase()
          cleanRow[cleanKey] = typeof row[key] === 'string' ? row[key].trim() : row[key]
          // Also keep original key for backward compatibility
          if (cleanKey !== key) {
            cleanRow[key] = cleanRow[cleanKey]
          }
        })
        return cleanRow
      })

    if (certificateData.length === 0) {
      throw new Error('File tidak mengandung data yang valid')
    }

    return certificateData
  }

  // Convert hex color to RGB values
  static hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }

  // Convert font weight to jsPDF weight
  static convertFontWeight(weight: string): 'normal' | 'bold' {
    const boldWeights = ['bold', '600', '700', '800', '900']
    return boldWeights.includes(weight) ? 'bold' : 'normal'
  }

  // Convert text alignment
  static convertTextAlign(align: string): 'left' | 'center' | 'right' {
    switch (align) {
      case 'center': return 'center'
      case 'right': return 'right'
      default: return 'left'
    }
  }

  // Get font size in points from px/rem/em
  static convertFontSize(fontSize: string): number {
    const size = parseFloat(fontSize)
    if (fontSize.includes('px')) {
      return size * 0.75 // Convert px to pt (roughly)
    } else if (fontSize.includes('rem') || fontSize.includes('em')) {
      return size * 12 // Assume base 16px, convert to pt
    }
    return Math.max(8, Math.min(72, size)) // Ensure reasonable size
  }

  static async generateCertificatePDF(templateData: TemplateData, data: CertificateData): Promise<Buffer> {
    const doc = new jsPDF({ 
      orientation: 'landscape', 
      unit: 'mm', 
      format: 'a4',
      compress: true
    })
    
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    try {
      // Add background if exists
      if (templateData.backgroundImage && templateData.backgroundImage.startsWith('http')) {
        try {
          console.log('Loading background image:', templateData.backgroundImage)
          
          // Try the server-side method
          let base64: string
          try {
            base64 = await getImageAsBase64(templateData.backgroundImage)
          } catch (fetchError) {
            console.warn('Server-side fetch failed, trying canvas method:', fetchError)
            base64 = await getImageAsBase64Canvas(templateData.backgroundImage)
          }
          
          // Determine image format from base64 data
          let format = 'JPEG'
          if (base64.includes('data:image/png')) {
            format = 'PNG'
          } else if (base64.includes('data:image/gif')) {
            format = 'GIF'
          } else if (base64.includes('data:image/webp')) {
            format = 'WEBP'
          }
          
          console.log('Adding background image with format:', format)
          doc.addImage(base64, format, 0, 0, pageWidth, pageHeight)
          
        } catch (error) {
          console.warn('Could not load background image:', error)
          console.warn('Using fallback background')
          
          // Fallback background with gradient effect
          doc.setFillColor(240, 242, 247)
          doc.rect(0, 0, pageWidth, pageHeight, 'F')
          
          // Add subtle pattern
          doc.setFillColor(235, 237, 242)
          for (let i = 0; i < pageWidth; i += 20) {
            for (let j = 0; j < pageHeight; j += 20) {
              if ((i + j) % 40 === 0) {
                doc.circle(i, j, 0.5, 'F')
              }
            }
          }
        }
      } else {
        // Default background with gradient effect
        doc.setFillColor(248, 249, 250)
        doc.rect(0, 0, pageWidth, pageHeight, 'F')
        
        // Add subtle gradient effect
        doc.setFillColor(245, 247, 250)
        doc.ellipse(pageWidth/2, pageHeight/2, pageWidth/3, pageHeight/4, 'F')
      }

      // Process each component
      for (let i = 0; i < templateData.components.length; i++) {
        const component = templateData.components[i]
        try {
          const processedContent = this.replaceTemplatePlaceholders(component.content, data)
          const { x, y } = component.style.position
          
          // Convert percentage position to mm
          const xPos = (x / 100) * pageWidth
          const yPos = (y / 100) * pageHeight

          if (component.type === 'text') {
            // Set text properties
            const fontSize = this.convertFontSize(component.style.fontSize || '16px')
            const fontWeight = this.convertFontWeight(component.style.fontWeight || 'normal')
            const textAlign = this.convertTextAlign(component.style.textAlign || 'left')
            const color = this.hexToRgb(component.style.color || '#000000')

            doc.setFontSize(fontSize)
            doc.setFont('helvetica', fontWeight)
            doc.setTextColor(color.r, color.g, color.b)

            // Handle multi-line text
            const lines = processedContent.split('\n').filter(line => line.trim())
            const lineHeight = fontSize * 0.4 // Convert to mm
            
            lines.forEach((line, lineIndex) => {
              if (line.trim()) {
                const yPosition = yPos + (lineIndex * lineHeight)
                doc.text(line.trim(), xPos, yPosition, { align: textAlign })
              }
            })

          } else if (component.type === 'shape') {
            // Draw shapes
            const width = parseFloat(component.style.width?.replace('px', '') || '100') * 0.26 // Convert px to mm roughly
            const height = parseFloat(component.style.height?.replace('px', '') || '100') * 0.26
            const bgColor = this.hexToRgb(component.style.backgroundColor || '#3b82f6')
            const borderRadius = parseFloat(component.style.borderRadius?.replace('px', '') || '0')

            doc.setFillColor(bgColor.r, bgColor.g, bgColor.b)
            
            if (borderRadius > 0) {
              // Rounded rectangle (simplified)
              doc.roundedRect(xPos - width/2, yPos - height/2, width, height, borderRadius * 0.26, borderRadius * 0.26, 'F')
            } else {
              doc.rect(xPos - width/2, yPos - height/2, width, height, 'F')
            }

          } else if (component.type === 'image') {
            // Handle image components
            if (processedContent.startsWith('http')) {
              try {
                // Try to load the image using server-side method
                const imageBase64 = await getImageAsBase64(processedContent)
                const width = parseFloat(component.style.width?.replace('px', '') || '100') * 0.26
                const height = parseFloat(component.style.height?.replace('px', '') || '100') * 0.26
                
                // Determine format from base64 data
                let format = 'JPEG'
                if (imageBase64.includes('data:image/png')) format = 'PNG'
                else if (imageBase64.includes('data:image/gif')) format = 'GIF'
                else if (imageBase64.includes('data:image/webp')) format = 'WEBP'
                
                doc.addImage(imageBase64, format, xPos - width/2, yPos - height/2, width, height)
              } catch (imageError) {
                console.warn('Could not load component image:', imageError)
                // Add placeholder
                const width = parseFloat(component.style.width?.replace('px', '') || '100') * 0.26
                const height = parseFloat(component.style.height?.replace('px', '') || '100') * 0.26
                
                doc.setDrawColor(200, 200, 200)
                doc.setLineWidth(0.5)
                doc.rect(xPos - width/2, yPos - height/2, width, height)
                
                doc.setFontSize(8)
                doc.setTextColor(150, 150, 150)
                doc.text('IMAGE', xPos, yPos, { align: 'center' })
              }
            } else {
              // Add placeholder for non-URL images
              const width = parseFloat(component.style.width?.replace('px', '') || '100') * 0.26
              const height = parseFloat(component.style.height?.replace('px', '') || '100') * 0.26
              
              doc.setDrawColor(200, 200, 200)
              doc.setLineWidth(0.5)
              doc.rect(xPos - width/2, yPos - height/2, width, height)
              
              doc.setFontSize(8)
              doc.setTextColor(150, 150, 150)
              doc.text('IMAGE', xPos, yPos, { align: 'center' })
            }
          }

        } catch (componentError) {
          console.error(`Error processing component ${component.id}:`, componentError)
          // Continue with other components
        }
      }

      // Add certificate border
      doc.setDrawColor(52, 152, 219)
      doc.setLineWidth(1)
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

      // Add inner border
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      doc.rect(15, 15, pageWidth - 30, pageHeight - 30)

      // Add certificate ID
      const certId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      doc.setFontSize(8)
      doc.setTextColor(149, 165, 166)
      doc.text(`Certificate ID: ${certId}`, 20, pageHeight - 15)

      // Add generation timestamp
      const timestamp = new Date().toLocaleDateString('id-ID')
      doc.text(`Generated: ${timestamp}`, pageWidth - 60, pageHeight - 15)

    } catch (error) {
      console.error('Error generating PDF:', error)
      
      // Fallback: Create a simple error PDF
      doc.setFontSize(16)
      doc.setTextColor(255, 0, 0)
      doc.text('Error generating certificate', pageWidth / 2, pageHeight / 2, { align: 'center' })
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text('Please check your template configuration', pageWidth / 2, pageHeight / 2 + 10, { align: 'center' })
    }

    return Buffer.from(doc.output('arraybuffer'))
  }

  static async generateCertificatesZip(templateData: TemplateData, certificateData: CertificateData[]): Promise<Buffer> {
    const zip = new JSZip()
    const errors: string[] = []

    // Generate PDFs in batches to avoid memory issues
    const batchSize = 10
    for (let i = 0; i < certificateData.length; i += batchSize) {
      const batch = certificateData.slice(i, i + batchSize)
      
      await Promise.all(batch.map(async (data, batchIndex) => {
        const actualIndex = i + batchIndex
        try {
          const pdf = await this.generateCertificatePDF(templateData, data)
          
          // Generate filename from data
          const nameField = data.nama || data.name || data.participant || data.peserta || `participant_${actualIndex + 1}`
          const cleanName = String(nameField).replace(/[^\w\s.-]/g, '').replace(/\s+/g, '_')
          const fileName = `certificate_${cleanName}_${actualIndex + 1}.pdf`
          
          zip.file(fileName, pdf)
        } catch (error) {
          const errorMsg = `Error generating certificate for row ${actualIndex + 1}: ${error}`
          console.error(errorMsg)
          errors.push(errorMsg)
        }
      }))
    }

    // Add error log if there were errors
    if (errors.length > 0) {
      const errorLog = `Generation Errors:\n${errors.join('\n')}\n\nGenerated: ${new Date().toISOString()}`
      zip.file('generation_errors.txt', errorLog)
    }

    // Add summary
    const summary = `Certificate Generation Summary
Template: ${templateData.templateName}
Event: ${templateData.eventName}
Total Records: ${certificateData.length}
Successful: ${certificateData.length - errors.length}
Errors: ${errors.length}
Generated: ${new Date().toISOString()}`

    zip.file('generation_summary.txt', summary)

    return await zip.generateAsync({ 
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    })
  }

  // Utility method to validate template data
  static validateTemplate(templateData: TemplateData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!templateData.templateName || templateData.templateName.trim() === '') {
      errors.push('Template name is required')
    }

    if (!templateData.components || templateData.components.length === 0) {
      errors.push('Template must have at least one component')
    }

    templateData.components?.forEach((component, index) => {
      if (!component.id || component.id.trim() === '') {
        errors.push(`Component ${index + 1} is missing an ID`)
      }

      if (!['text', 'image', 'shape'].includes(component.type)) {
        errors.push(`Component ${index + 1} has invalid type: ${component.type}`)
      }

      if (component.type === 'text' && (!component.content || component.content.trim() === '')) {
        errors.push(`Text component ${index + 1} has no content`)
      }

      if (!component.style?.position || typeof component.style.position.x !== 'number' || typeof component.style.position.y !== 'number') {
        errors.push(`Component ${index + 1} has invalid position`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}