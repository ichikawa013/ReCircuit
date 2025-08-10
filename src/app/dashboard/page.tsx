"use client"

import type React from "react"

import { useEffect, useState,useCallback } from "react"
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  limit,
  orderBy,
  query,
  where,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore"
import { getDbClient } from "@/helpers/firebase/firebase"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Package, Heart, TrendingUp, Clock, Activity, ArrowRight, X, FileText, Send, CheckCircle } from "lucide-react"
import Link from "next/link"

type ActivityType = "Sale" | "Donation"
type ActivityStatus = "pending" | "completed"
type DonationRequestStatus = "pending" | "accepted" | "rejected"

interface ActivityRow {
  id: string
  type: ActivityType
  itemName: string
  date: string
  status: ActivityStatus
}

interface DashboardStats {
  listed: number
  sold: number
  donated: number
  pending: number
}

interface TypedUser {
  uid: string
  role?: string
  name?: string
}

interface DonationRequest {
  id: string
  ngoId: string
  ngoName: string
  comment: string
  status: DonationRequestStatus
  createdAt: { toDate: () => Date }
}

export default function DashboardHome() {
  const { user, loading } = useAuth()
  const typedUser = user as TypedUser | null

  // Existing dashboard state
  const [stats, setStats] = useState<DashboardStats>({
    listed: 0,
    sold: 0,
    donated: 0,
    pending: 0,
  })
  const [recent, setRecent] = useState<ActivityRow[]>([])
  const [fetching, setFetching] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState<string | null>(null)

  // NGO-specific state
  const [ngoComment, setNgoComment] = useState<string>("")
  const [donationRequests, setDonationRequests] = useState<DonationRequest[]>([])
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Fetch NGO donation requests
  const fetchNgoRequests = useCallback(async () => {
  if (!typedUser) return;

  try {
    const db = getDbClient();
    const requestsSnap = await getDocs(
      query(
        collection(db, "donationRequests"),
        where("ngoId", "==", typedUser.uid),
        orderBy("createdAt", "desc")
      )
    );

    const requests: DonationRequest[] = requestsSnap.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data() as Omit<DonationRequest, "id">;
        return {
          id: doc.id,
          ...data,
        };
      }
    );

    setDonationRequests(requests);
  } catch (e) {
    console.error("Failed to fetch NGO requests:", e);
    setError("Failed to load donation requests. Please try again.");
  }
}, [typedUser]);


  // Handle NGO form submission
  const handleNgoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!typedUser || !ngoComment.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const db = getDbClient()
      await addDoc(collection(db, "donationRequests"), {
        ngoId: typedUser.uid,
        ngoName: typedUser.name || "NGO",
        comment: ngoComment.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
      })

      setNgoComment("")
      setSuccessMessage("Your request has been posted and you will be contacted once accepted.")
      await fetchNgoRequests()

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (e) {
      console.error("Failed to submit NGO request:", e)
      setError("Failed to submit request. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Get status badge for donation requests
  const getRequestStatusBadge = (status: DonationRequestStatus) => {
    const variants = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30",
      accepted: "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30",
      rejected: "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30",
    }

    return (
      <Badge variant="secondary" className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!typedUser) {
        setFetching(false)
        return
      }

      setFetching(true)
      setError(null)

      try {
        if (typedUser.role?.toLowerCase() === "ngo") {
          await fetchNgoRequests()
        } else {
          const db = getDbClient()
          // Fetch counts
          const listedSnap = await getDocs(query(collection(db, "listings"), where("ownerId", "==", typedUser.uid)))
          const soldSnap = await getDocs(
            query(
              collection(db, "transactions"),
              where("sellerId", "==", typedUser.uid),
              where("status", "==", "completed"),
            ),
          )

          let donatedCount = 0
          if (typedUser.role !== "ngo") {
            const donatedSnap = await getDocs(query(collection(db, "donations"), where("ownerId", "==", typedUser.uid)))
            donatedCount = donatedSnap.size
          }

          const pendingSnap = await getDocs(
            query(
              collection(db, "transactions"),
              where("sellerId", "==", typedUser.uid),
              where("status", "==", "pending"),
            ),
          )

          setStats({
            listed: listedSnap.size,
            sold: soldSnap.size,
            donated: donatedCount,
            pending: pendingSnap.size,
          })

          // Fetch recent activity
          const txSnap = await getDocs(
            query(
              collection(db, "transactions"),
              where("sellerId", "==", typedUser.uid),
              orderBy("createdAt", "desc"),
              limit(5),
            ),
          )

          const rows: ActivityRow[] = txSnap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
            const d = doc.data() as {
              type?: string
              itemName?: string
              createdAt?: { toDate: () => Date }
              status?: string
            }
            const type: ActivityType = d.type === "Donation" ? "Donation" : "Sale"
            const status: ActivityStatus = d.status === "completed" ? "completed" : "pending"
            return {
              id: doc.id,
              type,
              itemName: d.itemName ?? "Item",
              date: d.createdAt ? d.createdAt.toDate().toLocaleDateString() : "",
              status,
            }
          })

          setRecent(rows)
        }
      } catch (e) {
        console.error("Dashboard fetch error:", e)
        setError("Failed to load dashboard data. Please check your connection and try again.")
      } finally {
        setFetching(false)
      }
    }

    void fetchDashboardData()
  }, [typedUser, fetchNgoRequests])

  const getStatusBadge = (status: ActivityStatus) => {
    return (
      <Badge
        variant={status === "completed" ? "default" : "secondary"}
        className={
          status === "completed"
            ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
            : "bg-slate-500/20 text-slate-400 border-slate-500/30 hover:bg-slate-500/30"
        }
      >
        {status === "completed" ? "Completed" : "Pending"}
      </Badge>
    )
  }

  const openModal = (type: string) => {
    setModalOpen(type)
  }

  const closeModal = () => {
    setModalOpen(null)
  }

  if (loading || fetching) {
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
          <div className="w-16 h-16 border-4 border-green-400/30 border-t-green-400 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-300 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!typedUser) {
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
            <AlertDescription className="text-slate-300">Please sign in to view your dashboard.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  // NGO Dashboard
  if (typedUser.role === "ngo") {
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

        <main className="relative z-10 p-6 space-y-8 max-w-7xl mx-auto animate-fade-in-up">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Welcome{typedUser.name ? `, ${typedUser.name}` : ""}
            </h1>
            <p className="text-slate-400 text-lg">
              You can raise donation requests and track them here. Connect with donors to help your cause.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 backdrop-blur-sm animate-fade-in">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="bg-green-500/10 border-green-500/20 backdrop-blur-sm animate-fade-in">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-400">{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Request Form */}
          <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 hover:border-green-500/30 transition-all duration-300 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-2xl">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <FileText className="h-6 w-6 text-green-400" />
                </div>
                Create Donation Request
              </CardTitle>
              <p className="text-slate-400">Describe what you need and how it will help your cause</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNgoSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="ngoComment" className="text-sm font-medium text-slate-300">
                    Request Description
                  </label>
                  <Textarea
                    id="ngoComment"
                    value={ngoComment}
                    onChange={(e) => setNgoComment(e.target.value)}
                    placeholder="Describe your donation request in detail. Include what items you need, how they will be used, and the impact they will have..."
                    className="min-h-[120px] bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-green-500/50 focus:ring-green-500/20 resize-none"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting || !ngoComment.trim()}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Submit Request
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Requests Table */}
          <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300 animate-fade-in-up delay-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-400" />
                </div>
                Your Donation Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-slate-700/50">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700/50 bg-slate-900/50">
                      <TableHead className="text-slate-300 font-semibold">Request</TableHead>
                      <TableHead className="text-slate-300 font-semibold">Status</TableHead>
                      <TableHead className="text-slate-300 font-semibold">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donationRequests.length === 0 ? (
                      <TableRow className="border-slate-700/50 hover:bg-slate-800/30">
                        <TableCell colSpan={3} className="text-center py-12">
                          <div className="space-y-3">
                            <FileText className="h-12 w-12 text-slate-500 mx-auto" />
                            <p className="text-slate-400 text-lg">No donation requests found</p>
                            <p className="text-slate-500 text-sm">Create your first request above!</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      donationRequests.map((request, index) => (
                        <TableRow
                          key={request.id}
                          className="border-slate-700/50 hover:bg-slate-800/30 transition-colors duration-200"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <TableCell className="text-slate-300 max-w-md">
                            <div className="truncate" title={request.comment}>
                              {request.comment}
                            </div>
                          </TableCell>
                          <TableCell>{getRequestStatusBadge(request.status)}</TableCell>
                          <TableCell className="text-slate-300">
                            {request.createdAt.toDate().toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // Original Dashboard for individual/organization users
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

      <main className="relative z-10 p-6 space-y-8 max-w-7xl mx-auto animate-fade-in-up">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-400 text-lg">Welcome back! Here&apos;s an overview of your activity.</p>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 backdrop-blur-sm animate-fade-in">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="group bg-slate-800/30 backdrop-blur-md border border-slate-700/50 hover:border-green-500/50 hover:bg-slate-800/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 animate-fade-in-up">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors duration-300">
                Items Listed
              </CardTitle>
              <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors duration-300">
                <Package className="h-4 w-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white group-hover:text-green-400 transition-colors duration-300">
                {stats.listed}
              </div>
              <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                Total items you&apos;ve listed
              </p>
            </CardContent>
          </Card>

          <Card className="group bg-slate-800/30 backdrop-blur-md border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 animate-fade-in-up delay-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors duration-300">
                Total Sold
              </CardTitle>
              <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors duration-300">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors duration-300">
                {stats.sold}
              </div>
              <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                Successfully completed sales
              </p>
            </CardContent>
          </Card>

          {typedUser.role !== "ngo" && (
            <Card className="group bg-slate-800/30 backdrop-blur-md border border-slate-700/50 hover:border-pink-500/50 hover:bg-slate-800/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 animate-fade-in-up delay-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors duration-300">
                  Total Donated
                </CardTitle>
                <div className="p-2 bg-pink-500/20 rounded-lg group-hover:bg-pink-500/30 transition-colors duration-300">
                  <Heart className="h-4 w-4 text-pink-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white group-hover:text-pink-400 transition-colors duration-300">
                  {stats.donated}
                </div>
                <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                  Items donated to those in need
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="group bg-slate-800/30 backdrop-blur-md border border-slate-700/50 hover:border-yellow-500/50 hover:bg-slate-800/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 animate-fade-in-up delay-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors duration-300">
                Pending Orders
              </CardTitle>
              <div className="p-2 bg-yellow-500/20 rounded-lg group-hover:bg-yellow-500/30 transition-colors duration-300">
                <Clock className="h-4 w-4 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300">
                {stats.pending}
              </div>
              <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                Orders awaiting completion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Large Interactive Cards */}
        <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 hover:border-green-500/30 transition-all duration-300 animate-fade-in-up delay-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-2xl">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Package className="h-6 w-6 text-green-400" />
              </div>
              Quick Actions
            </CardTitle>
            <p className="text-slate-400">Choose an action to get started</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Sell Items Card */}
              <div
                onClick={() => openModal("sell")}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 hover:border-green-400/40 p-8 cursor-pointer transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 group-hover:bg-green-500/30 transition-all duration-300 group-hover:scale-110">
                    <Package className="h-8 w-8 text-green-400 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors duration-300">
                      Sell Items
                    </h3>
                    <p className="text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                      List your refurbished electronics for sale and earn money while helping the environment
                    </p>
                  </div>
                  <div className="flex items-center text-green-400 group-hover:translate-x-2 transition-transform duration-300">
                    <span className="font-medium">Get started</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Donate Items Card */}
              {typedUser.role !== "ngo" && (
                <div
                  onClick={() => openModal("donate")}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 hover:border-pink-400/40 p-8 cursor-pointer transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-pink-500/20 group-hover:bg-pink-500/30 transition-all duration-300 group-hover:scale-110">
                      <Heart className="h-8 w-8 text-pink-400 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white group-hover:text-pink-400 transition-colors duration-300">
                        Donate Items
                      </h3>
                      <p className="text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                        Donate your electronics to those in need and make a positive impact on your community
                      </p>
                    </div>
                    <div className="flex items-center text-pink-400 group-hover:translate-x-2 transition-transform duration-300">
                      <span className="font-medium">Get started</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300 animate-fade-in-up delay-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Activity className="h-5 w-5 text-blue-400" />
              </div>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-slate-700/50">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700/50 bg-slate-900/50">
                    <TableHead className="text-slate-300 font-semibold">Type</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Item</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Date</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.length === 0 ? (
                    <TableRow className="border-slate-700/50 hover:bg-slate-800/30">
                      <TableCell colSpan={4} className="text-center py-12">
                        <div className="space-y-3">
                          <Activity className="h-12 w-12 text-slate-500 mx-auto" />
                          <p className="text-slate-400 text-lg">No recent activity found</p>
                          <p className="text-slate-500 text-sm">Start by creating your first listing!</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recent.map((activity, index) => (
                      <TableRow
                        key={activity.id}
                        className="border-slate-700/50 hover:bg-slate-800/30 transition-colors duration-200"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <TableCell className="font-medium text-white">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${activity.type === "Sale" ? "bg-green-500/20" : "bg-pink-500/20"}`}
                            >
                              {activity.type === "Sale" ? (
                                <Package className="h-4 w-4 text-green-400" />
                              ) : (
                                <Heart className="h-4 w-4 text-pink-400" />
                              )}
                            </div>
                            <span>{activity.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">{activity.itemName}</TableCell>
                        <TableCell className="text-slate-300">{activity.date}</TableCell>
                        <TableCell>{getStatusBadge(activity.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Glassmorphic Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300"
            onClick={closeModal}
          />
          {/* Modal Content */}
          <div className="relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 scale-100 animate-fade-in-up">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-all duration-200 group"
            >
              <X className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
            </button>
            {/* Modal Content */}
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 mx-auto">
                  {modalOpen === "sell" ? (
                    <Package className="h-8 w-8 text-green-400" />
                  ) : (
                    <Heart className="h-8 w-8 text-pink-400" />
                  )}
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">
                    {modalOpen === "sell" ? "Sell Items" : "Donate Items"}
                  </h2>
                  <p className="text-slate-400">
                    {modalOpen === "sell"
                      ? "List your refurbished electronics for sale and earn money while helping the environment."
                      : "Donate your electronics to those in need and make a positive impact on your community."}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  asChild
                  className={`flex-1 group font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                    modalOpen === "sell"
                      ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                      : "bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white"
                  }`}
                >
                  <Link href={modalOpen === "sell" ? "/sell" : "/donate"}>
                    Go to Page
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
                <Button
                  onClick={closeModal}
                  variant="outline"
                  className="px-6 bg-transparent border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white hover:bg-slate-700/30 transition-all duration-300"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
