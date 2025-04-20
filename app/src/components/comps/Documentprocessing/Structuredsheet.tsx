"use client";

import { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Skeleton } from "../../ui/skeleton";
import { Alert, AlertDescription } from "../../ui/alert";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger} from '../../ui/dialog'
import {  AlertTriangleIcon,  DownloadIcon, FileTypeIcon } from "lucide-react";
import { useParams } from "react-router-dom";

import { api } from "../../../services/axios";
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

const StrucutedSheet = () => {
  const { orgid } = useParams();
  const termsheetId = parseInt(orgid!)
  const [termsheetUrl, setTermsheetUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [termsheetStatus, setTermsheetStatus] = useState("");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchTermsheetData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/file/structured_termsheet/${orgid}`)
        const data = response.data;
        setTermsheetUrl(data.url || "");
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
  }, [termsheetId, orgid]);

  const clearError = () => setError(null);

  return (
    <div className="flex h-screen bg-white flex-1">
      <div className="flex-1 flex flex-col">
        <header className="border-b border-gray-200 bg-white p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">Structured Termsheet Viewer</h1>
            <div>
              <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="border-black text-black hover:bg-gray-100"
                  >
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
                         <Button 
                          className="bg-black text-white hover:bg-gray-800"
                          disabled={false}>
                        <a 
                        href={termsheetUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center text-sm bg-black text-white hover:bg-gray-800"
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
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <Card className="p-6 shadow-sm border border-gray-200 min-h-[80vh]">
                {termsheetUrl ? (
                  <DocumentViewer url={termsheetUrl} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>No document available</p>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrucutedSheet;