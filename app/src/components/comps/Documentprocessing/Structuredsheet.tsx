"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Skeleton } from "../../ui/skeleton";
import { Alert, AlertDescription } from "../../ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../../ui/dialog';
import { AlertTriangleIcon, DownloadIcon, ChevronLeftIcon, ChevronRightIcon, FilePlusIcon, BarChart2, FileText, FileIcon } from "lucide-react";
import { useParams } from "react-router-dom";
import { api } from "../../../services/axios";
import { Badge } from "../../ui/badge";

// Type definitions
type CSVData = string[][];

interface CSVViewerProps {
  url: string;
}

interface TermsheetData {
  url: string;
  status?: string;
}

// Vertical CSV Viewer component
const VerticalCSVViewer: React.FC<CSVViewerProps> = ({ url }) => {
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

  // CSV parsing function
  const parseCSV = (text: string): CSVData => {
    // Split by lines and handle quotes properly
    const lines = text.split(/\r?\n/);
    const data: CSVData = [];
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      // Match CSV fields - handles quotes and commas
      const fields = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
      
      // Clean up quotes
      const cleanFields = fields.map(field => 
        field.startsWith('"') && field.endsWith('"') 
          ? field.substring(1, field.length - 1) 
          : field
      );
      
      data.push(cleanFields);
    }
    
    return data;
  };

  if (loading) return <div className="flex justify-center items-center h-full"><Skeleton className="h-64 w-full" /></div>;
  if (error) return <Alert variant="destructive"><AlertDescription>Error loading CSV: {error}</AlertDescription></Alert>;
  if (!csvData || csvData.length === 0) return <div className="text-center p-4">No data found in CSV file</div>;

  const headers = csvData[0];
  const rows = csvData.slice(1);
  
  const handlePrevRecord = () => {
    setCurrentRecordIndex(prev => Math.max(0, prev - 1));
  };
  
  const handleNextRecord = () => {
    setCurrentRecordIndex(prev => Math.min(rows.length - 1, prev + 1));
  };

  return (
    <div className="space-y-3 sm:space-y-4 h-full">
      <div className="flex flex-wrap justify-between items-center mb-2 sm:mb-4 gap-2">
        <div className="flex flex-wrap space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setViewMode('card')}
            className={`text-xs py-1 px-2 h-auto ${viewMode === 'card' ? 'bg-gray-100 border-gray-200 text-gray-700' : ''}`}
          >
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Card View
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setViewMode('grid')}
            className={`text-xs py-1 px-2 h-auto ${viewMode === 'grid' ? 'bg-gray-100 border-gray-200 text-gray-700' : ''}`}
          >
            <BarChart2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
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
          // Card view - vertical display
          <Card className="shadow-sm border border-gray-200 overflow-hidden bg-white">
            <div className="p-2 sm:p-4 bg-gray-100 border-b border-gray-200">
              <h3 className="font-medium text-sm sm:text-base text-gray-800">Record {currentRecordIndex + 1}</h3>
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
          // Grid view - similar to Excel but with focus on vertical alignment
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 text-xs sm:text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Field Name
                  </th>
                  {rows.slice(0, 10).map((_, rowIndex) => (
                    <th key={rowIndex} className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Record {rowIndex + 1}
                    </th>
                  ))}
                  {rows.length > 10 && (
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
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

const StructuredSheet: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const termsheetId = orgId ? parseInt(orgId) : null;
  const [termsheetUrl, setTermsheetUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  
  useEffect(() => {
    const fetchTermsheetData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await api.get<TermsheetData>(`/file/structured_termsheet/${orgId}`);
        const data = response.data;
        setTermsheetUrl(data.url || "");
        setStatus(data.status || "");
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
  }, [termsheetId, orgId]);

  const clearError = (): void => setError(null);

  return (
    <div className="h-full w-full flex flex-col bg-white">
      <header className="border-b border-gray-200 bg-white p-3 sm:p-4 shadow-sm flex-shrink-0">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Structured Document</h1>
            {status && (
              <Badge 
                variant="outline" 
                className="ml-2 bg-gray-50 text-gray-700 border-gray-200"
              >
                {status}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              className="border-gray-600 text-gray-600 hover:bg-gray-50 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 h-auto"
            >
              <FilePlusIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              New Record
            </Button>
            
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
                  <DialogTitle className="text-lg font-semibold text-gray-900">Export Structured Document</DialogTitle>
                </DialogHeader>
                <div className="py-5 space-y-5">
                  <p className="text-sm text-gray-800">Choose a format to export this document:</p>
                  <div className="grid grid-cols-2 gap-4">
                    {termsheetUrl && (
                      <>
                        <a 
                          href={termsheetUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex flex-col items-center justify-center p-5 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-center shadow-sm"
                          onClick={() => setIsExportDialogOpen(false)}
                        >
                          <FileIcon className="h-9 w-9 mb-3 text-gray-700" />
                          <span className="text-sm font-semibold text-gray-900">CSV Format</span>
                          <span className="text-xs text-gray-700 mt-1">Download structured data</span>
                        </a>
                        <a 
                          href={`${termsheetUrl}?format=excel`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex flex-col items-center justify-center p-5 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-center shadow-sm"
                          onClick={() => setIsExportDialogOpen(false)}
                        >
                          <BarChart2 className="h-9 w-9 mb-3 text-gray-700" />
                          <span className="text-sm font-semibold text-gray-900">Excel Format</span>
                          <span className="text-xs text-gray-700 mt-1">Download as Excel</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <DialogFooter className="border-t pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsExportDialogOpen(false)} className="w-full font-medium">
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
            {/* {termsheetUrl && (
              <div className="p-2 border-b border-gray-100 bg-white flex-shrink-0">
                <div className="flex justify-end items-center">
                  <a 
                    href={termsheetUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-gray-600 hover:text-gray-800 flex items-center"
                  >
                    <DownloadIcon className="h-3 w-3 mr-1" />
                    Download
                  </a>
                </div>
              </div>
            )} */}
            <div className="flex-1 overflow-auto h-[550px] p-3 sm:p-4 flex items-center justify-center">
              {isLoading ? (
                <div className="space-y-3 sm:space-y-4 w-full">
                  <Skeleton className="h-6 sm:h-8 w-1/2 mx-auto" />
                  <Skeleton className="h-48 sm:h-64 w-full" />
                </div>
              ) : termsheetUrl ? (
                <div className="w-full">
                  <VerticalCSVViewer url={termsheetUrl} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>No CSV file available</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StructuredSheet;