"use client"

import { useState, useEffect } from "react"
import { Button } from "../../ui/button"
import { Card } from "../../ui/card"
import { Skeleton } from "../../ui/skeleton"
import { Alert, AlertDescription } from "../../ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "../../ui/dialog"
import { AlertTriangleIcon, DownloadIcon, FileTypeIcon, CheckIcon, XIcon } from "lucide-react"
import { useParams } from "react-router-dom"
import { ScrollArea } from "../../ui/scroll-area"
import { Badge } from "../../ui/badge"
import { api } from "../../../services/axios"


interface Discrepancy {
  id: string
  role: string
  field: string
  content?: string
  suggestion?: string
  score?: number
}

interface DocumentViewerProps {
  url: string
}

const DocumentViewer = ({ url }: DocumentViewerProps) => {
  const [fileType, setFileType] = useState("")

  useEffect(() => {
    if (!url) return

    const detectFileType = () => {
      const urlWithoutParams = url.split("?")[0].toLowerCase()
      if (urlWithoutParams.endsWith(".pdf")) return "pdf"
      if (
        urlWithoutParams.endsWith(".jpg") ||
        urlWithoutParams.endsWith(".jpeg") ||
        urlWithoutParams.endsWith(".png") ||
        urlWithoutParams.endsWith(".gif")
      )
        return "image"
      if (urlWithoutParams.endsWith(".docx") || urlWithoutParams.endsWith(".doc")) return "word"
      if (urlWithoutParams.endsWith(".xlsx") || urlWithoutParams.endsWith(".xls")) return "excel"
      if (urlWithoutParams.endsWith(".csv")) return "csv"
      return "unknown"
    }

    setFileType(detectFileType())
  }, [url])

  const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`

  const renderViewer = () => {
    switch (fileType) {
      case "pdf":
      case "image":
        return <iframe src={url} className="w-full h-full border-0" title="Document Viewer" />
      case "word":
      case "excel":
      case "csv":
        return <iframe src={googleDocsViewerUrl} className="w-full h-full border-0" title="Document Viewer" />
      case "unknown":
      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-4 text-gray-600">
            <FileTypeIcon size={48} />
            <p>This file type may not be viewable in the browser</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              <DownloadIcon size={16} />
              <span>Download File</span>
            </a>
          </div>
        )
    }
  }

  return <div className="h-full w-full">{renderViewer()}</div>
}

const DiscrepancyItem = ({
  discrepancy,
  onAccept,
  onReject,
}: {
  discrepancy: Discrepancy
  onAccept: (id: string) => void
  onReject: (id: string) => void
}) => {
  return (
    <div className="p-4 border rounded-lg mb-4 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{discrepancy.role}</Badge>
            {discrepancy.score !== undefined && (
              <Badge
                variant={discrepancy.score > 0.8 ? "default" : "secondary"}
                className={discrepancy.score > 0.8 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
              >
                Score: {(discrepancy.score * 100).toFixed(0)}%
              </Badge>
            )}
          </div>
          <h3 className="font-medium text-gray-900">{discrepancy.field}</h3>
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="border-green-500 text-green-600 hover:bg-green-50"
            onClick={() => onAccept(discrepancy.id)}
          >
            <CheckIcon className="h-4 w-4 mr-1" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-50"
            onClick={() => onReject(discrepancy.id)}
          >
            <XIcon className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      </div>

      {discrepancy.content && (
        <div className="mb-2">
          <p className="text-sm text-gray-500 mb-1">Current Content:</p>
          <p className="text-sm bg-gray-50 p-2 rounded">{discrepancy.content}</p>
        </div>
      )}

      {discrepancy.suggestion && (
        <div>
          <p className="text-sm text-gray-500 mb-1">Suggested Change:</p>
          <p className="text-sm bg-blue-50 p-2 rounded border-l-2 border-blue-400">{discrepancy.suggestion}</p>
        </div>
      )}
    </div>
  )
}

const ValidationSheet = () => {
  const params = useParams()
  const orgid = params?.orgid as string
  const termsheetId = orgid ? Number.parseInt(orgid) : null

  const [termsheetUrl, setTermsheetUrl] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [termsheetStatus, setTermsheetStatus] = useState("")
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([])
  const [isActionInProgress, setIsActionInProgress] = useState(false)
  const discrepancyCount = discrepancies.length

  useEffect(() => {
    const fetchTermsheetData = async () => {
      try {
        setIsLoading(true)
        if (!termsheetId) {
          throw new Error("Invalid termsheet ID")
        }
        
        // Fetch termsheet document data
        const termsheetResponse = await api.get(`/file/validated_termsheet/${orgid}`)
        const termsheetData = termsheetResponse.data
        setTermsheetUrl(termsheetData.url || "")
        setTermsheetStatus(termsheetData.status || "")
        const discrepanciesResponse = await api.get(`file/termsheet/${orgid}/discrepancies`)
        setDiscrepancies(discrepanciesResponse.data || [])
        
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load termsheet data or discrepancies")
        setIsLoading(false)
      }
    }
    
    if (termsheetId) {
      fetchTermsheetData()
    }
  }, [termsheetId, orgid])

  const handleAcceptDiscrepancy = async (id: string) => {
    try {
      setIsActionInProgress(true)
      // Make API call to accept the discrepancy
      await api.post(`/termsheet/${orgid}/discrepancies/${id}/accept`)
      
      // Update local state after successful API call
      setDiscrepancies((prevDiscrepancies) => prevDiscrepancies.filter((d) => d.id !== id))
      setIsActionInProgress(false)
    } catch (error) {
      console.error("Error accepting discrepancy:", error)
      setError("Failed to accept the discrepancy. Please try again.")
      setIsActionInProgress(false)
    }
  }

  const handleRejectDiscrepancy = async (id: string) => {
    try {
      setIsActionInProgress(true)
      // Make API call to reject the discrepancy
      await api.post(`/termsheet/${orgid}/discrepancies/${id}/reject`)
      
      // Update local state after successful API call
      setDiscrepancies((prevDiscrepancies) => prevDiscrepancies.filter((d) => d.id !== id))
      setIsActionInProgress(false)
    } catch (error) {
      console.error("Error rejecting discrepancy:", error)
      setError("Failed to reject the discrepancy. Please try again.")
      setIsActionInProgress(false)
    }
  }

  const handleAcceptAll = async () => {
    try {
      setIsActionInProgress(true)
      // Make API call to accept all discrepancies
      await api.post(`/termsheet/${orgid}/discrepancies/accept-all`)
      
      // Clear all discrepancies from local state
      setDiscrepancies([])
      setIsActionInProgress(false)
    } catch (error) {
      console.error("Error accepting all discrepancies:", error)
      setError("Failed to accept all discrepancies. Please try again.")
      setIsActionInProgress(false)
    }
  }

  const clearError = () => setError(null)

  return (
    <div className="flex h-screen bg-gray-50 flex-1">
      <div className="flex-1 flex flex-col">
        <header className="border-b border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">Structured Termsheet Viewer</h1>
            <div className="flex space-x-3">
              <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-black text-black hover:bg-gray-100">
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px]">
                  <DialogHeader>
                    <DialogTitle>Export Termsheet</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <p>Are you sure you want to export this termsheet?</p>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                      Cancel
                    </Button>
                    {termsheetUrl && (
                      <Button className="bg-black text-white hover:bg-gray-800">
                        <a
                          href={termsheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm"
                        >
                          <DownloadIcon className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {error && (
          <Alert variant="destructive" className="m-4">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
            <Button variant="ghost" size="sm" onClick={clearError} className="ml-auto">
              Dismiss
            </Button>
          </Alert>
        )}

        <div className="flex-1 overflow-hidden p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            {/* Document Viewer Section - Takes 2/3 of the space on large screens */}
            <div className="lg:col-span-2 h-full">
              <Card className="h-full shadow-sm border border-gray-200 bg-white">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="font-semibold text-lg">Document</h2>
                </div>
                <div className="p-4 h-[calc(100%-60px)]">
                  {isLoading ? (
                    <div className="space-y-4 h-full">
                      <Skeleton className="h-8 w-1/2" />
                      <Skeleton className="h-[calc(100%-40px)] w-full" />
                    </div>
                  ) : termsheetUrl ? (
                    <DocumentViewer url={termsheetUrl} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>No document available</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Discrepancies Section - Takes 1/3 of the space on large screens */}
            <div className="lg:col-span-1 h-full">
              <Card className="h-full shadow-sm border border-gray-200 bg-white">
                <div className="p-4 border-b flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <h2 className="font-semibold text-lg">Discrepancies</h2>
                      {discrepancyCount > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {discrepancyCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-black text-white hover:bg-gray-800" 
                    disabled={discrepancyCount === 0 || isActionInProgress}
                    onClick={handleAcceptAll}
                  >
                    {isActionInProgress ? "Processing..." : "Accept All"}
                  </Button>
                </div>
                <ScrollArea className="h-[calc(100%-60px)] p-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : discrepancies.length > 0 ? (
                    discrepancies.map((discrepancy) => (
                      <DiscrepancyItem
                        key={discrepancy.id}
                        discrepancy={discrepancy}
                        onAccept={handleAcceptDiscrepancy}
                        onReject={handleRejectDiscrepancy}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <CheckIcon className="h-12 w-12 text-green-500 mb-4" />
                      <p className="text-lg font-medium">All discrepancies resolved</p>
                      <p className="text-sm mt-2">The document has no pending issues</p>
                    </div>
                  )}
                </ScrollArea>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ValidationSheet