// src/app/(your-folder)/page.tsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { FileText, BarChart2, CheckCircle, Terminal, ChevronRight } from "lucide-react";
import OrganizationSidebar from "../../components/comps/Sidebars.tsx/Leftsidebar2";
import TermsheetPage from "./Structurization&Validation";
import StrucutedSheet from "../../components/comps/Documentprocessing/Structuredsheet";
import ValidationSheet from "../../components/comps/Documentprocessing/Validation";
import { api } from "../../services/axios";
import Output from "../../components/comps/Documentprocessing/Output";
const PAGE = () => {
  const { organisationid } = useParams<{ organisationid: string }>();
  const [activeTab, setActiveTab] = useState("termsheet");

  const [validatedUrl, setValidatedUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [errorPdf, setErrorPdf] = useState<string | null>(null);

  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (activeTab === "output" && organisationid) {
      setLoadingPdf(true);
      setErrorPdf(null);
      api
        .get<{ url: string }>(`/validated_termsheet/${organisationid}`)
        .then((res) => setValidatedUrl(res.data.url))
        .catch(() => setErrorPdf("Failed to load validated document."))
        .finally(() => setLoadingPdf(false));
    }
  }, [activeTab, organisationid]);

  const sendMessage = () => {
    if (!message.trim()) return;
    setChatHistory((prev) => [...prev, message.trim()]);
    setMessage("");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-full md:w-auto md:flex-shrink-0 border-r border-gray-200">
        <OrganizationSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <span>Documents</span>
            <ChevronRight size={16} className="mx-1" />
            <span>Processing</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Document Processing</h1>
        </div>

        {/* Tabs */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs
            defaultValue="termsheet"
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            {/* Tab List */}
            <div className="border-b border-gray-200 bg-white flex-shrink-0">
              <TabsList className="h-12 bg-transparent px-4">
                {[
                  { value: "termsheet", label: "Original Document", icon: FileText },
                  { value: "structured", label: "Structured View", icon: BarChart2 },
                  { value: "validation", label: "Validation", icon: CheckCircle },
                  { value: "output", label: "Output", icon: Terminal },
                ].map(({ value, label, icon: Icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-gray-800 px-4"
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={18} />
                      <span className="font-medium">{label}</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab Panels */}
            <div className="flex-1 overflow-hidden">
              <TabsContent value="termsheet" className="h-full p-0">
                <TermsheetPage />
              </TabsContent>
              <TabsContent value="structured" className="h-full p-0">
                <StrucutedSheet />
              </TabsContent>
              <TabsContent value="validation" className="h-full p-0">
                <ValidationSheet />
              </TabsContent>

              {/* OUTPUT */}
              <TabsContent
                value="output"
                className="h-full relative bg-white"
              >
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
