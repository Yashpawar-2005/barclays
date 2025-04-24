// src/components/comps/admin/Adminpage.tsx

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Search,
  Filter,
  RefreshCw,
  ArrowRight,
  FileText,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { api } from "../../../services/axios";

type TermsheetStatus =
  | "TO BE STRUCTURIZED"
  | "TO BE VALIDATED"
  | "VALIDATED"
  | "REJECTED"
  | "ACCEPTED";

interface FileType { id: number; s3Link: string }
interface User { userId: number; name: string; email: string; role: string }
interface OrgUser { user: User }
interface Organisation { id: number; name: string; users: OrgUser[] }
interface Termsheet {
  id: number;
  title: string;
  description?: string;
  status: TermsheetStatus;
  organisationId: number;
  createdAt: string;
  mapsheetFile?: FileType;
  structuredsheetFile?: FileType;
  ourtermsheetFile?: FileType;
  validatedsheetFile?: FileType;
  coloursheetFile?: FileType;
  organisation: Organisation;
}

type StatusFilter = TermsheetStatus | "ALL";

export default function Adminpage() {
  const navigate = useNavigate();
  const { orgId: orgIdParam } = useParams<{ orgId: string }>();
  const orgId = Number(orgIdParam);

  const [termsheetData, setTermsheetData] = useState<Termsheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("ALL");

  useEffect(() => {
    if (!orgIdParam || isNaN(orgId)) return;

    setLoading(true);
    api
      .get("/termsheet", { params: { organisationId: orgId } })
      .then((res) => {
        console.log(
          "⚙️ fetched termsheets:",
          JSON.stringify(res.data.termsheets, null, 2)
        );
        setTermsheetData(res.data.termsheets);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orgIdParam, orgId]);

  const getStatusBadge = (s: TermsheetStatus) => {
    const variants: Record<TermsheetStatus, string> = {
      "TO BE STRUCTURIZED": "bg-gray-100 text-gray-800",
      "TO BE VALIDATED": "bg-gray-100 text-gray-800",
      VALIDATED: "bg-gray-100 text-gray-800",
      REJECTED: "bg-black text-white",
      ACCEPTED: "bg-white text-black border border-black",
    };
    return <Badge className={`${variants[s]} font-medium`}>{s}</Badge>;
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const renderFileLinks = (t: Termsheet) => {
    if (t.ourtermsheetFile) {
      return (
        <a
          href={t.ourtermsheetFile.s3Link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-black underline hover:text-gray-700 text-xs"
        >
          Our Term Sheet
        </a>
      );
    }
    if (t.status === "ACCEPTED" && t.validatedsheetFile) {
      return (
        <a
          href={t.validatedsheetFile.s3Link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-black underline hover:text-gray-700 text-xs"
        >
          Validated Sheet
        </a>
      );
    }
    // fallback placeholders
    const placeholders: string[] = [];
    if (t.mapsheetFile) placeholders.push("Map Sheet");
    if (t.structuredsheetFile) placeholders.push("Structured Sheet");
    if (t.validatedsheetFile) placeholders.push("Validated Sheet");
    if (t.coloursheetFile) placeholders.push("Colour Sheet");

    return (
      <div className="flex flex-col gap-1 text-xs text-gray-500">
        {placeholders.map((label) => (
          <span key={`${t.id}-${label}`}>{label}</span>
        ))}
      </div>
    );
  };

  const filtered = termsheetData.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.organisation.name.toLowerCase().includes(searchTerm.toLowerCase());

    return selectedStatus === "ALL"
      ? matchSearch
      : matchSearch && t.status === selectedStatus;
  });

  const counts = {
    total: termsheetData.length,
    toBeStruct: termsheetData.filter((t) => t.status === "TO BE STRUCTURIZED")
      .length,
    toBeValid: termsheetData.filter((t) => t.status === "TO BE VALIDATED")
      .length,
    validated: termsheetData.filter((t) => t.status === "VALIDATED").length,
    rejected: termsheetData.filter((t) => t.status === "REJECTED").length,
    accepted: termsheetData.filter((t) => t.status === "ACCEPTED").length,
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
            onClick={() => window.location.reload()}
            variant="outline"
            className="text-black border-black hover:bg-gray-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow max-w-7xl mx-auto px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-6 gap-6 mb-8">
          {Object.entries(counts).map(([key, cnt]) => {
            const labels: Record<string, string> = {
              total: "Total",
              toBeStruct: "To Structure",
              toBeValid: "To Validate",
              validated: "Validated",
              rejected: "Rejected",
              accepted: "Accepted",
            };
            return (
              <Card key={key} className="border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <span className="text-sm font-medium text-gray-500">
                    {labels[key]}
                  </span>
                  <span className="text-2xl font-bold text-black mt-1">
                    {cnt}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="mb-8 border border-gray-200 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg font-semibold text-black">
              Termsheet Overview
            </CardTitle>
            <CardDescription className="text-gray-500">
              View and manage termsheets for this organisation
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  className="bg-white border border-gray-300 rounded-md py-2 px-3 text-sm"
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as StatusFilter)
                  }
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

        {/* Table */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Loading termsheet data...</p>
            </div>
          ) : (
            <Table>
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
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <TableCell>
                      <p className="font-semibold">{t.title}</p>
                      {t.description && (
                        <p className="text-sm text-gray-500">
                          {t.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>{t.organisation.name}</TableCell>
                    <TableCell>{getStatusBadge(t.status)}</TableCell>
                    <TableCell>{renderFileLinks(t)}</TableCell>
                    <TableCell>{formatDate(t.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex -ml-2">
                        {t.organisation.users.slice(0, 3).map((u, i) => (
                          <Avatar
                            key={u.user.userId}
                            className="h-8 w-8 mr-2"
                            style={{ zIndex: 10 - i }}
                          >
                            <AvatarImage
                              src={`/api/placeholder/40/40`}
                              alt={u.user.name}
                            />
                            <AvatarFallback className="bg-gray-100 text-gray-800 text-sm font-medium">
                              {u.user.name
                                .split(" ")
                                .map((p) => p[0])
                                .join("")
                                .substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {t.organisation.users.length > 3 && (
                          <Avatar
                            key="overflow"
                            className="h-8 w-8 -ml-2"
                          >
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
                        className="bg-black text-white hover:bg-gray-800"
                        onClick={() =>
                          navigate(`/admin/${orgId}/termsheet/${t.id}`)
                        }
                      >
                        View
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-gray-500"
                    >
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
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-500">
            © 2025 Termsheet Management System
          </p>
        </div>
      </footer>
    </div>
  );
}
