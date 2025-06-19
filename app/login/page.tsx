"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Award, Eye, EyeOff, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter();
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  try {
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // Penting: set redirect ke false
    });

    console.log("SignIn response:", res); // Debug log

    if (res?.error) {
      setLoading(false)
      // Handle 
      //  error
      toast({
            title: "Gagal",
            description: res.error,
            duration: 3000,
            variant: "destructive", // atau "destructive" untuk error
          })  
      // Bisa tambahkan state untuk menampilkan error ke user
      // setError(res.error);
    } else if (res?.ok) {
      toast({
            title: "Sukses",
            description: 
            "Login Berhasil",
            duration: 3000,
            variant: "success", // atau "destructive" untuk error
          })  
      // Login berhasil
      console.log("Login successful");
      router.push("/dashboard");
            setLoading(false)

    }
  } catch (error) {
    toast({
            title: "Gagal",
            description: "something went wrong",
            duration: 3000,
            variant: "destructive", // atau "destructive" untuk error
          })
    setLoading(false)
    console.error("Unexpected error:", error);
  }
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              CertifyPro
            </span>
          </Link>
        </div>

        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-md">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome back</CardTitle>
            <CardDescription className="text-gray-600">Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                  Forgot password?
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
              >
                {loading ?                 <LoaderCircle className="animate-spin"/>
 : "Sign In"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {"Don't have an account? "}
                <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
