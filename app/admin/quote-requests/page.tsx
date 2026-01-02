"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth"
import { FileText, Download, Mail, Loader2, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/currency"

type QuoteRequest = {
  id: string
  status: "pending" | "quoted" | "accepted" | "rejected"
  requestedPrice: number | null
  adminNotes: string | null
  adminName: string | null
  piSent: boolean
  piSentAt: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
  customFile: {
    material: string
    quality: string
    notes: string | null
    file: {
      id: string
      filename: string
      url: string
      size: number
      downloadUrl?: string
    }
  }
}

export default function AdminQuoteRequestsPage() {
  const { token } = useAuth()
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [price, setPrice] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchQuoteRequests()
  }, [])

  const fetchQuoteRequests = async () => {
    try {
      const response = await fetch('/api/quote-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setQuoteRequests(data.quoteRequests || [])
      }
    } catch (error) {
      console.error('Failed to fetch quote requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadFile = async (fileId: string, filename: string) => {
    try {
      const response = await fetch(`/api/admin/files/${fileId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Download failed')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download file')
    }
  }

  const handleOpenDialog = (quote: QuoteRequest) => {
    setSelectedQuote(quote)
    setPrice(quote.requestedPrice?.toString() || "")
    setNotes(quote.adminNotes || "")
    setIsDialogOpen(true)
  }

  const handleSendPI = async () => {
    if (!selectedQuote || !price) {
      alert('Please enter a price')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/quote-requests/${selectedQuote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestedPrice: parseFloat(price),
          adminNotes: notes || null,
          status: 'quoted',
          sendPI: true,
        })
      })

      if (response.ok) {
        await fetchQuoteRequests()
        setIsDialogOpen(false)
        setSelectedQuote(null)
        setPrice("")
        setNotes("")
        alert('Proforma Invoice sent successfully!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to send PI')
      }
    } catch (error) {
      console.error('Send PI error:', error)
      alert('Failed to send PI')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete this quote request for "${filename}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(id)
    try {
      const currentToken = useAuth.getState().token
      if (!currentToken) {
        alert('Authentication required')
        return
      }

      const response = await fetch(`/api/quote-requests/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      })

      if (response.ok) {
        await fetchQuoteRequests()
        alert('Quote request deleted successfully!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete quote request')
      }
    } catch (error) {
      console.error('Delete quote request error:', error)
      alert('Failed to delete quote request')
    } finally {
      setDeleting(null)
    }
  }

  const pendingQuotes = quoteRequests.filter(q => q.status === "pending")
  const quotedQuotes = quoteRequests.filter(q => q.status === "quoted")
  const allQuotes = quoteRequests

  // Helper component to render quote list with empty state
  const QuoteList = ({ 
    quotes, 
    emptyTitle, 
    emptyMessage 
  }: { 
    quotes: QuoteRequest[]
    emptyTitle: string
    emptyMessage: string
  }) => {
    if (quotes.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{emptyTitle}</h3>
            <p className="text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <>
        {quotes.map((quote) => (
          <QuoteRequestCard
            key={quote.id}
            quote={quote}
            onDownload={() => handleDownloadFile(quote.customFile.file.id, quote.customFile.file.filename)}
            onSendPI={() => handleOpenDialog(quote)}
            onDelete={() => handleDelete(quote.id, quote.customFile.file.filename)}
            deleting={deleting === quote.id}
          />
        ))}
      </>
    )
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quote Requests</h1>
        <p className="text-muted-foreground">Review and manage customer quote requests</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            Pending
            {pendingQuotes.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingQuotes.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="quoted">Quoted</TabsTrigger>
          <TabsTrigger value="all">All Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <QuoteList
            quotes={pendingQuotes}
            emptyTitle="No pending requests"
            emptyMessage="All quote requests have been processed"
          />
        </TabsContent>

        <TabsContent value="quoted" className="space-y-4">
          <QuoteList
            quotes={quotedQuotes}
            emptyTitle="No quoted requests"
            emptyMessage="No quotes have been sent yet"
          />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <QuoteList
            quotes={allQuotes}
            emptyTitle="No quote requests"
            emptyMessage="No quote requests have been submitted"
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Proforma Invoice</DialogTitle>
            <DialogDescription>
              Set the price and send a Proforma Invoice to {selectedQuote?.user.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Admin Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes or calculations..."
                rows={4}
              />
            </div>
            {selectedQuote && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  <strong>File:</strong> {selectedQuote.customFile.file.filename}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Material:</strong> {selectedQuote.customFile.material}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Quality:</strong> {selectedQuote.customFile.quality}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendPI} disabled={saving || !price}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send PI
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function QuoteRequestCard({
  quote,
  onDownload,
  onSendPI,
  onDelete,
  deleting = false,
}: {
  quote: QuoteRequest
  onDownload: () => void
  onSendPI: () => void
  onDelete: () => void
  deleting?: boolean
}) {
  const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    quoted: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    accepted: "bg-green-500/10 text-green-700 dark:text-green-400",
    rejected: "bg-red-500/10 text-red-700 dark:text-red-400",
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
            <FileText className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="font-semibold text-lg mb-1">{quote.customFile.file.filename}</h3>
                <p className="text-sm text-muted-foreground">
                  Request #{quote.id.slice(0, 8)} • {quote.user.name} ({quote.user.email})
                </p>
              </div>
              <Badge className={statusColors[quote.status]} variant="secondary">
                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
              <div>
                <span className="text-muted-foreground">Material: </span>
                <span className="font-medium capitalize">{quote.customFile.material}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Quality: </span>
                <span className="font-medium capitalize">{quote.customFile.quality}</span>
              </div>
              <div>
                <span className="text-muted-foreground">File Size: </span>
                <span className="font-medium">
                  {(quote.customFile.file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              {quote.requestedPrice && (
                <div>
                  <span className="text-muted-foreground">Quoted Price: </span>
                  <span className="font-medium text-primary">{formatCurrency(quote.requestedPrice)}</span>
                </div>
              )}
            </div>
            {quote.adminNotes && (
              <div className="mb-4 p-3 rounded-lg bg-muted/50">
                <p className="text-sm">
                  <span className="font-medium">Notes: </span>
                  <span className="text-muted-foreground">{quote.adminNotes}</span>
                </p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 text-sm mb-4">
              <div>
                <span className="text-muted-foreground">Requested: </span>
                <span className="font-medium">
                  {new Date(quote.createdAt).toLocaleDateString()}
                </span>
              </div>
              {quote.piSent && (
                <>
                  <span className="hidden sm:inline text-muted-foreground">•</span>
                  <div>
                    <span className="text-muted-foreground">PI Sent: </span>
                    <span className="font-medium text-green-600">
                      {quote.piSentAt ? new Date(quote.piSentAt).toLocaleDateString() : 'Yes'}
                    </span>
                  </div>
                </>
              )}
              {quote.adminName && (
                <>
                  <span className="hidden sm:inline text-muted-foreground">•</span>
                  <div>
                    <span className="text-muted-foreground">Quoted by: </span>
                    <span className="font-medium">{quote.adminName}</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onDownload} disabled={deleting}>
                <Download className="mr-2 h-4 w-4" />
                Download File
              </Button>
              {quote.status === "pending" && (
                <Button size="sm" onClick={onSendPI} disabled={deleting}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send PI
                </Button>
              )}
              {quote.status === "quoted" && (
                <Button variant="outline" size="sm" onClick={onSendPI} disabled={deleting}>
                  <Mail className="mr-2 h-4 w-4" />
                  Update & Resend PI
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onDelete}
                className="text-destructive hover:text-destructive"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

