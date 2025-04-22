"use client"

import { useState, useEffect } from "react"
import { Button } from "../../ui/button"
import { Card } from "../../ui/card"
import { Skeleton } from "../../ui/skeleton"
import { Alert, AlertDescription } from "../../ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "../../ui/dialog"
import {
  AlertTriangleIcon,
  DownloadIcon,
  FileTypeIcon,
  CheckIcon,
  XIcon,
  InfoIcon,
  ClockIcon,
} from "lucide-react"
import { useParams } from "react-router-dom"
import { ScrollArea } from "../../ui/scroll-area"
import { Badge } from "../../ui/badge"
import { api } from "../../../services/axios"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip"

interface Discrepancy {
  id: string
  role: string
  field: string
  content?: string
  suggestion?: string
  score?: number
  acceptedbyrole: boolean | null
  acceptedbyadmin: boolean | null
  createdAt: string
}

interface DocumentViewerProps {
  url: string
}

const DocumentViewer = ({ url }: DocumentViewerProps) => {
  const [fileType, setFileType] = useState("")

  useEffect(() => {
    if (!url) return

    const detectFileType = () => {
      const u = url.split("?")[0].toLowerCase()
      if (u.endsWith(".pdf")) return "pdf"
      if (/\.(jpe?g|png|gif)$/.test(u)) return "image"
      if (/\.(docx?|xlsx?|xls)$/.test(u)) return "office"
      if (u.endsWith(".csv")) return "csv"
      return "unknown"
    }
    setFileType(detectFileType())
  }, [url])

  const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
    url
  )}&embedded=true`

  if (fileType === "pdf" || fileType === "image") {
    return <iframe src={url} className="w-full h-full border-0" title="Document Viewer" />
  }
  if (fileType === "office" || fileType === "csv") {
    return (
      <iframe
        src={googleDocsViewerUrl}
        className="w-full h-full border-0"
        title="Document Viewer"
      />
    )
  }
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

const DiscrepancyItem = ({
  discrepancy,
  onAccept,
  onReject,
  userRole,
}: {
  discrepancy: Discrepancy
  onAccept: (id: string) => void
  onReject: (id: string) => void
  userRole: string
}) => {
  const isAdmin = userRole.toLowerCase() === "admin"
  const formattedDate = new Date(discrepancy.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const isMatchingRole = discrepancy.role.toLowerCase() === userRole.toLowerCase()

  const adminStatus =
    discrepancy.acceptedbyadmin === null
      ? "pending"
      : discrepancy.acceptedbyadmin
      ? "accepted"
      : "rejected"
  const roleStatus =
    discrepancy.acceptedbyrole === null
      ? "pending"
      : discrepancy.acceptedbyrole
      ? "accepted"
      : "rejected"

  const canTakeAction =
    (isAdmin || isMatchingRole) &&
    (isAdmin ? adminStatus === "pending" : roleStatus === "pending")

  const bgClass = isAdmin
    ? adminStatus === "accepted"
      ? "bg-green-50 border-green-200"
      : adminStatus === "rejected"
      ? "bg-red-50 border-red-200"
      : "bg-white"
    : roleStatus === "accepted"
    ? "bg-green-50 border-green-200"
    : roleStatus === "rejected"
    ? "bg-red-50 border-red-200"
    : "bg-white"

  return (
    <div className={`p-4 border rounded-lg mb-4 shadow-sm ${bgClass}`}>
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-900">{discrepancy.field}</h3>
        <Badge variant="outline" className="capitalize">
          {discrepancy.role}
        </Badge>
      </div>

      <div className="mt-3 space-y-3">
        {discrepancy.content && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Current:</p>
            <p className="text-sm bg-gray-50 p-2 rounded border border-gray-100">
              {discrepancy.content}
            </p>
          </div>
        )}
        {discrepancy.suggestion && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Suggested:</p>
            <p className="text-sm bg-blue-50 p-2 rounded border-l-2 border-blue-400">
              {discrepancy.suggestion}
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap justify-between items-center">
        <div className="space-y-1">
          <div className="flex flex-wrap gap-2 mb-2">
            {roleStatus !== "pending" && (
              <Badge
                variant="outline"
                className={
                  roleStatus === "accepted"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }
              >
                {roleStatus === "accepted" ? (
                  <><CheckIcon className="h-3 w-3 mr-1" />Accepted by Role</>
                ) : (
                  <><XIcon className="h-3 w-3 mr-1" />Rejected by Role</>
                )}
              </Badge>
            )}
            {adminStatus !== "pending" && (
              <Badge
                variant="outline"
                className={
                  adminStatus === "accepted"
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }
              >
                {adminStatus === "accepted" ? (
                  <><CheckIcon className="h-3 w-3 mr-1" />Accepted by Admin</>
                ) : (
                  <><XIcon className="h-3 w-3 mr-1" />Rejected by Admin</>
                )}
              </Badge>
            )}
            {discrepancy.score !== undefined && (
              <Badge variant="secondary" className={
                discrepancy.score > 0.8
                  ? "bg-green-100 text-green-800"
                  : discrepancy.score > 0.5
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }>
                Match: {(discrepancy.score * 100).toFixed(0)}%
              </Badge>
            )}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <ClockIcon className="h-3 w-3 mr-1" />
            {formattedDate}
          </div>
        </div>

        {canTakeAction && (
          <div className="flex space-x-2 mt-2 sm:mt-0">
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
        )}
      </div>
    </div>
  )
}

const ValidationSheet = () => {
  const { orgid } = useParams<{ orgid: string }>()
  const termsheetId = orgid ? parseInt(orgid, 10) : null

  const [termsheetUrl, setTermsheetUrl] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [termsheetStatus, setTermsheetStatus] = useState("")
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([])
  const [isActionInProgress, setIsActionInProgress] = useState(false)
  const [userRole, setUserRole] = useState<string>("")
  const [filterMode, setFilterMode] = useState<"all" | "pending">("pending")

  useEffect(() => {
    if (!termsheetId) return
    const fetchValidated = async () => {
      setIsLoading(true)
      try {
        const { data } = await api.get(`/file/validated_termsheet/${orgid}`)
        setTermsheetUrl(data.url || "")
        setTermsheetStatus(data.status || "")
      } catch {
        setError("Failed to load termsheet")
      } finally {
        setIsLoading(false)
      }
    }
    fetchValidated()
  }, [termsheetId, orgid])

  useEffect(() => {
    if (!termsheetId) return
    const fetchDiscrepancies = async () => {
      setIsLoading(true)
      try {
        const { data } = await api.get(`/file/termsheet/discrepancies/${orgid}`)
        setDiscrepancies(data.data || [])
        setUserRole(data.role)
      } catch {
        setError("Failed to load discrepancies")
      } finally {
        setIsLoading(false)
      }
    }
    fetchDiscrepancies()
  }, [termsheetId, orgid])

  const pendingCount = discrepancies.filter(d =>
    userRole.toLowerCase() === "admin" ? d.acceptedbyadmin === null : d.acceptedbyrole === null
  ).length

  const filteredDiscrepancies =
    filterMode === "all"
      ? discrepancies
      : discrepancies.filter(d =>
          userRole.toLowerCase() === "admin" ? d.acceptedbyadmin === null : d.acceptedbyrole === null
        )

  const clearError = () => setError(null)
  const toggleFilterMode = () => setFilterMode(m => (m === "all" ? "pending" : "all"))

  const handleAcceptDiscrepancy = async (id: string) => {
    setIsActionInProgress(true)
    try {
      await api.post(
        `/discrepancie/termsheet/${orgid}/discrepancies/${id}/accept`
      )
      setDiscrepancies(ds =>
        ds.map(d =>
          d.id === id
            ? {
                ...d,
                ...(userRole.toLowerCase() === "admin"
                  ? { acceptedbyadmin: true }
                  : { acceptedbyrole: true }),
              }
            : d
        )
      )
    } catch {
      setError("Failed to accept discrepancy")
    } finally {
      setIsActionInProgress(false)
    }
  }

  const handleRejectDiscrepancy = async (id: string) => {
    setIsActionInProgress(true)
    try {
      await api.post(
        `/discrepancie/termsheet/${orgid}/discrepancies/${id}/reject`
      )
      setDiscrepancies(ds =>
        ds.map(d =>
          d.id === id
            ? {
                ...d,
                ...(userRole.toLowerCase() === "admin"
                  ? { acceptedbyadmin: false }
                  : { acceptedbyrole: false }),
              }
            : d
        )
      )
    } catch {
      setError("Failed to reject discrepancy")
    } finally {
      setIsActionInProgress(false)
    }
  }

  const handleAcceptAll = async () => {
    setIsActionInProgress(true)
    try {
      await api.post(
        `/discrepancie/termsheet/${orgid}/discrepancies/accept`
      )
      setDiscrepancies(ds =>
        ds.map(d => ({
          ...d,
          ...(userRole.toLowerCase() === "admin"
            ? { acceptedbyadmin: true }
            : { acceptedbyrole: true }),
        }))
      )
    } catch {
      setError("Failed to accept all")
    } finally {
      setIsActionInProgress(false)
    }
  }

  const handleRejectAll = async () => {
    setIsActionInProgress(true)
    try {
      await api.post(
        `/discrepancie/termsheet/${orgid}/discrepancies/reject`
      )
      setDiscrepancies(ds =>
        ds.map(d => ({
          ...d,
          ...(userRole.toLowerCase() === "admin"
            ? { acceptedbyadmin: false }
            : { acceptedbyrole: false }),
        }))
      )
    } catch {
      setError("Failed to reject all")
    } finally {
      setIsActionInProgress(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 flex-1">
      <div className="flex-1 flex flex-col">
        <header className="border-b bg-white p-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Structured Termsheet Viewer
            </h1>
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
                  <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
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
            {/* Document Viewer */}
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

            {/* Discrepancies Panel */}
            <div className="lg:col-span-1 h-full">
              <Card className="h-full shadow-sm border border-gray-200 bg-white">
                <div className="p-4 border-b flex justify-between items-center">
                  <div className="flex items-center">
                    <h2 className="font-semibold text-lg">Discrepancies</h2>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center ml-2">
                            <Badge variant={pendingCount ? "destructive" : "outline"}>
                              {pendingCount}
                            </Badge>
                            <InfoIcon className="h-4 w-4 ml-1 text-gray-400" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {pendingCount} pending of {discrepancies.length} total discrepancies
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={toggleFilterMode}>
                      {filterMode === "pending" ? "Show All" : "Show Pending"}
                    </Button>
                    <Button
                      size="sm"
                      className="bg-black text-white hover:bg-gray-800"
                      disabled={pendingCount === 0 || isActionInProgress}
                      onClick={handleAcceptAll}
                    >
                      {isActionInProgress ? "Processing..." : "Accept All"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                      disabled={pendingCount === 0 || isActionInProgress}
                      onClick={handleRejectAll}
                    >
                      {isActionInProgress ? "Processing..." : "Reject All"}
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-[calc(100%-60px)] p-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : filteredDiscrepancies.length ? (
                    filteredDiscrepancies.map(d => (
                      <DiscrepancyItem
                        key={d.id}
                        discrepancy={d}
                        onAccept={handleAcceptDiscrepancy}
                        onReject={handleRejectDiscrepancy}
                        userRole={userRole}
                      />
                    ))
                  ) : discrepancies.length && filterMode === "pending" ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <CheckIcon className="h-12 w-12 text-green-500 mb-4" />
                      <p className="text-lg font-medium">All discrepancies resolved</p>
                      <p className="text-sm mt-2">No pending issues to review</p>
                      <Button variant="link" onClick={toggleFilterMode} className="mt-4">
                        View all discrepancies
                      </Button>
                    </div>
                  ) : !discrepancies.length ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <CheckIcon className="h-12 w-12 text-green-500 mb-4" />
                      <p className="text-lg font-medium">No discrepancies found</p>
                      <p className="text-sm mt-2">The document has no issues to review</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <p className="text-lg font-medium">No discrepancies to display</p>
                      <Button variant="link" onClick={toggleFilterMode} className="mt-4">
                        Switch to {filterMode === "all" ? "pending" : "all"} view
                      </Button>
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
