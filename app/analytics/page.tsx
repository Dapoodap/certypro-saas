"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { Award, TrendingUp, Users, FileText, Calendar, BarChart3, PieChart, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { useGetAllCertif } from "@/hooks/useGetAllCertifcate"
import { useGetAllTemplates } from "@/hooks/useGetAllTemplates"

interface Certificate {
  id: string;
  name: string;
  fileUrl: string;
  participant: number;
  userId: string;
  createdAt: string;
}

interface Template {
  id: string;
  name: string;
  data: any;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  
  const {
    data: certificates,
    error: certificatesError,
    isLoading: certificatesLoading,
  } = useGetAllCertif();
  
  const {
    data: templates,
    error: templatesError,
    isLoading: templatesLoading,
  } = useGetAllTemplates();

  // Calculate real statistics from API data only
  const statistics = useMemo(() => {
    if (!certificates || !templates) {
      return {
        totalCertificates: 0,
        totalParticipants: 0,
        totalTemplates: 0,
        avgParticipantsPerCertificate: 0,
        certificatesThisMonth: 0,
        participantsThisMonth: 0,
        templatesThisMonth: 0
      }
    }

    const totalCertificates = certificates.length
    const totalTemplates = templates.length
    
    // Calculate total participants from actual data
    const totalParticipants = certificates.reduce((sum, cert) => {
      return sum + (cert.participant || 0)
    }, 0)
    
    // Calculate average participants per certificate
    const avgParticipantsPerCertificate = totalCertificates > 0 
      ? Math.round(totalParticipants / totalCertificates) 
      : 0

    // Calculate current month data
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    const certificatesThisMonth = certificates.filter(cert => {
      const certDate = new Date(cert.createdAt)
      return certDate.getMonth() === currentMonth && certDate.getFullYear() === currentYear
    }).length

    const participantsThisMonth = certificates
      .filter(cert => {
        const certDate = new Date(cert.createdAt)
        return certDate.getMonth() === currentMonth && certDate.getFullYear() === currentYear
      })
      .reduce((sum, cert) => sum + (cert.participant || 0), 0)

    const templatesThisMonth = templates.filter(template => {
      const templateDate = new Date(template.createdAt)
      return templateDate.getMonth() === currentMonth && templateDate.getFullYear() === currentYear
    }).length
    
    return {
      totalCertificates,
      totalParticipants,
      totalTemplates,
      avgParticipantsPerCertificate,
      certificatesThisMonth,
      participantsThisMonth,
      templatesThisMonth
    }
  }, [certificates, templates])

  // Generate chart data based on real data
  const chartData = useMemo(() => {
    if (!certificates || !templates) return { 
      monthlyTrend: [], 
      templateUsage: [], 
      participantDistribution: [], 
      topPerforming: [] 
    }

    // Monthly trend data based on actual certificate creation dates
    const generateMonthlyTrend = () => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const currentDate = new Date()
      const data = []
      
      // Get last 6 months of data
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const month = months[date.getMonth()]
        const year = date.getFullYear()
        
        const monthCertificates = certificates.filter(cert => {
          const certDate = new Date(cert.createdAt)
          return certDate.getMonth() === date.getMonth() && 
                 certDate.getFullYear() === date.getFullYear()
        })

        const monthParticipants = monthCertificates.reduce((sum, cert) => 
          sum + (cert.participant || 0), 0
        )

        data.push({
          month: `${month} ${year}`,
          certificates: monthCertificates.length,
          participants: monthParticipants
        })
      }
      
      return data
    }

