"use client"

import type React from "react"
import { useState } from "react"
import { getAuthClient, getDbClient } from "@/helpers/firebase/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus, ArrowRight } from "lucide-react"
import Link from "next/link"

interface SignUpFormData {
  name: string
  role: string
  email: string
  password: string
}

export default function SignUp() {
  const router = useRouter()
  const [formData, setFormData] = useState<SignUpFormData>({
    name: "",
    role: "Individual",
    email: "",
    password: "",
  })
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const handleInputChange = (field: keyof Omit<SignUpFormData, "role">) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }))
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }))
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const auth = getAuthClient()
      const db = getDbClient()

      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      // Store extra info in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        createdAt: serverTimestamp(),
      })

      router.push("/dashboard")
    } catch (err) {
      console.error(err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-white overflow-hidden relative py-8">
      {/* Unified Cool Background - Same as landing page */}
      <div className="fixed inset-0 z-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950" />

        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-teal-500/6 rounded-full blur-3xl animate-pulse delay-2000" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Subtle noise texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.01),transparent_70%)]" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-20 h-20 bg-green-400/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-16 h-16 bg-emerald-400/10 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 right-10 w-12 h-12 bg-teal-400/10 rounded-full blur-xl animate-pulse delay-2000" />

      <div className="relative z-10 w-full max-w-md px-4 animate-fade-in-up">
        <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 shadow-2xl hover:shadow-green-500/10 transition-all duration-500 transform hover:scale-[1.02]">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm animate-pulse">
                  <UserPlus className="w-8 h-8 text-green-400" />
                </div>
                <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl animate-pulse" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Join ReCircuit
            </CardTitle>
            <CardDescription className="text-slate-400">
              Create your account and start making a difference
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 backdrop-blur-sm animate-fade-in">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300 font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  required
                  disabled={loading}
                  className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-green-400/50 focus:ring-green-400/20 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-300 font-medium">
                  Account Type
                </Label>
                <Select value={formData.role} onValueChange={handleRoleChange} disabled={loading}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white focus:border-green-400/50 focus:ring-green-400/20 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70">
                    <SelectValue placeholder="Select your account type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="Individual" className="hover:bg-slate-700 focus:bg-slate-700">
                      Individual
                    </SelectItem>
                    <SelectItem value="Organization" className="hover:bg-slate-700 focus:bg-slate-700">
                      Organization
                    </SelectItem>
                    <SelectItem value="NGO" className="hover:bg-slate-700 focus:bg-slate-700">
                      NGO
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange("email")}
                  required
                  disabled={loading}
                  className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-green-400/50 focus:ring-green-400/20 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300 font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  required
                  disabled={loading}
                  className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-green-400/50 focus:ring-green-400/20 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70"
                />
              </div>

              <Button
                type="submit"
                className="w-full group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-700/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800/50 px-2 text-slate-400 backdrop-blur-sm">Already have an account?</span>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="group inline-flex items-center font-medium text-green-400 hover:text-green-300 transition-colors duration-300"
              >
                Sign in instead
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Brand Footer */}
        <div className="mt-8 text-center animate-fade-in-up delay-300">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-slate-900 font-bold text-xs">RC</span>
            </div>
            <span className="text-lg font-bold">
              <span className="text-green-400">Re</span>
              <span className="text-slate-300">Circuit</span>
            </span>
          </div>
          <p className="text-slate-400 text-sm">Making electronics sustainable, one device at a time.</p>
        </div>
      </div>
    </div>
  )
}
