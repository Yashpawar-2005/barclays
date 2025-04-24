"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Skeleton } from "../../ui/skeleton";
import { Alert, AlertDescription } from "../../ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../../ui/dialog';
import { AlertTriangleIcon, DownloadIcon, ChevronLeftIcon, ChevronRightIcon, FilePlusIcon } from "lucide-react";
import { useParams } from "react-router-dom";
import { api } from "../../../services/axios";

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
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('card');

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
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setViewMode('card')}
            className={viewMode === 'card' ? 'bg-gray-100' : ''}
          >
            Card View
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-gray-100' : ''}
          >
            Grid View
          </Button>
        </div>

        {viewMode === 'card' && (
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevRecord}
              disabled={currentRecordIndex === 0}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Record {currentRecordIndex + 1} of {rows.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextRecord}
              disabled={currentRecordIndex >= rows.length - 1}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {viewMode === 'card' ? (
        // Card view - vertical display
        <Card className="shadow-sm border border-gray-200 overflow-hidden bg-white">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-medium">Record {currentRecordIndex + 1}</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {headers.map((header, index) => (
              <div key={index} className="flex flex-col sm:flex-row p-4 hover:bg-gray-50">
                <div className="w-full sm:w-1/3 font-medium text-gray-700 mb-1 sm:mb-0">
                  {header}
                </div>
                <div className="w-full sm:w-2/3 text-gray-900">
                  {rows[currentRecordIndex]?.[index] || '-'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        // Grid view - similar to Excel but with focus on vertical alignment
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field Name
                </th>
                {rows.slice(0, 10).map((_, rowIndex) => (
                  <th key={rowIndex} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Record {rowIndex + 1}
                  </th>
                ))}
                {rows.length > 10 && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ...
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {headers.map((header, headerIndex) => (
                <tr key={headerIndex} className={headerIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {header}
                  </td>
                  {rows.slice(0, 10).map((row, rowIndex) => (
                    <td key={rowIndex} className="px-4 py-3 text-sm text-gray-500">
                      {row[headerIndex] || '-'}
                    </td>
                  ))}
                  {rows.length > 10 && (
                    <td className="px-4 py-3 text-sm text-gray-500">
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
  );
};

const StructuredSheet: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const termsheetId = orgId ? parseInt(orgId) : null;
  const [termsheetUrl, setTermsheetUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTermsheetData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await api.get<TermsheetData>(`/file/structured_termsheet/${orgId}`);
        const data = response.data;
        setTermsheetUrl(data.url || "");
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
    <div className="flex h-screen bg-white flex-1">
      <div className="flex-1 flex flex-col">
        <header className="border-b border-gray-200 bg-white p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">Excel-like CSV Viewer</h1>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="border-black text-black hover:bg-gray-100"
              >
                <FilePlusIcon className="mr-2 h-4 w-4" />
                New Record
              </Button>
              
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
                    <DialogTitle>Export CSV</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <p>Are you sure you want to export this CSV file?</p>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                      Cancel
                    </Button>
                    {termsheetUrl && (
                      <Button 
                        className="bg-black text-white hover:bg-gray-800"
                        disabled={false}
                      >
                        <a 
                          href={termsheetUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center text-sm"
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
                  <VerticalCSVViewer url={termsheetUrl} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>No CSV file available</p>
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

export default StructuredSheet;