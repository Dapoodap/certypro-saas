import useSWRMutation from 'swr/mutation'

type Peserta = {
  nama: string
  email: string
}

type GeneratePayload = {
  participants: number
  templateId: string  // ganti dari templateHtml ke templateId
  file: File // tambah file
  generationName: string
}

// Custom fetcher untuk FormData
async function formDataPoster(url: string, payload: GeneratePayload) {
  const formData = new FormData()
  
  formData.append('templateId', payload.templateId)
  // formData.append('userId', payload.userId)
  formData.append('generationName', payload.generationName)
  formData.append('file', payload.file)

  const response = await fetch(url, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Generate failed')
  }

  return response.json()
}

export function useGenerate() {
  const mutation = useSWRMutation(
    '/api/generate', // adjust endpoint
    (url, { arg }: { arg: GeneratePayload }) => formDataPoster(url, arg)
  )

  return mutation
}

// Usage example:
// const generate = useGenerate()
// 
// const handleGenerate = async () => {
//   try {
//     const result = await generate.trigger({
//       templateId: 'template-id',
//       file: selectedFile,
//       generationName: 'Batch 1',
//       userId: 'user-id'
//     })
//     console.log('Generated:', result)
//   } catch (error) {
//     console.error('Error:', error)
//   }
// }