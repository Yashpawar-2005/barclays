import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Search, Filter, RefreshCw, ArrowRight, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';

// Define TypeScript interfaces matching Prisma schema
interface File {
  id: number;
  s3Link: string;
  type?: string;
  createdAt: string;
}

interface Discrepancy {
  id: number;
  role?: string;
  score?: string;
  content?: string;
  suggestion?: string;
  field?: string;
  acceptedbyrole?: boolean;
  acceptedbyadmin?: boolean;
  termsheetId: number;
  createdAt: string;
}

interface Termsheet {
  id: number;
  title: string;
  description?: string;
  mapsheetFileId?: number;
  status: TermsheetStatus;
  structuredsheetFileId?: number;
  ourtermsheetFileId?: number;
  validatedsheetFileId?: number;
  organisationId: number;
  createdAt: string;
  mapsheetFile?: File;
  structuredsheetFile?: File;
  ourtermsheetFile?: File;
  validatedsheetFile?: File;
  discrepancies?: Discrepancy[];
  organisation?: Organisation;
}

interface User {
  userId: number;
  name: string;
  email: string;
  role: string;
}

interface Organisation {
  id: number;
  name: string;
  users: User[];
}

// Type for termsheet status
type TermsheetStatus = 
  | 'TO BE STRUCTURIZED' 
  | 'TO BE VALIDATED' 
  | 'VALIDATED' 
  | 'REJECTED' 
  | 'ACCEPTED';

// Type for status filter
type StatusFilter = TermsheetStatus | 'ALL';

