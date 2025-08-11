//src\app\my-listings\page.tsx
"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/sidebar"
import { useAuth } from "@/context/AuthContext"
import { getDbClient } from "@/helpers/firebase/firebase"
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  Timestamp,
  type DocumentData,
} from "firebase/firestore"
import Tesseract from "tesseract.js"
import { RefreshCw, Trash2, Eye, Package, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

type Role = "individual" | "organization" | "ngo"

type ListingStatus = "Processing" | "Graded" | "Completed" | "Cancelled"
type ListingGrade = "A" | "B" | "C" | null

interface ParsedItem {
  product: string
  quantity: number
  grade: "A"
}

interface Listing {
  id: string
  ownerId: string
  type: "sell" | "donate"
  fileName?: string
  fileUrl?: string
  pickupLocation?: string
  status?: ListingStatus
  grade?: ListingGrade
  priceOffered?: number | null
  createdAt?: Timestamp | null
  gradedAt?: Timestamp | null
}

interface TypedUser {
  uid: string
  role?: Role
}

export default function MyListingsPage() {
  const { user, loading } = useAuth()
  const typedUser = user as TypedUser | null
  const [listings, setListings] = useState<Listing[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [busyIds, setBusyIds] = useState<string[]>([]) // track OCR loading per listing
  const [parsedItemsMap, setParsedItemsMap] = useState<Record<string, ParsedItem[]>>({}) // cached OCR results

  // Fetch listings from Firestore
  useEffect(() => {
    if (loading) return
    if (!typedUser) {
      setListings([])
      return
    }

    const db = getDbClient()
    const col = collection(db, "listings")
    const q = query(col, where("ownerId", "==", typedUser.uid), orderBy("createdAt", "desc"))

    const unsub = onSnapshot(q, (snapshot) => {
      const arr: Listing[] = snapshot.docs.map((d) => {
        const data = d.data() as DocumentData
        return {
          id: d.id,
          ownerId: data.ownerId,
          type: data.type,
          fileName: data.fileName,
          fileUrl: data.fileUrl,
          pickupLocation: data.pickupLocation,
          status: (data.status as ListingStatus) ?? "Processing",
          grade: (data.grade as ListingGrade) ?? null,
          priceOffered: data.priceOffered ?? null,
          createdAt: data.createdAt ?? null,
          gradedAt: data.gradedAt ?? null,
        }
      })
      setListings(arr)
    })

    return () => unsub()
  }, [typedUser, loading])

  // Parse OCR text lines to product + quantity (default quantity = 1 if not found)
  const parseItems = (text: string): ParsedItem[] => {
    return text
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Try to parse something like: "ProductName 12"
        const match = line.match(/(.*?)(\d+)\s*$/)
        return {
          product: match ? match[1].trim() : line,
          quantity: match ? parseInt(match[2], 10) : 1,
          grade: "A" as const, // As requested, all Grade A
        }
      })
  }

  // Run OCR using Tesseract.js for given listing imageUrl
  const runOCR = useCallback(
    async (listing: Listing) => {
      if (!listing.fileUrl) return
      if (parsedItemsMap[listing.id]) return // already done

      setBusyIds((ids) => [...ids, listing.id])
      try {
        const { data } = await Tesseract.recognize(listing.fileUrl, "eng", {
          // logger: (m) => {
          //   // You can implement progress UI here if you want
          //   // console.log(m)
          // },
        })

        const parsed = parseItems(data.text)
        setParsedItemsMap((prev) => ({ ...prev, [listing.id]: parsed }))
      } catch (error) {
        console.error("OCR failed for listing", listing.id, error)
        setParsedItemsMap((prev) => ({ ...prev, [listing.id]: [] })) // Mark as no items
      } finally {
        setBusyIds((ids) => ids.filter((id) => id !== listing.id))
      }
    },
    [parsedItemsMap]
  )

  // Format timestamp nicely
  const formatTimestamp = (ts?: Timestamp | null) => (ts ? new Date(ts.toMillis()).toLocaleString() : "—")

  // Delete listing handler
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing? This action cannot be undone.")) return
    try {
      const db = getDbClient()
      await deleteDoc(doc(db, "listings", id))
      // Optionally remove OCR cache for deleted listing
      setParsedItemsMap((prev) => {
        const copy = { ...prev }
        delete copy[id]
        return copy
      })
    } catch (error) {
      console.error("Error deleting listing:", error)
    }
  }

  // UI while loading user data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white relative overflow-hidden">
        <div className="relative z-10 text-center space-y-4">
          <div className="w-16 h-16 border-4 border-green-400/30 border-t-green-400 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-300 text-lg">Loading your listings...</p>
        </div>
      </div>
    )
  }

  // UI if user not logged in
  if (!typedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white relative overflow-hidden">
        <div className="relative z-10 p-6">
          <Alert className="max-w-md bg-slate-800/30 backdrop-blur-md border-slate-700/50">
            <AlertDescription className="text-slate-300">Please sign in to view your listings.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-teal-500/6 rounded-full blur-3xl animate-pulse delay-2000" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.01),transparent_70%)]" />
      </div>

      {/* Floating blobs */}
      <div className="absolute top-20 left-20 w-20 h-20 bg-green-400/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-16 h-16 bg-emerald-400/10 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 right-10 w-12 h-12 bg-teal-400/10 rounded-full blur-xl animate-pulse delay-2000" />

      <div className="relative z-10">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-all duration-300 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="pt-16 p-6 max-w-7xl mx-auto animate-fade-in-up">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                My Listings
              </h1>
              <p className="text-slate-400 text-lg">Track your uploads, monitor status, grades, and price offers.</p>
            </div>
            <div className="flex gap-3">
              <Button
                asChild
                className="group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/sell">
                  <Package className="mr-2 h-4 w-4" />
                  New Sale
                </Link>
              </Button>
              {typedUser.role !== "ngo" && (
                <Button
                  asChild
                  variant="outline"
                  className="group bg-transparent border-slate-600 hover:border-pink-400 text-slate-300 hover:text-white hover:bg-pink-400/10 transition-all duration-300 px-6 py-3 rounded-xl"
                >
                  <Link href="/donate">
                    <Heart className="mr-2 h-4 w-4 text-pink-400" />
                    New Donation
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {listings.length === 0 ? (
            <Card className="text-center py-12 bg-slate-800/30 backdrop-blur-md border border-slate-700/50 shadow-2xl hover:shadow-green-500/10 transition-all duration-500">
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-700/50 backdrop-blur-sm">
                    <Package className="h-8 w-8 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">No listings yet</h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    Start by creating your first listing. You can sell items or donate them to those in need.
                  </p>
                </div>
                <div className="flex gap-3 justify-center pt-4">
                  <Button
                    asChild
                    className="group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Link href="/sell">
                      <Package className="mr-2 h-4 w-4" />
                      Create Sale Listing
                    </Link>
                  </Button>
                  {typedUser.role !== "ngo" && (
                    <Button
                      asChild
                      variant="outline"
                      className="group bg-transparent border-slate-600 hover:border-pink-400 text-slate-300 hover:text-white hover:bg-pink-400/10 transition-all duration-300 px-6 py-3 rounded-xl"
                    >
                      <Link href="/donate">
                        <Heart className="mr-2 h-4 w-4 text-pink-400" />
                        Make Donation
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {listings.map((listing, index) => (
                <Card
                  key={listing.id}
                  className="overflow-hidden bg-slate-800/30 backdrop-blur-md border border-slate-700/50 shadow-xl hover:shadow-green-500/10 transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-3 flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2 text-white">
                        {listing.type === "sell" ? (
                          <Package className="h-4 w-4 text-green-400" />
                        ) : (
                          <Heart className="h-4 w-4 text-pink-400" />
                        )}
                        {listing.type === "sell" ? "Sale Listing" : "Donation"}
                      </CardTitle>
                      <p className="text-sm text-slate-400">{listing.fileName || "Uploaded file"}</p>
                    </div>
                    {/* Show fixed Grade A badge */}
                    <Badge variant="default">Grade A</Badge>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-16 bg-slate-700/50 rounded-md flex items-center justify-center overflow-hidden border border-slate-600/50 relative backdrop-blur-sm">
                        {listing.fileUrl ? (
                          <Image
                            src={listing.fileUrl || "/placeholder.svg"}
                            alt={listing.fileName ?? "preview"}
                            fill
                            className="object-cover"
                            onLoad={() => runOCR(listing)}
                          />
                        ) : (
                          <Package className="h-6 w-6 text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2 text-sm text-white">
                        <p><strong>Pickup Location:</strong> {listing.pickupLocation || "—"}</p>
                        <p><strong>Submitted:</strong> {formatTimestamp(listing.createdAt)}</p>
                      </div>
                    </div>

                    <Separator className="bg-slate-700/50" />

                    <div>
                      <h4 className="text-white font-semibold mb-2">Extracted Products (All Grade A)</h4>
                      {busyIds.includes(listing.id) ? (
                        <p className="text-slate-400">Processing OCR...</p>
                      ) : parsedItemsMap[listing.id] && parsedItemsMap[listing.id].length > 0 ? (
                        <ul className="list-disc list-inside text-slate-300 max-h-48 overflow-y-auto">
                          {parsedItemsMap[listing.id].map((item, i) => (
                            <li key={i}>
                              <span className="font-medium text-white">{item.product}</span> - Quantity: {item.quantity} - Grade: A
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-400">No products detected or OCR not yet run.</p>
                      )}
                    </div>

                    {/* Delete and View buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => runOCR(listing)}
                        disabled={busyIds.length > 0}
                        size="sm"
                        variant="outline"
                        className="bg-transparent border-slate-600 hover:border-green-400 text-slate-300 hover:text-white hover:bg-green-400/10 transition-all duration-300"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Re-run OCR
                      </Button>

                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="bg-transparent border-slate-600 hover:border-blue-400 text-slate-300 hover:text-white hover:bg-blue-400/10 transition-all duration-300"
                      >
                        <a href={listing.fileUrl ?? "#"} target="_blank" rel="noreferrer">
                          <Eye className="w-4 h-4 mr-2" />
                          View Image
                        </a>
                      </Button>

                      <Button
                        onClick={() => handleDelete(listing.id)}
                        size="sm"
                        variant="destructive"
                        className="ml-auto bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
