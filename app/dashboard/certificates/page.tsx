"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Award,
  Search,
  Filter,
  Download,
  Eye,
  Users,
  FileText,
  MoreHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Certificate {
  id: string
  name: string
  template: string
  participants: number
  createdAt: string
  status: "completed" | "processing" | "failed"
  downloadCount: number
  thumbnail: string
  eventDate: string
  description: string
}

export default function CertificatesPage() {
  const [certificates] = useState<Certificate[]>([
    {
      id: "cert-001",
      name: "Web Development Bootcamp 2024",
      template: "Modern Certificate",
      participants: 45,
      createdAt: "2024-01-20",
      status: "completed",
      downloadCount: 127,
      thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200",
      eventDate: "2024-01-15",
      description: "Completion certificate for intensive web development training",
    },
    {
      id: "cert-002",
      name: "Digital Marketing Workshop",
      template: "Corporate Certificate",
      participants: 23,
      createdAt: "2024-01-18",
      status: "completed",
      downloadCount: 89,
      thumbnail: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=200",
      eventDate: "2024-01-12",
      description: "Professional digital marketing certification program",
    },
    {
      id: "cert-003",
      name: "Data Science Fundamentals",
      template: "Academic Certificate",
      participants: 67,
      createdAt: "2024-01-15",
      status: "processing",
      downloadCount: 0,
      thumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&h=200",
      eventDate: "2024-01-10",
      description: "Introduction to data science and analytics",
    },
    {
      id: "cert-004",
      name: "UI/UX Design Masterclass",
      template: "Creative Certificate",
      participants: 34,
      createdAt: "2024-01-12",
      status: "completed",
      downloadCount: 156,
      thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=300&h=200",
      eventDate: "2024-01-08",
      description: "Advanced UI/UX design principles and practices",
    },
    {
      id: "cert-005",
      name: "Cybersecurity Awareness",
      template: "Security Certificate",
      participants: 89,
      createdAt: "2024-01-10",
      status: "failed",
      downloadCount: 0,
      thumbnail: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200",
      eventDate: "2024-01-05",
      description: "Essential cybersecurity training for professionals",
    },
    {
      id: "cert-006",
      name: "Project Management Essentials",
      template: "Professional Certificate",
      participants: 56,
      createdAt: "2024-01-08",
      status: "completed",
      downloadCount: 203,
      thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200",
      eventDate: "2024-01-03",
      description: "Comprehensive project management methodology training",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredCertificates = certificates
    .filter(
      (cert) =>
        cert.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (statusFilter === "all" || cert.status === statusFilter),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "participants":
          return b.participants - a.participants
        case "downloads":
          return b.downloadCount - a.downloadCount
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage)
  const paginatedCertificates = filteredCertificates.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
            <div className="flex items-center space-x-4">
              <Link href="/analytics">
                <Button variant="outline">Analytics</Button>
              </Link>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">All Certificates</h1>
          <p className="text-xl text-gray-600">Manage and download your generated certificates</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Certificates</p>
                  <p className="text-3xl font-bold">{certificates.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Participants</p>
                  <p className="text-3xl font-bold">{certificates.reduce((sum, cert) => sum + cert.participants, 0)}</p>
                </div>
                <Users className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Total Downloads</p>
                  <p className="text-3xl font-bold">
                    {certificates.reduce((sum, cert) => sum + cert.downloadCount, 0)}
                  </p>
                </div>
                <Download className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Completed</p>
                  <p className="text-3xl font-bold">{certificates.filter((c) => c.status === "completed").length}</p>
                </div>
                <Award className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search certificates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 h-12">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 h-12">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date Created</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="participants">Participants</SelectItem>
                    <SelectItem value="downloads">Downloads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paginatedCertificates.map((certificate) => (
            <Card
              key={certificate.id}
              className="border-0 shadow-xl bg-white/80 backdrop-blur-md hover:shadow-2xl transition-shadow"
            >
              <div className="relative">
                <img
                  src={certificate.thumbnail || "/placeholder.svg"}
                  alt={certificate.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <Badge className={`absolute top-2 right-2 ${getStatusColor(certificate.status)}`}>
                  {certificate.status}
                </Badge>
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-gray-900 mb-2">{certificate.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-600 mb-3">{certificate.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="w-4 h-4 mr-2" />
                        Download All
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Template:</span>
                    <span className="font-medium">{certificate.template}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Participants:</span>
                    <span className="font-medium">{certificate.participants}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Downloads:</span>
                    <span className="font-medium">{certificate.downloadCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{new Date(certificate.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Event Date:</span>
                    <span className="font-medium">{new Date(certificate.eventDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={certificate.status !== "completed"}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredCertificates.length)} of {filteredCertificates.length}{" "}
                  certificates
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? "bg-gradient-to-r from-blue-600 to-indigo-600" : ""}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {filteredCertificates.length === 0 && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <FileText className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No certificates found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search terms or filters</p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