// Mock data service - simulates API call
const fetchTermsheetData = (): Promise<Termsheet[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          title: "Investment Agreement - Acme Corp",
          description: "Series A funding round termsheet for technology investment",
          status: "TO BE STRUCTURIZED",
          organisationId: 1,
          createdAt: "2025-04-15T10:30:00Z",
          mapsheetFileId: 101,
          mapsheetFile: {
            id: 101,
            s3Link: "https://storage.example.com/files/acme-map.pdf",
            createdAt: "2025-04-15T10:30:00Z"
          },
          discrepancies: []
        },
        {
          id: 2,
          title: "Equity Partnership - Globex Inc",
          description: "Equity distribution terms for new partnership",
          status: "TO BE VALIDATED",
          organisationId: 2,
          createdAt: "2025-04-10T14:45:00Z",
          mapsheetFileId: 102,
          structuredsheetFileId: 202,
          mapsheetFile: {
            id: 102,
            s3Link: "https://storage.example.com/files/globex-map.pdf",
            createdAt: "2025-04-10T14:45:00Z"
          },
          structuredsheetFile: {
            id: 202,
            s3Link: "https://storage.example.com/files/globex-structured.pdf",
            createdAt: "2025-04-12T09:15:00Z"
          },
          discrepancies: [
            {
              id: 1,
              role: "legal",
              field: "vesting_schedule",
              content: "Vesting schedule is not clearly defined",
              suggestion: "Implement 4-year vesting with 1-year cliff",
              acceptedbyrole: false,
              acceptedbyadmin: false,
              termsheetId: 2,
              createdAt: "2025-04-13T11:20:00Z"
            }
          ]
        },
        {
          id: 3,
          title: "Acquisition Terms - Stark Industries",
          description: "Final acquisition terms for subsidiary company",
          status: "VALIDATED",
          organisationId: 1,
          createdAt: "2025-03-28T08:00:00Z",
          mapsheetFileId: 103,
          structuredsheetFileId: 203,
          ourtermsheetFileId: 303,
          validatedsheetFileId: 403,
          mapsheetFile: {
            id: 103,
            s3Link: "https://storage.example.com/files/stark-map.pdf",
            createdAt: "2025-03-28T08:00:00Z"
          },
          structuredsheetFile: {
            id: 203,
            s3Link: "https://storage.example.com/files/stark-structured.pdf",
            createdAt: "2025-03-29T10:30:00Z"
          },
          ourtermsheetFile: {
            id: 303,
            s3Link: "https://storage.example.com/files/stark-ourterm.pdf",
            createdAt: "2025-04-01T15:45:00Z"
          },
          validatedsheetFile: {
            id: 403,
            s3Link: "https://storage.example.com/files/stark-validated.pdf",
            createdAt: "2025-04-05T11:20:00Z"
          },
          discrepancies: []
        },
        {
          id: 4,
          title: "Seed Round - Wayne Enterprises",
          description: "Initial seed funding agreement",
          status: "REJECTED",
          organisationId: 2,
          createdAt: "2025-04-02T16:15:00Z",
          mapsheetFileId: 104,
          structuredsheetFileId: 204,
          ourtermsheetFileId: 304,
          mapsheetFile: {
            id: 104,
            s3Link: "https://storage.example.com/files/wayne-map.pdf",
            createdAt: "2025-04-02T16:15:00Z"
          },
          structuredsheetFile: {
            id: 204,
            s3Link: "https://storage.example.com/files/wayne-structured.pdf",
            createdAt: "2025-04-03T14:30:00Z"
          },
          ourtermsheetFile: {
            id: 304,
            s3Link: "https://storage.example.com/files/wayne-ourterm.pdf",
            createdAt: "2025-04-04T09:45:00Z"
          },
          discrepancies: [
            {
              id: 2,
              role: "finance",
              field: "valuation_cap",
              content: "Valuation cap is too high for this stage",
              suggestion: "Reduce valuation cap to $8M",
              acceptedbyrole: true,
              acceptedbyadmin: false,
              termsheetId: 4,
              createdAt: "2025-04-05T10:30:00Z"
            },
            {
              id: 3,
              role: "legal",
              field: "board_rights",
              content: "Board rights are unfavorable to existing shareholders",
              suggestion: "Modify board composition to maintain balance",
              acceptedbyrole: true,
              acceptedbyadmin: false,
              termsheetId: 4,
              createdAt: "2025-04-05T11:45:00Z"
            }
          ]
        },
        {
          id: 5,
          title: "Convertible Note - LexCorp",
          description: "Convertible note terms for bridge funding",
          status: "ACCEPTED",
          organisationId: 1,
          createdAt: "2025-03-15T11:30:00Z",
          mapsheetFileId: 105,
          structuredsheetFileId: 205,
          ourtermsheetFileId: 305,
          validatedsheetFileId: 405,
          mapsheetFile: {
            id: 105,
            s3Link: "https://storage.example.com/files/lex-map.pdf",
            createdAt: "2025-03-15T11:30:00Z"
          },
          structuredsheetFile: {
            id: 205,
            s3Link: "https://storage.example.com/files/lex-structured.pdf",
            createdAt: "2025-03-16T14:20:00Z"
          },
          ourtermsheetFile: {
            id: 305,
            s3Link: "https://storage.example.com/files/lex-ourterm.pdf",
            createdAt: "2025-03-18T09:10:00Z"
          },
          validatedsheetFile: {
            id: 405,
            s3Link: "https://storage.example.com/files/lex-validated.pdf",
            createdAt: "2025-03-20T16:40:00Z"
          },
          discrepancies: []
        }
      ]);
    }, 800);
  });
};

// Mock organization data service
const fetchOrganisationData = (): Promise<Organisation[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: "Acme Organisation",
          users: [
            { userId: 2, name: 'satyam', email: 'allwforking@gmail.com', role: 'admin' },
            { userId: 1, name: 'yashpawar', email: 'allworking@gmail.com', role: 'admin' }
          ]
        },
        {
          id: 2,
          name: "Globex Organisation",
          users: [
            { userId: 4, name: 'satyam 12', email: 'sudu.khot@gmail.com', role: 'user' }
          ]
        }
      ]);
    }, 600);
  });
};

