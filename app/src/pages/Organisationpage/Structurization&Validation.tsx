// src/pages/Organisationpage/PAGE.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  FileIcon,
  CheckIcon,
  AlertTriangleIcon,
  LoaderIcon,
  DownloadIcon,
  FileTypeIcon,
} from "lucide-react";
import { api } from "../../services/axios";

interface Params {
  orgId?: string;
  termsheetId?: string;
  [key: string]: string | undefined;
}


const DocumentViewer = ({ url }: { url: string }) => {
  const [fileType, setFileType] = useState("");

  useEffect(() => {
    if (!url) return;
    const u = url.split("?")[0].toLowerCase();
    if (u.endsWith(".pdf")) setFileType("pdf");
    else if (/\.(jpe?g|png|gif)$/.test(u)) setFileType("image");
    else if (/\.(docx?|doc)$/.test(u)) setFileType("word");
    else if (/\.(xlsx?|xls)$/.test(u)) setFileType("excel");
    else if (u.endsWith(".csv")) setFileType("csv");
    else setFileType("unknown");
  }, [url]);

  const gdoc = `https://docs.google.com/viewer?url=${encodeURIComponent(
    url
  )}&embedded=true`;

  switch (fileType) {
    case "pdf":
    case "image":
      return <iframe src={url} className="w-full h-full border-0" />;
    case "word":
    case "excel":
    case "csv":
      return <iframe src={gdoc} className="w-full h-full border-0" />;
    default:
      return (
        <div className="w-full h-full flex flex-col items-center justify-center space-y-4 text-gray-600">
          <FileTypeIcon size={48} />
          <p>This file type may not be viewable in the browser</p>
          <iframe src={gdoc} className="w-full h-64 border mt-2" />
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
      );
  }
};

const TermsheetPage = () => {
  // only grab orgId from the URL
  const { orgId } = useParams<Params>();
  const numericOrgId = orgId ? parseInt(orgId, 10) : NaN;

  const [termsheetUrl, setTermsheetUrl] = useState("");
  const [termsheetStatus, setTermsheetStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // for "structurize"
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [isStructurizeDialogOpen, setIsStructurizeDialogOpen] =
    useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    console.log("orgId:", orgId, "numericOrgId:", numericOrgId);

    if (isNaN(numericOrgId)) {
      setError("Invalid organisation ID in URL");
      setIsLoading(false);
      return;
    }

    const fetchTermsheet = async () => {
      setIsLoading(true);
      try {
        const resp = await api.get(`/file/termsheet/${numericOrgId}`);
        setTermsheetUrl(resp.data.url || "");
        setTermsheetStatus(resp.data.status || "");
      } catch (e) {
        console.error("Failed to load termsheet", e);
        setError("Failed to load termsheet data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTermsheet();
  }, [numericOrgId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileToUpload(e.target.files?.[0] ?? null);
  };

  const handleStructurize = async () => {
    if (isNaN(numericOrgId)) return;
    setIsProcessing(true);
    setError(null);

    const form = new FormData();
    if (fileToUpload) form.append("file", fileToUpload);
    form.append("chatMessage", chatMessage);
    form.append("orgId", numericOrgId.toString());

    try {
      const res = await api.post(`/file/upload_structured`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTermsheetStatus(res.data.fileId.updatedTermsheet.status || "");
      setIsStructurizeDialogOpen(false);
    } catch (e) {
      console.error(e);
      setError("Failed to structurize the termsheet");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidate = async () => {
    if (termsheetStatus !== "TO BE VALIDATED") {
      setError("This termsheet is not ready for validation");
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      await api.post(`/file/termsheet/${numericOrgId}/validate`);
      const fresh = await api.get(`/file/termsheet/${numericOrgId}`);
      setTermsheetUrl(fresh.data.url || "");
      setTermsheetStatus(fresh.data.status || "");
    } catch (e) {
      console.error(e);
      setError("Failed to validate the termsheet");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearError = () => setError(null);

  const getStatusBadgeText = () => {
    switch (termsheetStatus) {
      case "TO BE STRUCTURIZED":
        return "To Be Structurized";
      case "TO BE_VALIDATED":
        return "To Be Validated";
      case "VALIDATED":
        return "Validated ✓";
      case "STRUCTURIZED":
        return "Structurized ✓";
      default:
        return termsheetStatus;
    }
  };

  const canStruct = termsheetStatus === "TO BE STRUCTURIZED";
  const canValidate = termsheetStatus === "TO BE VALIDATED";

  return (
    <div className="flex h-screen bg-white flex-1">
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="border-b border-gray-200 bg-white p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Termsheet Viewer
            </h1>
            <div className="space-x-3">
              <Dialog
                open={isStructurizeDialogOpen}
                onOpenChange={setIsStructurizeDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={!canStruct || isProcessing}
                    className={`border-black ${
                      !canStruct
                        ? "opacity-50 cursor-not-allowed"
                        : "text-black hover:bg-gray-100"
                    }`}
                  >
                    <FileIcon className="mr-2 h-4 w-4" />
                    {isProcessing ? (
                      <>
                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      "Structurize Sheet"
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Structurize Termsheet</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="file-upload" className="col-span-4">
                        Upload Structured Sheet (Optional)
                      </label>
                      <Input
                        id="file-upload"
                        type="file"
                        className="col-span-4"
                        onChange={handleFileChange}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="chat-message" className="col-span-4">
                        Additional Instructions
                      </label>
                      <Textarea
                        id="chat-message"
                        className="col-span-4 h-[100px]"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Provide any specific instructions…"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsStructurizeDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-black text-white hover:bg-gray-800"
                      onClick={handleStructurize}
                      disabled={isProcessing}
                    >
                      {isProcessing && (
                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Submit
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                onClick={handleValidate}
                disabled={!canValidate || isProcessing}
                className={`border-black ${
                  !canValidate
                    ? "opacity-50 cursor-not-allowed"
                    : "text-black hover:bg-gray-100"
                }`}
              >
                {isProcessing ? (
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckIcon className="mr-2 h-4 w-4" />
                )}
                Validate Sheet
              </Button>
            </div>
          </div>
        </header>

        {/* STATUS BAR */}
        <div className="px-4 py-2 bg-gray-50 flex items-center space-x-4">
          <Badge variant="outline" className="bg-white text-black">
            {getStatusBadgeText()}
          </Badge>
          {termsheetUrl && (
            <a
              href={termsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-gray-600 hover:text-black"
            >
              <DownloadIcon className="h-4 w-4 mr-1" />
              Download Original
            </a>
          )}
        </div>

        {/* VIEWER */}
        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 p-6 overflow-auto">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="ml-auto"
                >
                  Dismiss
                </Button>
              </Alert>
            )}

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <Card className="p-6 shadow-sm border border-gray-200 min-h-[80vh]">
                <div className="mb-4 pb-2 border-b border-gray-100">
                  <h2 className="text-lg font-medium">Termsheet Document</h2>
                  {termsheetStatus && (
                    <p className="text-sm text-gray-500">
                      Status: {termsheetStatus}
                    </p>
                  )}
                </div>
                <div className="prose max-w-none">
                  {termsheetUrl ? (
                    <DocumentViewer url={termsheetUrl} />
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans">
                      No document URL returned by the server.
                    </pre>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsheetPage;
