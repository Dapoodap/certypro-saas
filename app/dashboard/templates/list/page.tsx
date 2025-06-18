"use client"

import { useState } from "react"
import Link from "next/link"
import { Award, Plus, Edit, Trash2, Copy, Eye, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useGetAllTemplates } from "@/hooks/useGetAllTemplates"
import { useDeleteTemplate } from "@/hooks/useDeleteTemplate"
import { toast } from "@/hooks/use-toast"

interface SavedTemplate {
  id: string
  name: string
  thumbnail: string
  createdAt: string
  lastModified: string
  usage: number
}

export default function TemplateList() {
  // const [templates] = useState<SavedTemplate[]>([
  //   {
  //     id: "1",
  //     name: "Modern Certificate",
  //     thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300",
  //     createdAt: "2024-01-15",
  //     lastModified: "2024-01-20",
  //     usage: 45,
  //   },
  //   {
  //     id: "2",
  //     name: "Classic Achievement",
  //     thumbnail: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300",
  //     createdAt: "2024-01-10",
  //     lastModified: "2024-01-18",
  //     usage: 23,
  //   },
  //   {
  //     id: "3",
  //     name: "Corporate Training",
  //     thumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300",
  //     createdAt: "2024-01-05",
  //     lastModified: "2024-01-15",
  //     usage: 67,
  //   },
  // ])
    const {
      data: certificates,
      error: certificatesError,
      isLoading: certificatesLoading,
      mutate: certificatesMutate
    } = useGetAllTemplates();
    const {
      trigger: deleteTrigger,

    } = useDeleteTemplate();

  const [searchTerm, setSearchTerm] = useState("")

  const filteredTemplates = certificates && certificates.filter((template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  async function handleDelete(id: any) {
   try {
    await deleteTrigger({
      id
    })
    await certificatesMutate();
    toast({
      title: "Sukses",
      description: "Data berhasil dihapus.",
      duration: 1000,
      variant: "success", // atau "destructive" untuk error
    }) 
   } catch (error) {
    toast({
          title: "Gagal",
          description: "Data gagal dihapus.",
          duration: 1000,
          variant: "destructive", // atau "destructive" untuk error
        }) 
    console.log(error)
   }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CertifyPro
              </span>
            </Link>
            <Link href="/templates">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Certificate Templates</h1>
          <p className="text-xl text-gray-600 mb-6">Manage your certificate templates and create new ones</p>

          {/* Search */}
          <div className="max-w-md">
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Template Card */}
          <Link href="/templates">
            <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer bg-white/50 backdrop-blur-md">
              <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Template</h3>
                <p className="text-gray-600">Start designing a new certificate template</p>
              </CardContent>
            </Card>
          </Link>

          {/* Template Cards */}
          {filteredTemplates && filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="border-0 shadow-xl bg-white/80 backdrop-blur-md hover:shadow-2xl transition-shadow"
            >
              <div className="relative">
                <img
                  src={"/placeholder.svg"}
                  alt={template.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                {/* <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  1 uses
                </div> */}
              </div>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900">{template.name}</CardTitle>
                <CardDescription>
                  Created: {new Date(template.createdAt).toLocaleDateString()}
                  <br />
                  Modified: {new Date(template.updatedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/dashboard/templates?edit=${template.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-1" />
                    Duplicate
                  </Button>
                  <Button onClick={() => handleDelete(template.id)} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates && filteredTemplates.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Award className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search terms</p>
            <Button onClick={() => setSearchTerm("")}>Clear Search</Button>
          </div>
        )}
      </div>
    </div>
  )
}
