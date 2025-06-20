"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Award, Eye, EyeOff, Check, X, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRegister } from "@/hooks/useRegister"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface PasswordRequirement {
  text: string
  isValid: boolean
}

export default function SignupPage() {
  const router = useRouter();
  const { isMutating, trigger } = useRegister();
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([
    { text: "Minimal 8 karakter", isValid: false },
    { text: "Mengandung huruf besar (A-Z)", isValid: false },
    { text: "Mengandung huruf kecil (a-z)", isValid: false },
    { text: "Mengandung angka (0-9)", isValid: false },
    { text: "Mengandung karakter khusus (!@#$%^&*)", isValid: false },
  ])

  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const [isPasswordValid, setIsPasswordValid] = useState(false)

  // Validasi password requirements
  const validatePassword = (password: string) => {
    const requirements = [
      { text: "Minimal 8 karakter", isValid: password.length >= 8 },
      { text: "Mengandung huruf besar (A-Z)", isValid: /[A-Z]/.test(password) },
      { text: "Mengandung huruf kecil (a-z)", isValid: /[a-z]/.test(password) },
      { text: "Mengandung angka (0-9)", isValid: /\d/.test(password) },
      { text: "Mengandung karakter khusus (!@#$%^&*)", isValid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
    ]

    setPasswordRequirements(requirements)
    const allValid = requirements.every(req => req.isValid)
    setIsPasswordValid(allValid)
    
    return allValid
  }

  // Cek apakah password dan confirm password sama
  const checkPasswordsMatch = (password: string, confirmPassword: string) => {
    const match = password === confirmPassword
    setPasswordsMatch(match)
    return match
  }

  useEffect(() => {
    if (formData.password) {
      validatePassword(formData.password)
    }
    
    if (formData.confirmPassword) {
      checkPasswordsMatch(formData.password, formData.confirmPassword)
    }
  }, [formData.password, formData.confirmPassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validasi password requirements
    if (!isPasswordValid) {
      return toast({
        title: "Gagal",
        description: "Password tidak memenuhi persyaratan keamanan",
        duration: 3000,
        variant: "destructive",
      })
    }

    // Validasi password match
    if (!passwordsMatch) {
      return toast({
        title: "Gagal",
        description: "Password dan konfirmasi password tidak cocok",
        duration: 3000,
        variant: "destructive",
      })
    }

    // Handle signup logic here
    try {
      await trigger({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      toast({
        title: "Berhasil",
        description: "Akun berhasil dibuat!",
        duration: 3000,
        variant: "default",
      })
      router.push("/login")
    } catch (error) {
      console.log(error)
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat membuat akun",
        duration: 3000,
        variant: "destructive",
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const isFormValid = isPasswordValid && passwordsMatch && formData.name && formData.email

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
            <CardTitle className="text-2xl font-bold text-gray-900">Create your account</CardTitle>
            <CardDescription className="text-gray-600">
              Start generating professional certificates today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
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
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-12 ${
                      formData.password && !isPasswordValid ? 'border-red-300 focus:border-red-500' : ''
                    }`}
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
                
                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Persyaratan Password:</p>
                    <div className="space-y-1">
                      {passwordRequirements.map((requirement, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          {requirement.isValid ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <X className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`text-xs ${
                            requirement.isValid ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {requirement.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-12 ${
                      formData.confirmPassword && !passwordsMatch ? 'border-red-300 focus:border-red-500' : ''
                    } ${
                      formData.confirmPassword && passwordsMatch ? 'border-green-300 focus:border-green-500' : ''
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className="flex items-center space-x-2 mt-2">
                    {passwordsMatch ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-600">Password cocok</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 text-red-500" />
                        <span className="text-xs text-red-600">Password tidak cocok</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <Button
                type="submit"
                disabled={isMutating || !isFormValid}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMutating ? (
                    <LoaderCircle className="w-5 h-5 animate-spin" />
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}