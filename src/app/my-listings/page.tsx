"use client"

import { useEffect, useState } from "react"
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
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
  type DocumentData,
} from "firebase/firestore"
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
  const [busyId, setBusyId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)

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

  const simulateProcessing = async (listing: Listing) => {
    setBusyId(listing.id)
    try {
      const db = getDbClient()
      const ref = doc(db, "listings", listing.id)

      if (listing.status === "Graded") {
        await updateDoc(ref, {
          status: "Completed",
          completedAt: Timestamp.now(),
        })
        setBusyId(null)
        return
      }

      const grades: ListingGrade[] = ["A", "B", "C"]
      const chosen = grades[Math.floor(Math.random() * grades.length)]

      let price: number | null = null
      if (listing.type === "sell") {
        if (chosen === "A") price = Math.floor(1200 + Math.random() * 800)
        if (chosen === "B") price = Math.floor(600 + Math.random() * 400)
        if (chosen === "C") price = Math.floor(150 + Math.random() * 350)
      }

      await updateDoc(ref, {
        status: "Graded",
        grade: chosen,
        priceOffered: price,
        gradedAt: Timestamp.now(),
      })
    } catch (err) {
      console.error("simulateProcessing error:", err)
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing? This action cannot be undone.")) return
    setBusyId(id)
    try {
      const db = getDbClient()
      await deleteDoc(doc(db, "listings", id))
    } catch (err) {
      console.error("delete listing error:", err)
    } finally {
      setBusyId(null)
    }
  }

  const formatTimestamp = (ts?: Timestamp | null): string => (ts ? new Date(ts.toMillis()).toLocaleString() : "—")

  const getStatusBadge = (status?: ListingStatus) => {
    const variants = {
      Processing: "secondary",
      Graded: "default",
      Completed: "outline",
      Cancelled: "destructive",
    } as const

    return <Badge variant={variants[status || "Processing"]}>{status || "Processing"}</Badge>
  }

  const getGradeBadge = (grade?: ListingGrade) => {
    if (!grade) return <span className="text-muted-foreground">—</span>

    const colors = {
      A: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      B: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      C: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[grade]}`}>
        Grade {grade}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your listings...</p>
        </div>
      </div>
    )
  }

  if (!typedUser) {
    return (
      <div className="flex justify-center items-center min-h-screen p-6">
        <Alert className="max-w-md">
          <AlertDescription>Please sign in to view your listings.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-800 pt-16">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">My Listings</h1>
            <p className="text-muted-foreground">Track your uploads, monitor status, grades, and price offers.</p>
          </div>
          <div className="flex gap-3 ">
            <Button asChild className="bg-green-500">
              <Link href="/sell">
                <Package className="mr-2 h-4 w-4" />
                New Sale
              </Link>
            </Button>
            {typedUser.role !== "ngo" && (
              <Button asChild variant="outline" className="bg-white">
                <Link href="/donate">
                  <Heart className="mr-2 h-4 w-4 text-pink-500" />
                  New Donation
                </Link>
              </Button>
            )}
          </div>
        </div>

        {listings.length === 0 ? (
          <Card className="text-center py-12 bg-gray-700">
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No listings yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Start by creating your first listing. You can sell items or donate them to those in need.
                </p>
              </div>
              <div className="flex gap-3 justify-center pt-4">
                <Button asChild>
                  <Link href="/sell">
                    <Package className="mr-2 h-4 w-4" />
                    Create Sale Listing
                  </Link>
                </Button>
                {typedUser.role !== "ngo" && (
                  <Button asChild variant="outline">
                    <Link href="/donate">
                      <Heart className="mr-2 h-4 w-4" />
                      Make Donation
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {listing.type === "sell" ? (
                          <Package className="h-4 w-4 text-green-600" />
                        ) : (
                          <Heart className="h-4 w-4 text-pink-600" />
                        )}
                        {listing.type === "sell" ? "Sale Listing" : "Donation"}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{listing.fileName || "Uploaded file"}</p>
                    </div>
                    {getStatusBadge(listing.status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-16 bg-muted rounded-md flex items-center justify-center overflow-hidden border relative">
                      {listing.fileUrl ? (
                        <Image
                          src={listing.fileUrl || "/placeholder.svg"}
                          alt={listing.fileName ?? "preview"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Pickup Location</p>
                          <p className="font-medium truncate">{listing.pickupLocation || "—"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Submitted</p>
                          <p className="font-medium">{formatTimestamp(listing.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Grade</p>
                        <div className="mt-1">{getGradeBadge(listing.grade)}</div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-semibold mt-1">
                          {listing.type === "sell"
                            ? listing.priceOffered
                              ? `₹${listing.priceOffered.toLocaleString()}`
                              : "—"
                            : "Free"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => simulateProcessing(listing)} disabled={!!busyId} size="sm" variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {listing.status === "Graded" ? "Complete" : "Process"}
                    </Button>

                    <Button asChild size="sm" variant="outline">
                      <a href={listing.fileUrl ?? "#"} target="_blank" rel="noreferrer">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </a>
                    </Button>

                    <Button
                      onClick={() => handleDelete(listing.id)}
                      disabled={!!busyId}
                      size="sm"
                      variant="destructive"
                      className="ml-auto"
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
  )
}
