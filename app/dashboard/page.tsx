"use client";

import type React from "react";

import { useState } from "react";
import {
  Award,
  Upload,
  FileText,
  Download,
  Settings,
  LogOut,
  Plus,
  Users,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { read, utils } from "xlsx";
import { useGenerate } from "@/hooks/useGenerate";
import { useGetAllCertif } from "@/hooks/useGetAllCertifcate";
import { useGetAllTemplates } from "@/hooks/useGetAllTemplates";
import { toast } from "@/hooks/use-toast";

type Template = {
  id: string;     // pastikan ini string, kalau number ubah jadi string pakai String(template.id)
  name: string;
};

export default function DashboardPage() {
  const { trigger, data, error, isMutating, reset } = useGenerate();
  const [activeTab, setActiveTab] = useState<string>("");
  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const {
    data: certificates,
    error: certificatesError,
    isLoading: certificatesLoading,
  } = useGetAllCertif();
  const {
    data: templates,
    error: templatesError,
    isLoading: templatesLoading,
    mutate: templatesMutate,
  } = useGetAllTemplates();
  const handleDownload = async (fileUrl: string) => {
    try {
      const res = await fetch(fileUrl);

      if (!res.ok) {
        throw new Error("Gagal mengunduh file");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      // Ambil nama file dari URL
      const fileName = fileUrl.split("/").pop() || "certificate.zip";
      link.download = fileName;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Gagal mengunduh file.");
    }
  };
  const formattedDate = (dateString: string) => {
    const date = new Date(dateString);

    const options: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Jakarta", // wajib untuk WIB
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    const formatted = date.toLocaleString("id-ID", options);
    return formatted;
  };
  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut({
        redirect: false, // Tidak auto redirect
      });

      // Custom redirect logic
      router.push("/login");
      // atau bisa ke halaman lain
      // router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith(".xlsx")) {
      setUploadedFile(file);
    }
  };

  const handleGenerateCertificates = async () => {
    // Handle certificate generation logic
    console.log("Generating certificates...");
    if (!uploadedFile || !eventName) return alert("Lengkapi semua data");

    const buffer = await uploadedFile.arrayBuffer();
    const workbook = read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = utils.sheet_to_json(sheet);
    const peserta = json.map((row: any) => ({
      nama: row.nama,
      email: row.email,
    }));
    

    try {
      const res = await trigger({
        templateId: activeTab,
        file: uploadedFile,
        generationName: eventName,
        participants : peserta.length
        // userId: "3ae5a6de-fa83-4c11-994a-1aae2dbb8c06",
      });
      handleDownload(res.downloadUrl);
toast({
      title: "Sukses",
      description: "Data berhasil disimpan.",
      duration: 1000,
      variant: "success", // atau "destructive" untuk error
    })    } catch (error) {
      toast({
      title: "Gagal",
      description: "Data Gagal disimpan.",
      duration: 1000,
      variant: "destructive", // atau "destructive" untuk error
    })  
      console.log(error);
    }
  };


  const handleTemplateChange = (value: string): void => {
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CertifyPro
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                {loading ? <span>Loading...</span> : <span>Logout</span>}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {certificatesLoading ? (
        <>Loading ...</>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Certificates</p>
                    <p className="text-3xl font-bold">1,234</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">This Month</p>
                    <p className="text-3xl font-bold">156</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Templates</p>
                    <p className="text-3xl font-bold">8</p>
                  </div>
                  <Award className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Recipients</p>
                    <p className="text-3xl font-bold">892</p>
                  </div>
                  <Users className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div> */}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Certificate Generator */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                    <Plus className="w-6 h-6 mr-2" />
                    Generate Certificates
                  </CardTitle>
                  <CardDescription>
                    Upload your participant list and customize your certificate
                    template
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="file-upload"
                      className="text-gray-700 font-medium"
                    >
                      Upload Participant List (XLSX)
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <input
                        id="file-upload"
                        type="file"
                        accept=".xlsx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">
                          {uploadedFile
                            ? uploadedFile.name
                            : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-sm text-gray-500">XLSX files only</p>
                      </label>
                    </div>
                  </div>

                  {/* Template Selection */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">
                      Certificate Template
                    </Label>
                  <Select value={activeTab} onValueChange={handleTemplateChange}>
      <SelectTrigger className="h-12">
        <SelectValue placeholder="Select a template" />
      </SelectTrigger>
      <SelectContent>
        {templates?.map((template) => (
          <SelectItem key={template.id} value={template.id}>
            {template.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
                  </div>

                  {/* Certificate Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="event-name"
                        className="text-gray-700 font-medium"
                      >
                        Event Name
                      </Label>
                      <Input
                        onChange={(e) => setEventName(e.target.value)}
                        id="event-name"
                        placeholder="e.g., Web Development Workshop"
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="event-date"
                        className="text-gray-700 font-medium"
                      >
                        Event Date
                      </Label>
                      <Input id="event-date" type="date" className="h-12" />
                    </div>
                  </div>

                  {/* <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-gray-700 font-medium"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the achievement or event"
                      className="min-h-[100px]"
                    />
                  </div> */}

                  <Button
                    onClick={handleGenerateCertificates}
                
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
                    disabled={!uploadedFile || !eventName || isMutating}
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    {isMutating ? "Generating..." : "Generate Certificates"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Award className="w-4 h-4 mr-2" />
                    <Link href="/dashboard/templates/list">Manage Templates</Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" /> 
                    <Link href="/dashboard/templates">Create New</Link>

                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    View All Certificates
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    <Link href="/analytics">Analytics Dashboard
</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-xl h-96 overflow-y-auto bg-white/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                {
                  certificatesLoading ? (
                    <>Loading ...</>
                  ) : (
                    <CardContent className="space-y-4">
                  {certificates && !certificatesLoading && !certificatesError && certificates.length > 0 ? (
                      certificates?.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {activity.name}
                          </p>
                          <p className="text-sm text-gray-600">{activity.participant} certificates</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {formattedDate(activity.createdAt)}
                          </p>
                          <Button
                            onClick={() => handleDownload(activity.fileUrl)}
                            variant="outline"
                            size="sm"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                    ): (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            No recent activity
                          </p>
                        </div>
                      </div>
                    )}
                </CardContent>
                  )
                }
              </Card>

              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
