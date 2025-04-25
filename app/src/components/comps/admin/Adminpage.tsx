// barclays/app/src/components/comps/admin/Adminpage.tsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../ui/table'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Search, Filter, ArrowRight, FileText,Upload } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { api } from '../../../services/axios'

type TermsheetStatus =
  | 'TO BE STRUCTURIZED'
  | 'TO BE VALIDATED'
  | 'VALIDATED'
  | 'REJECTED'
  | 'ACCEPTED'

interface FileType     { id: number; s3Link: string }
interface User         { userId: number; name: string; email: string; role: string }
interface OrgUser      { user: User }
interface Organisation { id: number; name: string; users: OrgUser[] }
interface Termsheet {
  id: number
  title: string
  description?: string
  status: TermsheetStatus
  organisationId: number
  createdAt: string
  mapsheetFile?: FileType
  structuredsheetFile?: FileType
  ourtermsheetFile?: FileType
  validatedsheetFile?: FileType
  coloursheetFile?: FileType
  organisation: Organisation
}

type StatusFilter = TermsheetStatus | 'ALL'

export default function Adminpage() {
  const navigate = useNavigate()
  const { orgId: orgIdParam } = useParams<{ orgId: string }>()
  const orgId = Number(orgIdParam)

  const [termsheetData, setTermsheetData] = useState<Termsheet[]>([])
  const [loading, setLoading]       = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('ALL')
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768)

  // Track window size for responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fetch termsheets
  useEffect(() => {
    if (!orgIdParam || isNaN(orgId)) {
      console.error('Invalid or missing orgId:', orgIdParam)
      setLoading(false)
      return
    }
    const loadData = async () => {
      setLoading(true)
      try {
        const res = await api.get('/termsheet', { params: { organisationId: orgId } })
        setTermsheetData(res.data.termsheets)
      } catch (err) {
        console.error('Error fetching termsheets:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [orgIdParam, orgId])

  // Badge color variants
  const getStatusBadge = (s: TermsheetStatus) => {
    const variants: Record<TermsheetStatus, string> = {
      'TO BE STRUCTURIZED': 'bg-gray-50 text-gray-700',
      'TO BE VALIDATED':    'bg-gray-50 text-gray-700',
      VALIDATED:            'bg-gray-50 text-gray-700',
      REJECTED:             'bg-red-100 text-red-800',
      ACCEPTED:             'bg-green-50 text-green-800',
    }
    return <Badge className={`${variants[s]} font-medium text-xs`}>{s}</Badge>
  }

  // Date formatting
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  // File links renderer
  const renderFileLinks = (t: Termsheet) => {
    if (t.status === 'ACCEPTED' && t.validatedsheetFile) {
      return (
        <a
          href={t.validatedsheetFile.s3Link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs underline hover:text-gray-600"
        >
          Validated Sheet
        </a>
      )
    }
    return (
      <div className="flex flex-col gap-1 text-xs text-gray-500">
        {t.mapsheetFile        && <span>Map Sheet</span>}
        {t.structuredsheetFile && <span>Structured Sheet</span>}
        {t.ourtermsheetFile    && <span>Our Term Sheet</span>}
        {t.validatedsheetFile  && <span>Validated Sheet</span>}
        {t.coloursheetFile     && <span>Colour Sheet</span>}
      </div>
    )
  }

  // Filtering logic
  const filtered = termsheetData.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.organisation.name.toLowerCase().includes(searchTerm.toLowerCase())
    return selectedStatus === 'ALL'
      ? matchSearch
      : matchSearch && t.status === selectedStatus
  })

  // Counts for stats
  const counts = {
    total:      termsheetData.length,
    toBeStruct: termsheetData.filter((t) => t.status === 'TO BE STRUCTURIZED').length,
    toBeValid:  termsheetData.filter((t) => t.status === 'TO BE VALIDATED').length,
    validated:  termsheetData.filter((t) => t.status === 'VALIDATED').length,
    rejected:   termsheetData.filter((t) => t.status === 'REJECTED').length,
    accepted:   termsheetData.filter((t) => t.status === 'ACCEPTED').length,
  }

  // Stats keys for mobile
  const mobileCountsArray = [
    { key: 'total', label: 'Total' },
    { key: 'toBeValid', label: 'To Validate' },
    { key: 'rejected', label: 'Rejected' },
  ] as const

  // Mobile card renderer
  const renderMobileCard = (t: Termsheet) => (
    <Card key={t.id} className="mb-4 border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="mb-3">
          <p className="font-semibold text-base truncate">{t.title}</p>
          {t.description && (
            <p className="text-sm text-gray-500 truncate">{t.description}</p>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Organisation</span>
            <span className="font-medium text-sm">{t.organisation.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Status</span>
            {getStatusBadge(t.status)}
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Files</span>
            <div>{renderFileLinks(t)}</div>
          </div>
        </div>
        <div className="mt-4">
          <Button
            size="sm"
            className="w-full py-2 bg-black text-white hover:bg-gray-800"
            onClick={() => navigate(`/admin/${orgId}/termsheet/${t.id}`)}
          >
            View <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4">
  <div className="max-w-screen-xl mx-auto flex items-center justify-between px-4">
    <div className="flex items-center">
      <FileText className="h-6 w-6 mr-3 text-black" />
      <h1 className="text-xl font-bold text-black">Termsheets Admin</h1>
    </div>

    {/* Desktop: full text button */}
    <Button
      size="sm"
      className="hidden sm:inline-flex py-1 px-3 bg-black text-white hover:bg-gray-800"
      onClick={() => navigate(`/org/${orgId}`)}
    >
      <Upload className="h-4 w-4 mr-2" />
      Upload Termsheet
    </Button>

    {/* Mobile: icon-only button */}
    <Button
      size="sm"
      className="sm:hidden p-2 bg-black text-white hover:bg-gray-800"
      onClick={() => navigate(`/org/${orgId}`)}
    >
      <Upload className="h-5 w-5" />
    </Button>
  </div>
</header>

      {/* Main Content */}
      <main className="flex-grow py-6">
        <div className="max-w-screen-xl mx-auto px-4 space-y-6">
        {isMobileView && (
    // <div className="flex overflow-x-auto space-x-4 pb-4">
    <div className="flex overflow-x-auto space-x-4 py-4 px-2">
      {Object.entries(counts).map(([key, cnt]) => {
        const labels: Record<string,string> = {
          total:      'Total',
          toBeStruct: 'To Structure',
          toBeValid:  'To Validate',
          validated:  'Validated',
          rejected:   'Rejected',
          accepted:   'Accepted',
        }
        return (
          <Card
            key={key}
            className="min-w-[120px] flex-shrink-0 border-0 shadow-sm"
          >
            <CardContent className="p-3">
              <span className="block text-sm font-medium text-gray-500">
                {labels[key]}
              </span>
              <span className="block text-2xl font-bold text-black mt-1">
                {cnt}
              </span>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )}

          {/* Stats – Desktop */}
          {!isMobileView && (
            <div className="grid grid-cols-6 gap-6">
              {Object.entries(counts).map(([key, cnt]) => {
                const labels: Record<string, string> = {
                  total: 'Total',
                  toBeStruct: 'To Structure',
                  toBeValid: 'To Validate',
                  validated: 'Validated',
                  rejected: 'Rejected',
                  accepted: 'Accepted',
                }
                return (
                  <Card key={key} className="border-0 shadow-sm">
                    <CardContent className="p-5">
                      <span className="block text-sm font-medium text-gray-500">
                        {labels[key]}
                      </span>
                      <span className="block text-3xl font-bold text-black mt-2">
                        {cnt}
                      </span>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Filters */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search termsheets..."
                    className="pl-10 py-3 text-sm w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center">
                  <Filter className="h-5 w-5 text-gray-500 mr-3" />
                  <select
                    className="py-2 px-3 text-sm bg-white border border-gray-300 rounded-md w-full"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as StatusFilter)}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="TO BE STRUCTURIZED">To Be Structurized</option>
                    <option value="TO BE VALIDATED">To Be Validated</option>
                    <option value="VALIDATED">Validated</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="ACCEPTED">Accepted</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-gray-500">Loading termsheet data...</p>
            </div>
          ) : isMobileView ? (
            <div>{filtered.map(renderMobileCard)}</div>
          ) : (
            <Card className="border-0 shadow-sm">
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Termsheet</TableHead>
                      <TableHead>Organisation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Files</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((t) => (
                      <TableRow
                        key={t.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <TableCell className="whitespace-normal break-words">
                          <p className="font-semibold text-sm md:text-base mb-1">
                            {t.title}
                          </p>
                          {t.description && (
                            <p className="text-xs text-gray-500">
                              {t.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{t.organisation.name}</TableCell>
                        <TableCell>{getStatusBadge(t.status)}</TableCell>
                        <TableCell className="text-xs">{renderFileLinks(t)}</TableCell>
                        <TableCell className="text-sm">{formatDate(t.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex -ml-2">
                            {t.organisation.users.slice(0, 3).map((u, i) => (
                              <div
                                key={u.user.userId}
                                className="-ml-2 first:ml-0"
                                style={{ zIndex: 10 - i }}
                              >
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarImage
                                    src={`/api/placeholder/40/40`}
                                    alt={u.user.name}
                                  />
                                  <AvatarFallback className="bg-gray-100 text-gray-800 text-sm font-medium">
                                    {u.user.name
                                      .split(' ')
                                      .map((p) => p[0])
                                      .join('')
                                      .substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                            ))}
                            {t.organisation.users.length > 3 && (
                              <Avatar className="h-8 w-8 -ml-2">
                                <AvatarFallback className="bg-gray-100 text-gray-800 text-sm font-medium">
                                  +{t.organisation.users.length - 3}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            className="py-1 px-3"
                            onClick={() => navigate(`/admin/${orgId}/termsheet/${t.id}`)}
                          >
                            View <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="py-12 text-center text-gray-500">
                          No termsheets found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-screen-xl mx-auto px-4 text-center text-gray-500 text-sm">
          © 2025 Termsheet Management System
        </div>
      </footer>
    </div>
  )
}