    // Template usage distribution based on certificate names/templates
    const generateTemplateUsage = () => {
      const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#84cc16"]
      
      // Group certificates by template (assuming certificate names represent templates)
      const templateMap = new Map()
      
      certificates.forEach(cert => {
        const templateName = cert.name || 'Unnamed Certificate'
        if (templateMap.has(templateName)) {
          templateMap.set(templateName, templateMap.get(templateName) + 1)
        } else {
          templateMap.set(templateName, 1)
        }
      })

      // Convert to array and get top 5
      const templateArray = Array.from(templateMap.entries())
        .map(([name, count]) => ({ name, value: count }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)

      return templateArray.map((item, index) => ({
        ...item,
        color: colors[index % colors.length]
      }))
    }

    // Participant distribution based on certificate participant counts
    const generateParticipantDistribution = () => {
      const ranges = [
        { range: '1-10', min: 1, max: 10 },
        { range: '11-25', min: 11, max: 25 },
        { range: '26-50', min: 26, max: 50 },
        { range: '51-100', min: 51, max: 100 },
        { range: '100+', min: 101, max: Infinity }
      ]

      return ranges.map(({ range, min, max }) => ({
        range,
        count: certificates.filter(cert => {
          const participants = cert.participant || 0
          return participants >= min && participants <= max
        }).length
      }))
    }

    // Top performing certificates based on participant count
    const generateTopPerforming = () => {
      return certificates
        .sort((a, b) => (b.participant || 0) - (a.participant || 0))
        .slice(0, 5)
        .map(cert => ({
          name: cert.name || 'Unnamed Certificate',
          participants: cert.participant || 0,
          createdAt: new Date(cert.createdAt).toLocaleDateString()
        }))
    }

    return {
      monthlyTrend: generateMonthlyTrend(),
      templateUsage: generateTemplateUsage(),
      participantDistribution: generateParticipantDistribution(),
      topPerforming: generateTopPerforming()
    }
  }, [certificates, templates, timeRange])

  // Generate recent activity based on real data
  const recentActivity = useMemo(() => {
    if (!certificates) return []

    return certificates
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(cert => {
        const createdDate = new Date(cert.createdAt)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - createdDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        const timeAgo = diffDays === 1 ? '1 day ago' : 
                       diffDays < 7 ? `${diffDays} days ago` :
                       diffDays < 30 ? `${Math.ceil(diffDays / 7)} weeks ago` :
                       `${Math.ceil(diffDays / 30)} months ago`

        return {
          action: 'Certificate created',
          name: cert.name || 'Unnamed Certificate',
          time: timeAgo,
          participants: cert.participant || 0
        }
      })
  }, [certificates])

  if (certificatesLoading || templatesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    )
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
            <div className="flex items-center space-x-4">
              <Link href="/certificates">
                <Button variant="outline">View Certificates</Button>
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
            <p className="text-xl text-gray-600">Track your certificate generation performance and insights</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Certificates</p>
                  <p className="text-3xl font-bold">{statistics.totalCertificates.toLocaleString()}</p>
                  <p className="text-blue-200 text-sm mt-1">{statistics.certificatesThisMonth} this month</p>
                </div>
                <div className="bg-blue-400/30 p-3 rounded-lg">
                  <FileText className="w-8 h-8 text-blue-100" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Participants</p>
                  <p className="text-3xl font-bold">{statistics.totalParticipants.toLocaleString()}</p>
                  <p className="text-green-200 text-sm mt-1">{statistics.participantsThisMonth} this month</p>
                </div>
                <div className="bg-green-400/30 p-3 rounded-lg">
                  <Users className="w-8 h-8 text-green-100" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Total Templates</p>
                  <p className="text-3xl font-bold">{statistics.totalTemplates.toLocaleString()}</p>
                  <p className="text-purple-200 text-sm mt-1">{statistics.templatesThisMonth} this month</p>
                </div>
                <div className="bg-purple-400/30 p-3 rounded-lg">
                  <Award className="w-8 h-8 text-purple-100" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Avg. Participants</p>
                  <p className="text-3xl font-bold">{statistics.avgParticipantsPerCertificate}</p>
                  <p className="text-orange-200 text-sm mt-1">per certificate</p>
                </div>
                <div className="bg-orange-400/30 p-3 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-orange-100" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Trend */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Monthly Trend
              </CardTitle>
              <CardDescription>Certificates and participants over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  certificates: {
                    label: "Certificates",
                    color: "hsl(var(--chart-1))",
                  },
                  participants: {
                    label: "Participants",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="certificates"
                      stackId="1"
                      stroke="var(--color-certificates)"
                      fill="var(--color-certificates)"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="participants"
                      stackId="2"
                      stroke="var(--color-participants)"
                      fill="var(--color-participants)"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Template Usage Distribution */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Certificate Distribution
              </CardTitle>
              <CardDescription>Most used certificate types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <RechartsPieChart data={chartData.templateUsage} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                      {chartData.templateUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white p-3 border rounded-lg shadow-lg">
                              <p className="font-medium">{data.name}</p>
                              <p className="text-sm text-gray-600">{data.value} certificates</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Participant Distribution */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Participant Distribution
              </CardTitle>
              <CardDescription>Certificates grouped by participant count</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Certificates",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.participantDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Top Performing Certificates */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Top Performing Certificates
              </CardTitle>
              <CardDescription>Certificates with highest participant count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chartData.topPerforming.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{cert.name}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span>Created: {cert.createdAt}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{cert.participants}</div>
                      <div className="text-xs text-gray-500">participants</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest certificate creation activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{activity.time}</p>
                    <p className="text-xs text-gray-400">{activity.participants} participants</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}