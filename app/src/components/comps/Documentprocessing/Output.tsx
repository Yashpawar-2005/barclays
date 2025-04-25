"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Skeleton } from "../../ui/skeleton";
import { Alert, AlertDescription } from "../../ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { 
  AlertTriangleIcon, DownloadIcon, FileTypeIcon, SendIcon, 
  MessageSquareIcon, TableIcon, BarChart2Icon, FileTextIcon, ChevronLeftIcon, ChevronRightIcon
} from "lucide-react";
import { useParams } from "react-router-dom";
import { api } from "../../../services/axios";
import { Badge } from "../../ui/badge";
import { Textarea } from "../../ui/textarea";

// Type definitions
type CSVData = string[][];

interface DocumentData {
  url: string;
  status?: string;
}

type Message = {
  role: 'user' | 'system';
  content: string;
  timestamp: Date;
};

const CSVViewer: React.FC<{ url: string }> = ({ url }) => {
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

  const handlePrevRecord = () => {
    setCurrentRecordIndex(prev => Math.max(0, prev - 1));
  };
  
  const handleNextRecord = () => {
    setCurrentRecordIndex(prev => Math.min(rows.length - 1, prev + 1));
  };

  if (loading) return <div className="flex justify-center items-center h-full"><Skeleton className="h-64 w-full" /></div>;
  if (error) return <Alert variant="destructive"><AlertDescription>Error loading CSV: {error}</AlertDescription></Alert>;
  if (!csvData || csvData.length === 0) return <div className="text-center p-4">No data found in CSV file</div>;

  const headers = csvData[0];
  const rows = csvData.slice(1);
  
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
            <FileTextIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Card View
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setViewMode('grid')}
            className={`text-xs py-1 px-2 h-auto ${viewMode === 'grid' ? 'bg-gray-100 border-gray-200 text-gray-700' : ''}`}
          >
            <BarChart2Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
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

      <div className="overflow-auto flex-1">
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
          <div className="rounded-md border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Field Name
                  </th>
                  {rows.slice(0, 10).map((_, rowIndex) => (
                    <th key={rowIndex} className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Record {rowIndex + 1}
                    </th>
                  ))}
                  {rows.length > 10 && (
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      ...
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {headers.map((header, headerIndex) => (
                  <tr key={headerIndex} className={headerIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">
                      {header}
                    </td>
                    {rows.slice(0, 10).map((row, rowIndex) => (
                      <td key={rowIndex} className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-normal break-words">
                        <div className="truncate hover:whitespace-normal">{row[headerIndex] || '-'}</div>
                      </td>
                    ))}
                    {rows.length > 10 && (
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">
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

const DocumentViewer = ({ url }: { url: string }) => {
  const [fileType, setFileType] = useState("");

  useEffect(() => {
    if (!url) return;
    
    const detectFileType = () => {
      const u = url.split("?")[0].toLowerCase();
      if (u.endsWith(".pdf")) return "pdf";
      if (/\.(jpe?g|png|gif)$/.test(u)) return "image";
      if (/\.(docx?|xlsx?|xls)$/.test(u)) return "office";
      if (u.endsWith(".csv")) return "csv";
      return "unknown";
    };
    
    setFileType(detectFileType());
  }, [url]);

  const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  
  if (fileType === "pdf") {
    return <iframe src={url} className="w-full h-full border-0" title="Document Viewer" />;
  }
  
  if (fileType === "image") {
    return (
      <div className="flex items-center justify-center h-full">
        <img src={url} alt="Document" className="max-h-full max-w-full" />
      </div>
    );
  }
  
  if (fileType === "office" || fileType === "csv") {
    return <iframe src={googleDocsViewerUrl} className="w-full h-full border-0" title="Document Viewer" />;
  }
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-4 text-gray-600">
      <FileTypeIcon size={48} />
      <p>This file type may not be viewable in the browser</p>
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
};

const ChatWithDocument: React.FC<{ url: string }> = ({ url }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'Welcome! I can help answer questions about the document you\'re viewing.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user' as const, content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Simulate API call to LLM
    setTimeout(() => {
      const botResponse = { 
        role: 'system' as const, 
        content: `I've analyzed the document and found information related to your query: "${input}". This is a simulated response as the actual AI processing would be implemented by your backend service.`, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col">
      <div className="p-3 mb-2 bg-gray-50 rounded-md">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`mb-3 p-2 sm:p-3 rounded-lg max-w-[80%] ${
              msg.role === 'user' 
                ? 'ml-auto bg-gray-200 text-gray-800' 
                : 'mr-auto bg-white border border-gray-200 text-gray-700'
            }`}
          >
            <p className="text-xs sm:text-sm">{msg.content}</p>
            <p className="text-[10px] text-gray-500 mt-1 text-right">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ))}
        {isLoading && (
          <div className="mr-auto p-3 rounded-lg bg-gray-100 max-w-[80%]">
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex items-center space-x-2 py-2">
        <Textarea
          placeholder="Ask a question about this document..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-10 max-h-32 text-sm resize-none border-gray-300 focus:border-gray-500 focus:ring-gray-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button 
          className="bg-white border border-gray-300 hover:bg-gray-50 h-10 px-3 text-gray-800"
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
        >
          <SendIcon className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  );
};

const Output: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const documentId = orgId ? parseInt(orgId) : null;
  const [documentUrl, setDocumentUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("chat");
  
  useEffect(() => {
    const fetchDocumentData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await api.get<DocumentData>(`/file/structured_termsheet/${orgId}`);
        const data = response.data;
        setDocumentUrl(data.url || "");
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching document:", error);
        setError("Failed to load document data");
        setIsLoading(false);
      }
    };

    if (documentId) {
      fetchDocumentData();
    }
  }, [documentId, orgId]);

  const clearError = (): void => setError(null);
  
  return (
    <div className="min-h-full w-full flex flex-col bg-white">
      <header className="border-b border-gray-200 bg-white p-3 sm:p-4 shadow-sm flex-shrink-0">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Document Output</h1>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-gray-600 text-gray-600 hover:bg-gray-50 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 h-auto"
                >
                  <DownloadIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
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
                      href={documentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex flex-col items-center justify-center p-5 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-center shadow-sm"
                    >
                      <FileTextIcon className="h-9 w-9 mb-3 text-gray-700" />
                      <span className="text-sm font-semibold text-gray-900">Original Format</span>
                      <span className="text-xs text-gray-700 mt-1">Download as is</span>
                    </a>
                    <a 
                      href={`${documentUrl}?format=csv`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex flex-col items-center justify-center p-5 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-center shadow-sm"
                    >
                      <TableIcon className="h-9 w-9 mb-3 text-gray-700" />
                      <span className="text-sm font-semibold text-gray-900">CSV Format</span>
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
          </div>
        </div>
      </header>
      
      <div className="flex-1">
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
          <Card className="shadow-sm border border-gray-200 flex flex-col min-h-[500px]">
            <Tabs 
              defaultValue="chat" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col"
            >
              <div className="border-b border-gray-200 p-2 sm:p-3 flex-shrink-0">
                <TabsList className="h-8 bg-gray-100 p-1">
                  <TabsTrigger 
                    value="chat" 
                    className="text-xs flex items-center gap-1 h-6 px-2 sm:px-3 data-[state=active]:bg-white data-[state=active]:text-gray-800"
                  >
                    <MessageSquareIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Chat with Document</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="csv" 
                    className="text-xs flex items-center gap-1 h-6 px-2 sm:px-3 data-[state=active]:bg-white data-[state=active]:text-gray-800"
                  >
                    <TableIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>CSV View</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 p-3 sm:p-4">
                {isLoading ? (
                  <div className="space-y-3 sm:space-y-4 h-full">
                    <Skeleton className="h-6 sm:h-8 w-1/2 mx-auto" />
                    <Skeleton className="h-48 sm:h-64 w-full" />
                  </div>
                ) : documentUrl ? (
                  <>
                    <TabsContent value="chat" className="mt-0 flex-1">
                      <div className="w-full">
                        <ChatWithDocument url={documentUrl} />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="csv" className="h-full mt-0 flex-1 overflow-hidden">
                      <div className="w-full h-full overflow-auto">
                        <CSVViewer url={documentUrl} />
                      </div>
                    </TabsContent>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>No document available</p>
                  </div>
                )}
              </div>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Output; 