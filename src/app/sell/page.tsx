"use client";

import { useState } from "react";
import { Upload, MapPin, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/sidebar";

import { getDbClient, app } from "@/helpers/firebase/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Tesseract from "tesseract.js";

export default function SellPage() {
  const { user, loading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [pickupLocation, setPickupLocation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file) return;

    setUploading(true);
    try {
      const storage = getStorage(app);
      const db = getDbClient();

      // 1️⃣ Upload image to Firebase Storage
      const fileRef = ref(storage, `uploads/${user.uid}/${Date.now()}-${file.name}`);
      await uploadBytes(fileRef, file);
      const imageUrl = await getDownloadURL(fileRef);

      // 2️⃣ Extract text using Tesseract
      const { data: { text: extractedText } } = await Tesseract.recognize(file, "eng");

      // 3️⃣ Save to Firestore
      await addDoc(collection(db, "sellSubmissions"), {
        userId: user.uid,
        pickupLocation,
        imageUrl,
        extractedText,
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
    } catch (err) {
      console.error("Error processing sell submission:", err);
    }
    setUploading(false);
  };

  if (loading) {
    return (
      <div className="dark p-6 flex justify-center items-center min-h-screen bg-gray-900 text-gray-100">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dark p-6 flex justify-center items-center min-h-screen bg-gray-900 text-gray-100">
        Please sign in to sell items.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}/>
      <div className="flex-1 flex flex-col">
        <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 mt-16 p-6 flex justify-center">
          {submitted ? (
            <Card className="max-w-lg w-full bg-gray-800 border border-gray-700">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                  <CardTitle>Submission Received</CardTitle>
                </div>
                <CardDescription>
                  We’ve received your product list. Once processed, we’ll send you an offer.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Button
                    onClick={() => setSubmitted(false)}
                    variant="secondary"
                  >
                    Submit Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-2xl w-full bg-gray-800 border border-gray-700">
              <CardHeader>
                <CardTitle>Sell Refurbished Products</CardTitle>
                <CardDescription>
                  Upload an image of your product list and pickup location. We&apos;ll process it.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Product List / Image</label>
                    <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-600 hover:border-emerald-400 transition">
                      <Upload className="w-6 h-6 mb-2 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        {file ? file.name : "Click to upload"}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pickup Location</label>
                    <div className="rounded-md border border-gray-700 bg-gray-700 flex items-center">
                      <MapPin className="w-5 h-5 text-gray-400 ml-3" />
                      <Input
                        className="border-0 bg-gray-700 text-gray-100 placeholder-gray-400 focus-visible:ring-emerald-400"
                        placeholder="Enter pickup address"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={uploading}
                  >
                    {uploading ? "Processing..." : "Submit"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
