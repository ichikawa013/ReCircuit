"use client"

import { useEffect, useState } from "react"
import {
  collection,
  getDocs,
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
import { Package, Heart, TrendingUp, Clock, Plus, Activity } from "lucide-react"
import Link from "next/link"

type ActivityType = "Sale" | "Donation"
type ActivityStatus = "pending" | "completed"

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
}

export default function DashboardHome() {
  const { user, loading } = useAuth()
  const typedUser = user as TypedUser | null

  const [stats, setStats] = useState<DashboardStats>({
    listed: 0,
    sold: 0,
    donated: 0,
    pending: 0,
  })
  const [recent, setRecent] = useState<ActivityRow[]>([])
  const [fetching, setFetching] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!typedUser) {
        setFetching(false)
        return
      }
      setFetching(true)
      setError(null)

      try {
        const db = getDbClient()

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
      } catch (e) {
        console.error("Dashboard fetch error:", e)
        setError("Failed to load dashboard data. Please check your connection and try again.")
      } finally {
        setFetching(false)
      }
    }

    void fetchDashboardData()
  }, [typedUser])

  const getStatusBadge = (status: ActivityStatus) => {
    return (
      <Badge variant={status === "completed" ? "default" : "secondary"}>
        {status === "completed" ? "Completed" : "Pending"}
      </Badge>
    )
  }

  if (loading || fetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!typedUser) {
    return (
      <div className="flex justify-center items-center min-h-screen p-6">
        <Alert className="max-w-md">
          <AlertDescription>Please sign in to view your dashboard.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-800 border border-gray-700 rounded-3xl shadow-lg">
      <main className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here&#39;s an overview of your activity.</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Items Listed</CardTitle>
              <Package className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.listed}</div>
              <p className="text-xs text-gray-400">Total items you&apos;ve listed</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Sold</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.sold}</div>
              <p className="text-xs text-gray-400">Successfully completed sales</p>
            </CardContent>
          </Card>

          {typedUser.role !== "ngo" && (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Donated</CardTitle>
                <Heart className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.donated}</div>
                <p className="text-xs text-gray-400">Items donated to those in need</p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.pending}</div>
              <p className="text-xs text-gray-400">Orders awaiting completion</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Plus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button asChild size="lg" className="bg-green-500 hover:bg-green-600">
                <Link href="/sell">
                  <Package className="mr-2 h-4 w-4" />
                  Create Sale Listing
                </Link>
              </Button>
              {typedUser.role !== "ngo" && (
                <Button asChild size="lg" className="bg-pink-500 hover:bg-pink-600">
                  <Link href="/donate">
                    <Heart className="mr-2 h-4 w-4" />
                    Make Donation
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-400">Type</TableHead>
                  <TableHead className="text-gray-400">Item</TableHead>
                  <TableHead className="text-gray-400">Date</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.length === 0 ? (
                  <TableRow className="border-gray-700">
                    <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                      No recent activity found. Start by creating your first listing!
                    </TableCell>
                  </TableRow>
                ) : (
                  recent.map((activity) => (
                    <TableRow key={activity.id} className="border-gray-700">
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-2">
                          {activity.type === "Sale" ? (
                            <Package className="h-4 w-4 text-green-400" />
                          ) : (
                            <Heart className="h-4 w-4 text-pink-400" />
                          )}
                          {activity.type}
                        </div>
                      </TableCell>
                      <TableCell className="text-white">{activity.itemName}</TableCell>
                      <TableCell className="text-white">{activity.date}</TableCell>
                      <TableCell>{getStatusBadge(activity.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
