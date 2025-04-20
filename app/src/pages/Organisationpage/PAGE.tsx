import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { FileText, BarChart2, CheckCircle, Terminal, ChevronRight } from "lucide-react";
import OrganizationSidebar from "../../components/comps/Sidebars.tsx/Leftsidebar2";
import TermsheetPage from "./Structurization&Validation";
import StrucutedSheet from "../../components/comps/Documentprocessing/Structuredsheet";
import ValidationSheet from "../../components/comps/Documentprocessing/Validation";

const PAGE = () => {
  const [activeTab, setActiveTab] = useState("termsheet");
  
  return (
    <div className="flex flex-row h-screen bg-gray-50">
      <OrganizationSidebar />
      
      <div className="flex-1 p-8 overflow-auto">
        {/* <div className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <span>Documents</span>
            <ChevronRight size={16} className="mx-1" />
            <span>Processing</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Document Processing</h1>
          <p className="text-gray-500 mt-2">Analyze, structure and validate your documents with precision</p>
        </div> */}
        
        <Tabs 
          defaultValue="termsheet" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="border-b border-gray-200">
            <TabsList className="h-14 bg-transparent gap-2">
              <TabsTrigger 
                value="termsheet" 
                className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none rounded-b-none px-6 h-14"
              >
                <div className="flex items-center gap-2">
                  <FileText size={18} />
                  <span className="font-medium">Termsheet</span>
                </div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="structured" 
                className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none rounded-b-none px-6 h-14"
              >
                <div className="flex items-center gap-2">
                  <BarChart2 size={18} />
                  <span className="font-medium">Structured</span>
                </div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="validation" 
                className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none rounded-b-none px-6 h-14"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} />
                  <span className="font-medium">Validation</span>
                </div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="output" 
                className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none rounded-b-none px-6 h-14"
              >
                <div className="flex items-center gap-2">
                  <Terminal size={18} />
                  <span className="font-medium">Output</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="bg-white rounded-b-lg shadow-sm mt-0">
            <TabsContent value="termsheet" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="p-1">
                <TermsheetPage />
              </div>
            </TabsContent>
            
            <TabsContent value="structured" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="p-1">
                <StrucutedSheet/>
              </div>
            </TabsContent>
            
            <TabsContent value="validation" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="p-1">
                <ValidationSheet/>
              </div>
            </TabsContent>
            
            <TabsContent value="output" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Output</h2>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50">Download</button>
                    <button className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800">Share</button>
                  </div>
                </div>
                <div className="h-96 border rounded-lg flex items-center justify-center bg-gray-50">
                  <p className="text-gray-500">Output content will appear here</p>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default PAGE;