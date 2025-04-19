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
import { FileIcon, CheckIcon, AlertTriangleIcon, LoaderIcon } from "lucide-react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { api } from "../../services/axios";

const TermsheetPage = () => {
  const { termsheetid } = useParams();
  const termsheetId = parseInt(termsheetid!)
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
        const response=await api.get(`/file/termsheet/${termsheetId}`)
        const data = response.data;
        console.log(data)
        setTermsheetUrl(data.mapsheets3Link || "");
        setTermsheetContent(data.content || "");
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
      formData.append("termsheetId", termsheetId.toString());
      await axios.post(`/api/termsheets/${termsheetId}/structurize`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const updatedTermsheet = await axios.get(`/api/termsheets/${termsheetId}`);
      setTermsheetUrl(updatedTermsheet.data.mapsheets3Link || "");
      setTermsheetStatus(updatedTermsheet.data.status || "");
      setIsStructurizeDialogOpen(false);
      
    } catch (error) {
      console.error("Error structurizing termsheet:", error);
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

  // Determine button state based on termsheet status
  const isStructurizeButtonEnabled = termsheetStatus === "TO BE STRUCTURIZED";
  const isValidateButtonEnabled = termsheetStatus === "TO BE VALIDATED";

  const clearError = () => setError(null);

  // Get human-readable status text
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
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
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

        {/* Status Indicators */}
        <div className="px-4 py-2 bg-gray-50 flex items-center space-x-4">
          <Badge 
            variant="outline" 
            className="bg-white text-black"
          >
            {getStatusBadgeText()}
          </Badge>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Document Display */}
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
                
                {/* Content area - always show original termsheet */}
                <div className="prose max-w-none">
                  <div>
                    {termsheetUrl ? (
                      <div className="aspect-auto h-[70vh] w-full">
                        <iframe 
                          src={termsheetUrl} 
                          className="w-full h-full border-0" 
                          title="Termsheet Document"
                        />
                      </div>
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans">{termsheetContent}</pre>
                    )}
                  </div>
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