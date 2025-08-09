"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import { CheckCircle, Clock, Package, AlertCircle } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { getDbClient } from "@/helpers/firebase/firebase"
import { collection, getDocs, query, orderBy, type Timestamp } from "firebase/firestore"

interface Transaction {
  id: string
  pickupLocation: string
  notes: string
  imageUrl: string
  extractedText: string
  status: "pending" | "done"
  createdAt: Timestamp
}

export default function TransactionsPage() {
  const { user, loading } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)
  const [loadingData, setLoadingData] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return
      try {
        const db = getDbClient()
        const q = query(collection(db, "donateSubmissions"), orderBy("createdAt", "desc"))
        const snap = await getDocs(q)
        const data: Transaction[] = []
        snap.forEach((doc) => {
          const item = doc.data()
          data.push({
            id: doc.id,
            pickupLocation: item.pickupLocation || "",
            notes: item.notes || "",
            imageUrl: item.imageUrl || "",
            extractedText: item.extractedText || "",
            status: item.status || "pending",
            createdAt: item.createdAt,
          })
        })
        setTransactions(data)
      } catch (err) {
        console.error("Error fetching transactions:", err)
        setError("Failed to load transactions. Please try again.")
      }
      setLoadingData(false)
    }

    fetchTransactions()
  }, [user])

  const getStatusBadge = (status: "pending" | "done") => {
    return (
      <Badge variant={status === "done" ? "default" : "secondary"} className="ml-auto">
        {status === "done" ? "Completed" : "Pending"}
      </Badge>
    )
  }

  const renderTransactionCard = (tx: Transaction) => (
    <Card key={tx.id} className="bg-card border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              {tx.pickupLocation || "No Location Specified"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString() : "Date not available"}
            </p>
          </div>
          {getStatusBadge(tx.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {tx.imageUrl && (
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
            <Image
              src={tx.imageUrl || "/placeholder.svg"}
              alt="Transaction image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}

        {tx.notes && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-card-foreground">Notes</h4>
            <CardDescription className="text-muted-foreground">{tx.notes}</CardDescription>
          </div>
        )}

        {tx.extractedText && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-card-foreground">Extracted Text</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{tx.extractedText}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )

  if (loading || loadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen p-6">
        <Alert className="max-w-md">
          <AlertDescription>Please sign in to view your transactions.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const pending = transactions.filter((t) => t.status === "pending")
  const done = transactions.filter((t) => t.status === "done")

  return (
    <div className="min-h-screen bg-gray-900 pt-16">
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Transactions</h1>
          <p className="text-muted-foreground">Track your donation submissions and their status.</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Pending Transactions */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-semibold text-yellow-500">Pending Transactions</h2>
            <Badge variant="secondary">{pending.length}</Badge>
          </div>

          {pending.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">{pending.map(renderTransactionCard)}</div>
          ) : (
            <Card className="text-center py-8">
              <CardContent>
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending transactions found.</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Completed Transactions */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h2 className="text-xl font-semibold text-green-500">Completed Transactions</h2>
            <Badge variant="secondary">{done.length}</Badge>
          </div>

          {done.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">{done.map(renderTransactionCard)}</div>
          ) : (
            <Card className="text-center py-8">
              <CardContent>
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No completed transactions yet.</p>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  )
}
