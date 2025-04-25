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
  ChevronLeftIcon,
  ChevronRightIcon,
  BarChart2,
  FileTextIcon,
  TableIcon,
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

type CSVData = string[][];

const ValidationCSVViewer = ({ url }: { url: string }) => {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRecordIndex, setCurrentRecordIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('grid');

  useEffect(() => {
    const fetchCSV = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch CSV file");
        }
        
        const text = await response.text();
        const parsedData = parseCSV(text);
        setCsvData(parsedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching CSV:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        setLoading(false);
      }
    };

    if (url) {
      fetchCSV();
    }
  }, [url]);

  const parseCSV = (text: string): CSVData => {
    const lines = text.split(/\r?\n/);
    const data: CSVData = [];
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const fields = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
      
      const cleanFields = fields.map(field => 
        field.startsWith('"') && field.endsWith('"') 
          ? field.substring(1, field.length - 1) 
          : field
      );
      
      data.push(cleanFields);
    }
    
    return data;
  };

  const handlePrevRecord = () => {
    setCurrentRecordIndex(prev => Math.max(0, prev - 1));
  };
  
  const handleNextRecord = () => {
    setCurrentRecordIndex(prev => Math.min((csvData?.length || 2) - 2, prev + 1));
  };

  if (loading) return <div className="flex justify-center items-center h-full"><Skeleton className="h-48 sm:h-64 w-full" /></div>;
  if (error) return <Alert variant="destructive"><AlertDescription>Error loading CSV: {error}</AlertDescription></Alert>;
  if (!csvData || csvData.length < 2) return <div className="flex items-center justify-center h-full text-gray-500 p-4">No valid CSV data found</div>;

  const headers = csvData[0];
  const rows = csvData.slice(1);
  
  return (
    <div className="space-y-3 sm:space-y-4 h-full">
      <div className="flex flex-wrap justify-between items-center mb-2 sm:mb-4 gap-2">
        <div className="flex flex-wrap space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setViewMode('card')}
            className={`text-xs py-1 px-2 h-auto ${viewMode === 'card' ? 'bg-gray-100' : ''}`}
          >
            Card View
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setViewMode('grid')}
            className={`text-xs py-1 px-2 h-auto ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
          >
            Grid View
          </Button>
        </div>

        {viewMode === 'card' && (
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevRecord}
              disabled={currentRecordIndex === 0}
              className="text-xs py-1 px-1.5 h-auto"
            >
              <ChevronLeftIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <span className="text-xs sm:text-sm font-medium">
              Record {currentRecordIndex + 1} of {rows.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextRecord}
              disabled={currentRecordIndex >= rows.length - 1}
              className="text-xs py-1 px-1.5 h-auto"
            >
              <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-auto h-[calc(100%-4rem)]">
        {viewMode === 'card' ? (
          <Card className="shadow-sm border border-gray-200 overflow-hidden bg-white">
            <div className="p-2 sm:p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-medium text-sm sm:text-base">Record {currentRecordIndex + 1}</h3>
            </div>
            <div className="divide-y divide-gray-100 overflow-auto max-h-[calc(100vh-22rem)]">
              {headers.map((header, index) => (
                <div key={index} className="flex flex-col sm:flex-row p-2 sm:p-4 hover:bg-gray-50">
                  <div className="w-full sm:w-1/3 font-medium text-xs sm:text-sm text-gray-700 mb-1 sm:mb-0">
                    {header}
                  </div>
                  <div className="w-full sm:w-2/3 text-xs sm:text-sm text-gray-900">
                    {rows[currentRecordIndex]?.[index] || '-'}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 text-xs sm:text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Field Name
                  </th>
                  {rows.slice(0, 10).map((_, rowIndex) => (
                    <th key={rowIndex} className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Record {rowIndex + 1}
                    </th>
                  ))}
                  {rows.length > 10 && (
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ...
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {headers.map((header, headerIndex) => (
                  <tr key={headerIndex} className={headerIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900">
                      {header}
                    </td>
                    {rows.slice(0, 10).map((row, rowIndex) => (
                      <td key={rowIndex} className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-500">
                        {row[headerIndex] || '-'}
                      </td>
                    ))}
                    {rows.length > 10 && (
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-500">
                        ...
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

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

  if (fileType === "csv") {
    return <ValidationCSVViewer url={url} />
  }
  
  if (fileType === "office" && url.toLowerCase().endsWith(".xlsx") || url.toLowerCase().endsWith(".xls")) {
    return <ValidationCSVViewer url={url} />
  }

  const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
    url
  )}&embedded=true`

  if (fileType === "pdf" || fileType === "image") {
    return <iframe src={url} className="w-full h-full border-0" title="Document Viewer" />
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
  const { orgId } = useParams<{ orgId: string }>()
  const termsheetId = orgId ? parseInt(orgId, 10) : null

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
        const { data } = await api.get(`/file/validated_termsheet/${orgId}`)
        setTermsheetUrl(data.url || "")
        setTermsheetStatus(data.status || "")
      } catch {
        setError("Failed to load termsheet")
      } finally {
        setIsLoading(false)
      }
    }
    fetchValidated()
  }, [termsheetId, orgId])

  useEffect(() => {
    if (!termsheetId) return
    const fetchDiscrepancies = async () => {
      setIsLoading(true)
      try {
        const { data } = await api.get(`/file/termsheet/discrepancies/${orgId}`)
        setDiscrepancies(data.data || [])
        setUserRole(data.role)
      } catch {
        setError("Failed to load discrepancies")
      } finally {
        setIsLoading(false)
      }
    }
    fetchDiscrepancies()
  }, [termsheetId, orgId])

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
        `/discrepancie/termsheet/${orgId}/discrepancies/${id}/accept`
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
        `/discrepancie/termsheet/${orgId}/discrepancies/${id}/reject`
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
        `/discrepancie/termsheet/${orgId}/discrepancies/accept`
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
        `/discrepancie/termsheet/${orgId}/discrepancies/reject`
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
    <div className="h-full w-full flex flex-col bg-white">
      <header className="border-b bg-white p-3 sm:p-4 shadow-sm flex-shrink-0">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              Structured Document Validation
            </h1>
            {termsheetStatus && (
              <Badge 
                variant="outline" 
                className="ml-2 bg-gray-50 text-gray-700 border-gray-200"
              >
                {termsheetStatus}
              </Badge>
            )}
          </div>
          <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                className="border-gray-600 text-gray-600 hover:bg-gray-50 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 h-auto"
              >
                <DownloadIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] bg-white border-0 shadow-lg">
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="text-lg font-semibold text-gray-900">Export Validated Document</DialogTitle>
              </DialogHeader>
              <div className="py-5 space-y-4">
                <p className="text-sm text-gray-800">Choose a format to export this document:</p>
                <div className="grid grid-cols-2 gap-4">
                  {termsheetUrl && (
                    <>
                      <a 
                        href={termsheetUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex flex-col items-center justify-center p-5 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-center shadow-sm"
                      >
                        <FileTextIcon className="h-9 w-9 mb-3 text-gray-700" />
                        <span className="text-sm font-semibold text-gray-900">Original Format</span>
                        <span className="text-xs text-gray-700 mt-1">Download as is</span>
                      </a>
                      <a 
                        href={`${termsheetUrl}?format=csv`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex flex-col items-center justify-center p-5 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-center shadow-sm"
                      >
                        <TableIcon className="h-9 w-9 mb-3 text-gray-700" />
                        <span className="text-sm font-semibold text-gray-900">CSV Format</span>
                        <span className="text-xs text-gray-700 mt-1">Download as CSV</span>
                      </a>
                    </>
                  )}
                </div>
              </div>
              <DialogFooter className="border-t pt-4">
                <Button variant="outline" onClick={() => setIsExportDialogOpen(false)} className="w-full font-medium">
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        {error && (
          <Alert variant="destructive" className="mx-3 sm:mx-4 mt-3 sm:mt-4 flex-shrink-0">
            <AlertTriangleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
            <Button variant="ghost" size="sm" onClick={clearError} className="ml-auto">
              Dismiss
            </Button>
          </Alert>
        )}

        <div className="p-3 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Document Viewer */}
            <div className="lg:col-span-2 flex flex-col">
              <Card className="shadow-sm border border-gray-200 bg-white flex flex-col h-full">
                <div className="flex-1 overflow-auto h-[550px] flex items-center justify-center">
                  {isLoading ? (
                    <div className="p-4 space-y-4 w-full">
                      <Skeleton className="h-8 w-1/2 mx-auto" />
                      <Skeleton className="h-[400px] w-full" />
                    </div>
                  ) : termsheetUrl ? (
                    <div className="h-full w-full overflow-auto">
                      <DocumentViewer url={termsheetUrl} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 p-4">
                      <p>No document available</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Discrepancies Panel */}
            <div className="lg:col-span-1 flex flex-col">
              <Card className="shadow-sm border border-gray-200 bg-white flex flex-col h-full">
                <div className="p-3 sm:p-4 border-b flex flex-wrap justify-between items-center gap-2 flex-shrink-0">
                  <div className="flex items-center">
                    <h2 className="font-semibold text-base sm:text-lg text-gray-800">Discrepancies</h2>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center ml-2">
                            <Badge variant={pendingCount ? "destructive" : "outline"}>
                              {pendingCount}
                            </Badge>
                            <InfoIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1 text-gray-400" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {pendingCount} pending of {discrepancies.length} total discrepancies
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <Button size="sm" variant="outline" onClick={toggleFilterMode} className="text-xs py-1.5 px-3 h-auto">
                      {filterMode === "pending" ? "Show All" : "Show Pending"}
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gray-800 text-white hover:bg-gray-900 text-xs py-1.5 px-3 h-auto"
                      disabled={pendingCount === 0 || isActionInProgress}
                      onClick={handleAcceptAll}
                    >
                      {isActionInProgress ? "Processing..." : "Accept All"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-500 text-gray-600 hover:bg-gray-50 text-xs py-1.5 px-3 h-auto"
                      disabled={pendingCount === 0 || isActionInProgress}
                      onClick={handleRejectAll}
                    >
                      {isActionInProgress ? "Processing..." : "Reject All"}
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-3 sm:p-4">
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
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-gray-500">
                      <CheckIcon className="h-8 w-8 sm:h-12 sm:w-12 text-green-500 mb-3 sm:mb-4" />
                      <p className="text-base sm:text-lg font-medium">All discrepancies resolved</p>
                      <p className="text-xs sm:text-sm mt-1 sm:mt-2">No pending issues to review</p>
                      <Button variant="link" onClick={toggleFilterMode} className="mt-3 sm:mt-4 text-gray-600">
                        View all discrepancies
                      </Button>
                    </div>
                  ) : !discrepancies.length ? (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-gray-500">
                      <CheckIcon className="h-8 w-8 sm:h-12 sm:w-12 text-green-500 mb-3 sm:mb-4" />
                      <p className="text-base sm:text-lg font-medium">No discrepancies found</p>
                      <p className="text-xs sm:text-sm mt-1 sm:mt-2">The document has no issues to review</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-gray-500">
                      <p className="text-base sm:text-lg font-medium">No discrepancies to display</p>
                      <Button variant="link" onClick={toggleFilterMode} className="mt-3 sm:mt-4 text-gray-600">
                        Switch to {filterMode === "all" ? "pending" : "all"} view
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ValidationSheet
