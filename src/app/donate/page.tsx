"use client"

import type React from "react"

import { useState } from "react"
import { Upload, MapPin, Heart, CheckCircle } from "lucide-react"
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert className="max-w-md">
          <AlertDescription>Please sign in to donate items.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (user.role === "ngo") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Alert className="max-w-md">
          <AlertDescription>NGOs cannot donate items through this platform.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        {/* ✅ Changed mt-16 to flex items-center to center card */}
        <main className="flex-1 flex items-center justify-center p-6">
          {submitted ? (
            <Card className="max-w-lg w-full">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  Thank You for Your Donation!
                </CardTitle>
                <CardDescription>
                  Your donation has been submitted successfully and will be processed soon. We&apos;ll connect you with those
                  in need.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />
                <div className="flex justify-center">
                  <Button onClick={resetForm} variant="outline">
                    Make Another Donation
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-2xl w-full bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Heart className="h-5 w-5 text-pink-500" />
                  Donate Refurbished Products
                </CardTitle>
                <CardDescription>
                  Upload an image of your product list and provide pickup details. We&apos;ll process your donation and
                  connect you with those in need.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2 text-white">
                    <Label htmlFor="file-upload">Product List / Image *</Label>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {formData.file ? (
                              <span className="font-medium">{formData.file.name}</span>
                            ) : (
                              <>
                                <span className="font-semibold ">Click to upload</span> or drag and drop
                              </>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
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

                  <div className="space-y-2 text-white">
                    <Label htmlFor="pickup-location">Pickup Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="pickup-location"
                        placeholder="Enter your pickup address"
                        value={formData.pickupLocation}
                        onChange={handleInputChange("pickupLocation")}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-white">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special instructions or details about your donation..."
                      value={formData.notes}
                      onChange={handleInputChange("notes")}
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-pink-500 brightness-130 mb-auto"
                    disabled={uploading || !formData.file || !formData.pickupLocation}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing Donation...
                      </>
                    ) : (
                      <>
                        <Heart className="mr-2 h-4 w-4" />
                        Submit Donation
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