export default function AdminDashboard() {
  const [termsheetData, setTermsheetData] = useState<Termsheet[]>([]);
  const [organisationData, setOrganisationData] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    setLoading(true);
    const [termsheets, organisations] = await Promise.all([
      fetchTermsheetData(),
      fetchOrganisationData()
    ]);
    
    // Enrich termsheet data with organization details
    const enrichedTermsheets = termsheets.map(termsheet => {
      const organisation = organisations.find(org => org.id === termsheet.organisationId);
      return { ...termsheet, organisation };
    });
    
    setTermsheetData(enrichedTermsheets);
    setOrganisationData(organisations);
    setLoading(false);
  };

  // Function to handle sheet acceptance
  const handleAcceptTermsheet = (termsheetId: number) => {
    // Update the status of the selected termsheet to ACCEPTED
    // Mark all other termsheets as REJECTED
    const updatedTermsheets = termsheetData.map(sheet => {
      if (sheet.id === termsheetId) {
        return { ...sheet, status: 'ACCEPTED' as TermsheetStatus };
      } else if (sheet.organisationId === termsheetData.find(t => t.id === termsheetId)?.organisationId) {
        // Only reject termsheets from the same organization
        return { ...sheet, status: 'REJECTED' as TermsheetStatus };
      }
      return sheet;
    });
    
    setTermsheetData(updatedTermsheets);
  };

  const getStatusBadge = (status: TermsheetStatus) => {
    const variants: Record<string, string> = {
      'TO BE STRUCTURIZED': "bg-gray-100 text-gray-800",
      'TO BE VALIDATED': "bg-gray-100 text-gray-800",
      'VALIDATED': "bg-gray-100 text-gray-800",
      'REJECTED': "bg-black text-white",
      'ACCEPTED': "bg-white text-black border border-black"
    };
    
    return (
      <Badge className={`${variants[status]} font-medium`}>
        {status}
      </Badge>
    );
  };

  // Generate avatar for a user
  const getUserAvatar = (name: string) => {
    const initials = name
      .split(' ')
      .map(part => part[0]?.toUpperCase() || '')
      .join('')
      .substring(0, 2);
    
    return (
      <Avatar className="h-8 w-8 mr-2">
        <AvatarImage src={`/api/placeholder/40/40`} alt={name} />
        <AvatarFallback className="bg-gray-100 text-gray-800 text-sm font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
    );
  };

  const filteredTermsheetData = termsheetData.filter(termsheet => {
    const matchesSearch = 
      termsheet.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (termsheet.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (termsheet.organisation?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    if (selectedStatus === 'ALL') return matchesSearch;
    
    return matchesSearch && termsheet.status === selectedStatus;
  });

  const statusCounts = {
    total: termsheetData.length,
    toBeStructurized: termsheetData.filter(ts => ts.status === 'TO BE STRUCTURIZED').length,
    toBeValidated: termsheetData.filter(ts => ts.status === 'TO BE VALIDATED').length,
    validated: termsheetData.filter(ts => ts.status === 'VALIDATED').length,
    rejected: termsheetData.filter(ts => ts.status === 'REJECTED').length,
    accepted: termsheetData.filter(ts => ts.status === 'ACCEPTED').length
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedStatus(e.target.value as StatusFilter);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Function to render file links - only showing links for ACCEPTED termsheets
  const renderFileLinks = (termsheet: Termsheet) => {
    if (termsheet.status === 'ACCEPTED') {
      return (
        <div className="flex flex-col gap-1 text-xs">
          {termsheet.validatedsheetFile && (
            <a 
              href={termsheet.validatedsheetFile.s3Link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-black underline hover:text-gray-700"
            >
              Validated Sheet
            </a>
          )}
        </div>
      );
    }
    
    return (
      <div className="flex flex-col gap-1 text-xs text-gray-500">
        {termsheet.mapsheetFile && <span>Map Sheet</span>}
        {termsheet.structuredsheetFile && <span>Structured Sheet</span>}
        {termsheet.ourtermsheetFile && <span>Our Term Sheet</span>}
        {termsheet.validatedsheetFile && <span>Validated Sheet</span>}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="h-6 w-6 mr-2 text-black" />
            <h1 className="text-xl font-bold text-black">Termsheets Admin</h1>
          </div>
          <Button 
            onClick={loadData} 
            variant="outline" 
            className="text-black border-black hover:bg-gray-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-6 gap-6 mb-8">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Total</span>
                <span className="text-2xl font-bold text-black mt-1">{statusCounts.total}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">To Structure</span>
                <span className="text-2xl font-bold text-black mt-1">{statusCounts.toBeStructurized}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">To Validate</span>
                <span className="text-2xl font-bold text-black mt-1">{statusCounts.toBeValidated}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Validated</span>
                <span className="text-2xl font-bold text-black mt-1">{statusCounts.validated}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Rejected</span>
                <span className="text-2xl font-bold text-black mt-1">{statusCounts.rejected}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">Accepted</span>
                <span className="text-2xl font-bold text-black mt-1">{statusCounts.accepted}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 border border-gray-200 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg font-semibold text-black">Termsheet Overview</CardTitle>
            <CardDescription className="text-gray-500">
              View and manage termsheets across different stages
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title, description or organisation..."
                  className="pl-10 bg-white border-gray-300"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  className="bg-white border border-gray-300 rounded-md py-2 px-3 text-sm"
                  value={selectedStatus}
                  onChange={handleStatusChange}
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

        {/* Termsheets Table */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Loading termsheet data...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-600">Termsheet</TableHead>
                  <TableHead className="font-semibold text-gray-600">Organisation</TableHead>
                  <TableHead className="font-semibold text-gray-600">Status</TableHead>
                  <TableHead className="font-semibold text-gray-600">Files</TableHead>
                  <TableHead className="font-semibold text-gray-600">Created</TableHead>
                  <TableHead className="font-semibold text-gray-600">Team</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTermsheetData.map((termsheet) => (
                  <TableRow 
                    key={termsheet.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <TableCell className="font-medium text-black">
                      <div>
                        <p className="font-semibold">{termsheet.title}</p>
                        {termsheet.description && (
                          <p className="text-sm text-gray-500">{termsheet.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {termsheet.organisation?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(termsheet.status)}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {renderFileLinks(termsheet)}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {formatDate(termsheet.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex">
                        {termsheet.organisation?.users?.slice(0, 3).map((user, idx) => (
                          <div key={user.userId} className="-ml-2 first:ml-0" style={{ zIndex: 10 - idx }}>
                            {getUserAvatar(user.name)}
                          </div>
                        ))}
                        {(termsheet.organisation?.users?.length || 0) > 3 && (
                          <div className="-ml-2" style={{ zIndex: 6 }}>
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gray-100 text-gray-800 text-sm font-medium">
                                +{(termsheet.organisation?.users?.length || 0) - 3}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {/* Accept button - only shown for termsheets that aren't already accepted */}
                        {termsheet.status !== 'ACCEPTED' && termsheet.validatedsheetFile && (
                          <Button 
                            size="sm"
                            variant="outline"
                            className="border-green-600 text-green-600 hover:bg-green-50"
                            onClick={() => handleAcceptTermsheet(termsheet.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                        )}
                        
                        {/* View button */}
                        <Button 
                          size="sm" 
                          className="bg-black text-white hover:bg-gray-800"
                          onClick={() => console.log(`Navigate to termsheet: ${termsheet.id}`)}
                        >
                          View
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTermsheetData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                      No termsheets found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-gray-500 text-center">
            © 2025 Termsheet Management System
          </p>
        </div>
      </footer>
    </div>
  );
}