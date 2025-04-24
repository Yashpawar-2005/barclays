"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "../../components/ui/dialog";
import { FileIcon, CheckIcon, AlertTriangleIcon, LoaderIcon, DownloadIcon,  FileTypeIcon } from "lucide-react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { api } from "../../services/axios";
//@ts-ignore
const DocumentViewer = ({ url }) => {
  const [fileType, setFileType] = useState("");

  useEffect(() => {
    if (!url) return;
    
    const detectFileType = () => {
      const urlWithoutParams = url.split('?')[0].toLowerCase();
      if (urlWithoutParams.endsWith('.pdf')) return 'pdf';
      if (urlWithoutParams.endsWith('.jpg') || urlWithoutParams.endsWith('.jpeg') || urlWithoutParams.endsWith('.png') || urlWithoutParams.endsWith('.gif')) return 'image';
      if (urlWithoutParams.endsWith('.docx') || urlWithoutParams.endsWith('.doc')) return 'word';
      if (urlWithoutParams.endsWith('.xlsx') || urlWithoutParams.endsWith('.xls')) return 'excel';
      if (urlWithoutParams.endsWith('.csv')) return 'csv';
      return 'unknown';
    };
    
    setFileType(detectFileType());
  }, [url]);
  const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  const renderViewer = () => {
    switch (fileType) {
      case 'pdf':
      case 'image':
        return (
          <iframe 
            src={url} 
            className="w-full h-full border-0" 
            title="Document Viewer"
          />
        );
      case 'word':
      case 'excel':
      case 'csv':
        return (
          <iframe 
            src={googleDocsViewerUrl} 
            className="w-full h-full border-0" 
            title="Document Viewer"
          />
        );
      case 'unknown':
      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-4 text-gray-600">
            <FileTypeIcon size={48} />
            <p>This file type may not be viewable in the browser</p>
            <div className="flex flex-col items-center">
              <p>Try using Google Docs Viewer:</p>
              <iframe 
                src={googleDocsViewerUrl} 
                className="w-full h-64 border mt-2" 
                title="Google Docs Viewer"
              />
            </div>
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

  return (
    <div className="aspect-auto h-[70vh] w-full">
      {renderViewer()}
    </div>
  );
};

const TermsheetPage = () => {
  const { orgId } = useParams();
  const termsheetId = parseInt(orgId!)
  const [termsheetUrl, setTermsheetUrl] = useState("");
  const [termsheetContent, setTermsheetContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [termsheetStatus, setTermsheetStatus] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isStructurizeDialogOpen, setIsStructurizeDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTermsheetData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/file/termsheet/${orgId}`)
        const data = response.data;
        console.log(data)
        setTermsheetUrl(data.url || "");
        setTermsheetContent( "where is the content visisble");
        setTermsheetStatus(data.status || "");
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching termsheet:", error);
        setError("Failed to load termsheet data");
        setIsLoading(false);
      }
    };

    if (termsheetId) {
      fetchTermsheetData();
    }
  }, [termsheetId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
    }
  };

  const handleStructurize = async () => {
    try {
      setIsProcessing(true);
      const formData = new FormData();
      if (fileToUpload) {
        formData.append("file", fileToUpload);
      }
      formData.append("chatMessage", chatMessage);
      formData.append("orgId", termsheetId.toString());
      const res=await api.post(`/file/upload_structured`,formData,{
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      console.log(res)
      alert("structurized now validate it later")
      setTermsheetStatus(res.data.fileId.updatedTermsheet.status|| "");
      setIsStructurizeDialogOpen(false);
      
    } catch (error) {
      console.error("Error structurizing termsheet:", error);
      setError("Failed to structurize the termsheet");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidate = async () => {
    //python ka backend hoga nigga yahape
    if (termsheetStatus !== "TO BE VALIDATED") {
      setError("This termsheet is not ready for validation");
      return;
    }
    
    try {
      setIsProcessing(true);
      await axios.post(`/api/termsheets/${termsheetId}/validate`);
      const updatedTermsheet = await axios.get(`/api/termsheets/${termsheetId}`);
      setTermsheetUrl(updatedTermsheet.data.mapsheets3Link || "");
      setTermsheetStatus(updatedTermsheet.data.status || "");
      
    } catch (error) {
      console.error("Error validating termsheet:", error);
      setError("Failed to validate the termsheet");
    } finally {
      setIsProcessing(false);
    }
  };

  
  const isStructurizeButtonEnabled = termsheetStatus === "TO BE STRUCTURIZED";
  const isValidateButtonEnabled = termsheetStatus === "TO BE VALIDATED";

  const clearError = () => setError(null);
  const getStatusBadgeText = () => {
    switch(termsheetStatus) {
      case "TO BE STRUCTURIZED":
        return "To Be Structurized";
      case "TO BE VALIDATED":
        return "To Be Validated";
      case "VALIDATED":
        return "Validated ✓";
      case "STRUCTURIZED":
        return "Structurized ✓";
      default:
        return termsheetStatus;
    }
  };

  return (
    <div className="flex h-screen bg-white flex-1">
      <div className="flex-1 flex flex-col">
        <header className="border-b border-gray-200 bg-white p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">Termsheet Viewer</h1>
            <div className="space-x-3">
              <Dialog open={isStructurizeDialogOpen} onOpenChange={setIsStructurizeDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={`border-black ${!isStructurizeButtonEnabled ? 'opacity-50 cursor-not-allowed' : 'text-black hover:bg-gray-100'}`}
                    disabled={!isStructurizeButtonEnabled || isProcessing}
                  >
                    <FileIcon className="mr-2 h-4 w-4" />
                    {isProcessing ? (
                      <><LoaderIcon className="mr-2 h-4 w-4 animate-spin" />Processing...</>
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
                        placeholder="Provide any specific instructions for structurizing..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsStructurizeDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      className="bg-black text-white hover:bg-gray-800"
                      onClick={handleStructurize}
                      disabled={isProcessing}
                    >
                      {isProcessing && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                      Submit
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button 
                variant="outline" 
                className={`border-black ${!isValidateButtonEnabled ? 'opacity-50 cursor-not-allowed' : 'text-black hover:bg-gray-100'}`}
                disabled={!isValidateButtonEnabled || isProcessing}
                onClick={handleValidate}
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
        <div className="px-4 py-2 bg-gray-50 flex items-center space-x-4">
          <Badge 
            variant="outline" 
            className="bg-white text-black"
          >
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
        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 p-6 overflow-auto">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
                <Button variant="ghost" size="sm" onClick={clearError} className="ml-auto">
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
                  <h2 className="text-lg font-medium">
                    Termsheet Document
                  </h2>
                  {termsheetStatus && (
                    <p className="text-sm text-gray-500">Status: {termsheetStatus}</p>
                  )}
                </div>
                <div className="prose max-w-none">
                  {termsheetUrl ? (
                    <DocumentViewer url={termsheetUrl} />
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans">{termsheetContent}</pre>
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