import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { FileText, BarChart2, CheckCircle, Terminal, ChevronRight } from "lucide-react";
import OrganizationSidebar from "../../components/comps/Sidebars.tsx/Leftsidebar2";
import TermsheetPage from "./Structurization&Validation";
import StrucutedSheet from "../../components/comps/Documentprocessing/Structuredsheet";
import ValidationSheet from "../../components/comps/Documentprocessing/Validation";
import { DownloadIcon, ShareIcon } from "lucide-react";
import Output from "../../components/comps/Documentprocessing/Output";

const PAGE = () => {
  const [activeTab, setActiveTab] = useState("termsheet");
  
  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50">
      <div className="w-full md:w-auto md:flex-shrink-0 border-r border-gray-200">
        <OrganizationSidebar />
      </div>
      
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="p-3 sm:p-4 md:p-6 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <span>Documents</span>
            <ChevronRight size={16} className="mx-1" />
            <span>Processing</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Document Processing</h1>
        </div>
        
        <div className="flex-1">
          <Tabs 
            defaultValue="termsheet" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <div className="border-b border-gray-200 bg-white flex-shrink-0">
              <TabsList className="h-10 sm:h-12 md:h-14 bg-transparent gap-1 sm:gap-2 p-0 px-3 sm:px-4 md:px-6">
                <TabsTrigger 
                  value="termsheet" 
                  className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-gray-800 data-[state=active]:text-gray-800 data-[state=active]:shadow-none rounded-b-none px-3 sm:px-4 md:px-6 h-10 sm:h-12 md:h-14 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <FileText size={14} className="sm:hidden" />
                    <FileText size={18} className="hidden sm:block" />
                    <span className="font-medium">Original Document</span>
                  </div>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="structured" 
                  className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-gray-800 data-[state=active]:text-gray-800 data-[state=active]:shadow-none rounded-b-none px-3 sm:px-4 md:px-6 h-10 sm:h-12 md:h-14 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <BarChart2 size={14} className="sm:hidden" />
                    <BarChart2 size={18} className="hidden sm:block" />
                    <span className="font-medium">Structured View</span>
                  </div>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="validation" 
                  className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-gray-800 data-[state=active]:text-gray-800 data-[state=active]:shadow-none rounded-b-none px-3 sm:px-4 md:px-6 h-10 sm:h-12 md:h-14 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <CheckCircle size={14} className="sm:hidden" />
                    <CheckCircle size={18} className="hidden sm:block" />
                    <span className="font-medium">Validation</span>
                  </div>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="output" 
                  className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-gray-800 data-[state=active]:text-gray-800 data-[state=active]:shadow-none rounded-b-none px-3 sm:px-4 md:px-6 h-10 sm:h-12 md:h-14 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Terminal size={14} className="sm:hidden" />
                    <Terminal size={18} className="hidden sm:block" />
                    <span className="font-medium">Output</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 bg-white">
              <TabsContent value="termsheet" className="m-0 p-0 h-full outline-none data-[state=active]:h-full">
                <TermsheetPage />
              </TabsContent>
              
              <TabsContent value="structured" className="m-0 p-0 h-full outline-none data-[state=active]:h-full">
                <StrucutedSheet/>
              </TabsContent>
              
              <TabsContent value="validation" className="m-0 p-0 h-full outline-none data-[state=active]:h-full">
                <ValidationSheet/>
              </TabsContent>
              
              <TabsContent value="output" className="m-0 p-0 h-full outline-none data-[state=active]:h-full">
                <Output />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PAGE;