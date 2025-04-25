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
import { FileIcon, CheckIcon, AlertTriangleIcon, LoaderIcon, DownloadIcon, FileTypeIcon, FileTextIcon, TableIcon } from "lucide-react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { api } from "../../services/axios";

const DocumentViewer = ({ url }: { url: string }) => {
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
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
            >
              <DownloadIcon size={16} />
              <span>Download File</span>
            </a>
          </div>
        );
    }
  };

  return (
    <div className="h-full w-full">
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
        setTermsheetContent("where is the content visisble");
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
  // const isValidateButtonEnabled = termsheetStatus === "TO BE VALIDATED";

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
    <div className="h-full w-full flex flex-col bg-white">
      <header className="border-b border-gray-200 bg-white p-3 sm:p-4 shadow-sm flex-shrink-0">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Original Document</h1>
            <Badge 
              variant="outline" 
              className="ml-2 bg-gray-50 text-gray-700 border-gray-200"
            >
              {getStatusBadgeText()}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <Dialog open={isStructurizeDialogOpen} onOpenChange={setIsStructurizeDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`border-gray-600 ${!isStructurizeButtonEnabled ? 'opacity-50 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'} text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 h-auto`}
                  disabled={!isStructurizeButtonEnabled || isProcessing}
                >
                  <FileIcon className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {isProcessing ? (
                    <><LoaderIcon className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />Processing...</>
                  ) : (
                    "Structurize"
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px] bg-white border-0 shadow-lg">
                <DialogHeader className="border-b pb-4">
                  <DialogTitle className="text-lg font-semibold text-gray-900">Structurize Document</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 sm:gap-5 py-5">
                  <div className="grid grid-cols-4 items-center gap-3 sm:gap-4">
                    <label htmlFor="file-upload" className="col-span-4 text-sm font-medium text-gray-800">
                      Upload Structured Sheet (Optional)
                    </label>
                    <Input
                      id="file-upload"
                      type="file"
                      className="col-span-4 text-xs sm:text-sm border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-3 sm:gap-4">
                    <label htmlFor="chat-message" className="col-span-4 text-sm font-medium text-gray-800">
                      Additional Instructions
                    </label>
                    <Textarea
                      id="chat-message"
                      className="col-span-4 h-[80px] sm:h-[100px] text-xs sm:text-sm border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                      placeholder="Provide any specific instructions for structurizing..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter className="border-t pt-4 flex justify-between w-full sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsStructurizeDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    className="bg-gray-800 text-white hover:bg-gray-900 font-medium"
                    onClick={handleStructurize}
                    disabled={isProcessing}
                  >
                    {isProcessing && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                    Submit
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {termsheetUrl && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="text-gray-600 border-gray-200 hover:bg-gray-50 text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 h-auto"
                  >
                    <DownloadIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Export
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px] bg-white border-0 shadow-lg">
                  <DialogHeader className="border-b pb-4">
                    <DialogTitle className="text-lg font-semibold text-gray-900">Export Document</DialogTitle>
                  </DialogHeader>
                  <div className="py-5 space-y-5">
                    <p className="text-sm text-gray-800">Choose a format to export this document:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <a 
                        href={termsheetUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex flex-col items-center justify-center p-5 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-center shadow-sm"
                      >
                        <FileTextIcon className="h-9 w-9 mb-3 text-gray-700" />
                        <span className="text-sm font-semibold text-gray-900">Original</span>
                        <span className="text-xs text-gray-700 mt-1">Download as PDF</span>
                      </a>
                      <a 
                        href={`${termsheetUrl}?format=csv`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex flex-col items-center justify-center p-5 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-center shadow-sm"
                      >
                        <TableIcon className="h-9 w-9 mb-3 text-gray-700" />
                        <span className="text-sm font-semibold text-gray-900">Data</span>
                        <span className="text-xs text-gray-700 mt-1">Download as CSV</span>
                      </a>
                    </div>
                  </div>
                  <DialogFooter className="border-t pt-4">
                    <Button variant="outline" className="w-full font-medium">
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>
      
      <div className="flex-1 overflow-auto">
        {error && (
          <Alert variant="destructive" className="m-3 sm:m-4 flex-shrink-0">
            <AlertTriangleIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <AlertDescription>{error}</AlertDescription>
            <Button variant="ghost" size="sm" onClick={clearError} className="ml-auto text-xs py-1 px-2 h-auto">
              Dismiss
            </Button>
          </Alert>
        )}

        <div className="p-3 sm:p-6">
          <Card className="shadow-sm border border-gray-200 flex flex-col">
            <div className="overflow-auto h-[550px] flex items-center justify-center">
              {isLoading ? (
                <div className="p-4 space-y-4 w-full">
                  <Skeleton className="h-6 sm:h-8 w-1/2 mx-auto" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-2/3 mx-auto" />
                  <Skeleton className="h-48 sm:h-64 w-full" />
                </div>
              ) : termsheetUrl ? (
                <div className="h-full w-full">
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
      </div>
    </div>
  );
};

export default TermsheetPage;