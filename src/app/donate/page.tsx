"use client"

import type React from "react"
import { useState } from "react"
import { Upload, MapPin, Heart, CheckCircle, ArrowRight } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/sidebar"
import { getDbClient, app } from "@/helpers/firebase/firebase"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

interface DonationFormData {
  file: File | null
  pickupLocation: string
  notes: string
}

export default function DonatePage() {
  const { user, loading } = useAuth()
  const [formData, setFormData] = useState<DonationFormData>({
    file: null,
    pickupLocation: "",
    notes: "",
  })
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)
  const [uploading, setUploading] = useState<boolean>(false)

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, file: selectedFile }))
  }

  const handleInputChange =
    (field: keyof Omit<DonationFormData, "file">) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !formData.file) return

    setUploading(true)
    try {
      const storage = getStorage(app)
      const db = getDbClient()

      const fileRef = ref(storage, `donations/${user.uid}/${Date.now()}-${formData.file.name}`)
      await uploadBytes(fileRef, formData.file)
      const imageUrl = await getDownloadURL(fileRef)

      // ✅ Dynamically import Tesseract only when needed on client
      const Tesseract = await import("tesseract.js")
      const {
        data: { text: extractedText },
      } = await Tesseract.recognize(formData.file, "eng")

      await addDoc(collection(db, "donateSubmissions"), {
        userId: user.uid,
        pickupLocation: formData.pickupLocation,
        notes: formData.notes,
        imageUrl,
        extractedText,
        createdAt: serverTimestamp(),
      })

      setSubmitted(true)
    } catch (err) {
      console.error("Error processing donation:", err)
    }
    setUploading(false)
  }

  const resetForm = () => {
    setSubmitted(false)
    setFormData({
      file: null,
      pickupLocation: "",
      notes: "",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white relative overflow-hidden">
        {/* Unified Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-teal-500/6 rounded-full blur-3xl animate-pulse delay-2000" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        <div className="relative z-10 text-center space-y-4">
          <div className="w-16 h-16 border-4 border-pink-400/30 border-t-pink-400 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-300 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white relative overflow-hidden">
        {/* Unified Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-teal-500/6 rounded-full blur-3xl animate-pulse delay-2000" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        <div className="relative z-10 p-6">
          <Alert className="max-w-md bg-slate-800/30 backdrop-blur-md border-slate-700/50">
            <AlertDescription className="text-slate-300">Please sign in to donate items.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (user.role === "ngo") {
    return (
      <div className="min-h-screen flex items-center justify-center text-white relative overflow-hidden">
        {/* Unified Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-teal-500/6 rounded-full blur-3xl animate-pulse delay-2000" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        <div className="relative z-10 p-6">
          <Alert className="max-w-md bg-slate-800/30 backdrop-blur-md border-slate-700/50">
            <AlertDescription className="text-slate-300">
              NGOs cannot donate items through this platform.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Unified Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-teal-500/6 rounded-full blur-3xl animate-pulse delay-2000" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.01),transparent_70%)]" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-20 h-20 bg-pink-400/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-16 h-16 bg-green-400/10 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 right-10 w-12 h-12 bg-emerald-400/10 rounded-full blur-xl animate-pulse delay-2000" />

      <div className="relative z-10">
        <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Backdrop blur overlay when sidebar is open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-all duration-300 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="pt-16 p-6 flex justify-center max-w-7xl mx-auto">
          {submitted ? (
            <Card className="max-w-md w-full bg-slate-800/30 backdrop-blur-md border border-slate-700/50 shadow-2xl hover:shadow-green-500/10 transition-all duration-500 transform hover:scale-[1.02]">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm animate-pulse">
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                    <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl animate-pulse" />
                  </div>
                </div>
                <CardTitle className="flex items-center justify-center gap-2 text-xl bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  <Heart className="h-5 w-5 text-pink-500" />
                  Thank You for Your Donation!
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Your donation has been submitted successfully and will be processed soon. We&apos;ll connect you with those
                  in need.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator className="bg-slate-700/50" />
                <div className="flex justify-center">
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="group bg-transparent border-slate-600 hover:border-pink-400 text-slate-300 hover:text-white hover:bg-pink-400/10 transition-all duration-300"
                  >
                    Make Another Donation
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-lg w-full bg-slate-800/30 backdrop-blur-md border border-slate-700/50 shadow-2xl hover:shadow-pink-500/10 transition-all duration-500 transform hover:scale-[1.02]">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-sm animate-pulse">
                      <Heart className="w-6 h-6 text-pink-400" />
                    </div>
                    <div className="absolute inset-0 bg-pink-400/20 rounded-full blur-xl animate-pulse" />
                  </div>
                </div>
                <CardTitle className="flex items-center justify-center gap-2 text-xl bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  <Heart className="h-5 w-5 text-pink-500" />
                  Donate Refurbished Products
                </CardTitle>
                <CardDescription className="text-slate-400 text-center">
                  Upload an image of your product list and provide pickup details. We&apos;ll process your donation and
                  connect you with those in need.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file-upload" className="text-slate-300 font-medium">
                      Product List / Image *
                    </Label>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="file-upload"
                        className="group flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600/50 rounded-lg cursor-pointer hover:border-pink-400/50 hover:bg-slate-700/30 transition-all duration-300 backdrop-blur-sm"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <div className="p-2 bg-pink-500/20 rounded-full group-hover:bg-pink-500/30 transition-colors duration-300 mb-2">
                            <Upload className="w-6 h-6 text-pink-400 group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          <p className="text-sm text-slate-300 text-center">
                            {formData.file ? (
                              <span className="font-medium text-pink-400">{formData.file.name}</span>
                            ) : (
                              <>
                                <span className="font-semibold text-white">Click to upload</span> or drag and drop
                              </>
                            )}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                        </div>
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                          required
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pickup-location" className="text-slate-300 font-medium">
                      Pickup Location *
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="pickup-location"
                        placeholder="Enter your pickup address"
                        value={formData.pickupLocation}
                        onChange={handleInputChange("pickupLocation")}
                        className="pl-10 bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-pink-400/50 focus:ring-pink-400/20 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-slate-300 font-medium">
                      Additional Notes (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special instructions or details about your donation..."
                      value={formData.notes}
                      onChange={handleInputChange("notes")}
                      rows={3}
                      className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-pink-400/50 focus:ring-pink-400/20 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full group bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={uploading || !formData.file || !formData.pickupLocation}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Processing Donation...
                      </>
                    ) : (
                      <>
                        <Heart className="mr-2 h-4 w-4" />
                        Submit Donation
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
