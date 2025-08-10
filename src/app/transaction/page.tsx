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
      <Badge
        variant={status === "done" ? "default" : "secondary"}
        className={
          status === "done"
            ? "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
            : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30"
        }
      >
        {status === "done" ? "Completed" : "Pending"}
      </Badge>
    )
  }

  const renderTransactionCard = (tx: Transaction, index: number) => (
    <Card
      key={tx.id}
      className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 shadow-xl hover:shadow-blue-500/10 transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-400" />
              {tx.pickupLocation || "No Location Specified"}
            </CardTitle>
            <p className="text-sm text-slate-400">
              {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString() : "Date not available"}
            </p>
          </div>
          {getStatusBadge(tx.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {tx.imageUrl && (
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-slate-700/50 border border-slate-600/50 backdrop-blur-sm">
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
            <h4 className="text-sm font-medium text-white">Notes</h4>
            <CardDescription className="text-slate-400 bg-slate-700/30 p-3 rounded-lg border border-slate-600/50 backdrop-blur-sm">
              {tx.notes}
            </CardDescription>
          </div>
        )}

        {tx.extractedText && (
          <>
            <Separator className="bg-slate-700/50" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white">Extracted Text</h4>
              <p className="text-sm text-slate-400 bg-slate-700/30 p-3 rounded-lg border border-slate-600/50 backdrop-blur-sm">
                {tx.extractedText}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )

  if (loading || loadingData) {
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
          <div className="w-16 h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-300 text-lg">Loading transactions...</p>
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
            <AlertDescription className="text-slate-300">Please sign in to view your transactions.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const pending = transactions.filter((t) => t.status === "pending")
  const done = transactions.filter((t) => t.status === "done")

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
      <div className="absolute top-20 left-20 w-20 h-20 bg-blue-400/10 rounded-full blur-xl animate-pulse" />
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

        <main className="pt-16 p-6 space-y-8 max-w-7xl mx-auto animate-fade-in-up">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Transactions
            </h1>
            <p className="text-slate-400 text-lg">Track your donation submissions and their status.</p>
          </div>

          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 backdrop-blur-md animate-fade-in">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          {/* Pending Transactions */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Pending Transactions</h2>
              <Badge
                variant="secondary"
                className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30"
              >
                {pending.length}
              </Badge>
            </div>

            {pending.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {pending.map((tx, index) => renderTransactionCard(tx, index))}
              </div>
            ) : (
              <Card className="text-center py-8 bg-slate-800/30 backdrop-blur-md border border-slate-700/50 shadow-xl">
                <CardContent>
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-yellow-500/20 rounded-full">
                      <Clock className="h-12 w-12 text-yellow-400" />
                    </div>
                  </div>
                  <p className="text-slate-400">No pending transactions found.</p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Completed Transactions */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Completed Transactions</h2>
              <Badge
                variant="secondary"
                className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
              >
                {done.length}
              </Badge>
            </div>

            {done.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {done.map((tx, index) => renderTransactionCard(tx, index + pending.length))}
              </div>
            ) : (
              <Card className="text-center py-8 bg-slate-800/30 backdrop-blur-md border border-slate-700/50 shadow-xl">
                <CardContent>
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-green-500/20 rounded-full">
                      <CheckCircle className="h-12 w-12 text-green-400" />
                    </div>
                  </div>
                  <p className="text-slate-400">No completed transactions yet.</p>
                </CardContent>
              </Card>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
