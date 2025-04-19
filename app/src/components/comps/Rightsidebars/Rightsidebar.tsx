import { TermsheetDetailsCard } from "./termsheetinputs/TermsheetDetailCard"
import { useState, useRef } from "react"
import { Button } from "../../ui/button"
import { Card } from "../../ui/card"
import { Textarea } from "../../ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { TeamMemberSidebar } from "./termsheetinputs/teammembers"
import { FileUploadArea } from "./termsheetinputs/FileUploadArea"
import { EmailInfoForm } from "./termsheetinputs/Email"
import { 
  FileText, Upload, CheckCircle,  Mail, 
  MessageSquare, Send, Download,
  Info
} from "lucide-react"
import { api } from "../../../services/axios"
import { Alert, AlertDescription } from "../../ui/alert"
type Member = {
  id: string
  name: string
  role: string
  avatar?: string
  
}
export function TermsheetSection() {
  const [activeTab, setActiveTab] = useState("upload")
  const [termsheetName, setTermsheetName] = useState("")
  const [termsheetDate, setTermsheetDate] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [email, setEmail] = useState("")
  const [orderId, setOrderId] = useState("")
  const [directTermsheetContent, setDirectTermsheetContent] = useState("")
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionSuccess, setExtractionSuccess] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [members, setMembers] = useState<Member[]>([])

  
  const handleUploadSubmit = async () => {
    console.log("hi")
    if (!file) {
      alert("Please select a file to upload.")
      return
    }
  
    const formData = new FormData()
    formData.append("file", file) 
  
    try {
      const res = await api.post("/file/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
  
      console.log("Upload success:", res.data)
      alert("File uploaded successfully!")
      setFile(null)
    } catch (error) {
      console.error("File upload failed:", error)
      alert("Failed to upload file. Please try again.")
    }
  }
  

  const handleEmailExtraction = async () => {
    if (!email.trim() || !orderId.trim() || !termsheetName.trim()) {
      alert("Please provide email, order ID, and termsheet name to extract termsheet.")
      return
    }
    setIsExtracting(true)
    setTimeout(() => {
      setIsExtracting(false)
      setExtractionSuccess(true)
      setTimeout(() => {
        setExtractionSuccess(false)
        setEmail("")
        setOrderId("")
      }, 3000)
      
      console.log("Extracting termsheet from email:", { email, orderId, termsheetName, termsheetDate })
    }, 1500)
  }

  const handleDirectTermsheetSubmit = async () => {
    if (!directTermsheetContent.trim() || !termsheetName.trim()) {
      alert("Please provide both termsheet name and content.")
      return
    }

    console.log("Submitting direct termsheet:", { 
      name: termsheetName,
      date: termsheetDate,
      content: directTermsheetContent 
    })
    alert("Termsheet content submitted successfully!")
    setDirectTermsheetContent("")
  }

  const renderUploadTabContent = () => (
    <TabsContent value="upload" className=" space-y-6">
      <FileUploadArea 
        file={file} 
        setFile={setFile} 
        isDragging={isDragging} 
        setIsDragging={setIsDragging} 
        //@ts-ignore
        fileInputRef={fileInputRef}
        setTermsheetName={setTermsheetName}
      />

      <Alert className="border-slate-200 bg-slate-50 p-4">
        <Info className="h-4 w-4 text-slate-600" />
        <AlertDescription className="text-slate-600 text-sm">
          Files will be processed and indexed for searching. Supported formats include PDF and DOCX.
        </AlertDescription>
      </Alert>

      <Button
        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 text-base font-medium"
        size="lg"
        onClick={handleUploadSubmit}
        disabled={!file || !termsheetName.trim()}
      >
        Upload Termsheet
      </Button>
    </TabsContent>
  )

  const renderEmailTabContent = () => (
    <TabsContent value="email" className=" space-y-6">
      {extractionSuccess && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Termsheet "{termsheetName}" successfully extracted from email and saved
          </AlertDescription>
        </Alert>
      )}
      
      <EmailInfoForm 
        email={email} 
        setEmail={setEmail} 
        orderId={orderId} 
        setOrderId={setOrderId} 
      />

      <Alert className="border-slate-200 bg-slate-50 p-4">
        <Info className="h-4 w-4 text-slate-600" />
        <AlertDescription className="text-slate-600 text-sm">
          Our system will automatically extract the termsheet from the specified email address.
          The extraction process analyzes email content using AI to identify and retrieve termsheet data.
        </AlertDescription>
      </Alert>

      <Button 
        onClick={handleEmailExtraction} 
        disabled={!email.trim() || !orderId.trim() || !termsheetName.trim() || isExtracting}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 text-base font-medium"
        size="lg"
      >
        {isExtracting ? (
          <span className="animate-pulse">Extracting Termsheet...</span>
        ) : (
          <>
            <Download className="h-5 w-5 mr-2" />
            Extract Termsheet from Email
          </>
        )}
      </Button>
    </TabsContent>
  )

  const renderDirectInputTabContent = () => (
    <TabsContent value="direct" className="mt-0 space-y-6">
      <div className="flex-1 flex flex-col">
        <label htmlFor="direct-termsheet-content" className="block text-sm font-medium text-slate-700 mb-2">
          Termsheet Content *
        </label>
        <Textarea
          id="direct-termsheet-content"
          placeholder="Enter or paste termsheet content directly here..."
          value={directTermsheetContent}
          onChange={(e) => setDirectTermsheetContent(e.target.value)}
          className="flex-1 min-h-[300px] resize-none border-slate-300 focus:border-slate-500 focus:ring-slate-500"
        />
      </div>

      <Alert className="border-blue-100 bg-blue-50 p-4">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          You can paste formatted text from Word or other sources. Basic formatting will be preserved.
        </AlertDescription>
      </Alert>

      <Button 
        onClick={handleDirectTermsheetSubmit} 
        disabled={!directTermsheetContent.trim() || !termsheetName.trim()}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 text-base font-medium"
        size="lg"
      >
        <Send className="h-5 w-5 mr-2" />
        Submit Termsheet
      </Button>
    </TabsContent>
  )

  return (
    <div className="h-screen flex-1 flex-col overflow-scroll bg-slate-50 ">
      <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-lg rounded-xl m-4">
        <div className="p-8 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
          <h2 className="text-2xl font-semibold tracking-tight flex items-center">
            <FileText className="h-6 w-6 mr-3" />
            Termsheet Management
          </h2>
          <p className="text-slate-300 mt-2">Upload, extract from emails, or input termsheets directly</p>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex h-full">
            {/* Main content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Tabs 
                defaultValue="upload" 
                className="flex-1 flex flex-col"
                onValueChange={setActiveTab}
                value={activeTab}
              >
                <div className="px-8 pt-6">
                  <TabsList className="grid grid-cols-3 w-full bg-slate-100">
                    <TabsTrigger value="upload" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900">
                      <Upload className="h-4 w-4" />
                      <span>Upload Termsheet</span>
                    </TabsTrigger>
                    <TabsTrigger value="email" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900">
                      <Mail className="h-4 w-4" />
                      <span>Extract from Email</span>
                    </TabsTrigger>
                    <TabsTrigger value="direct" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900">
                      <MessageSquare className="h-4 w-4" />
                      <span>Direct Input</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-8 overflow-auto flex-1">
                  {/* Common termsheet name field */}
                  <TermsheetDetailsCard 
                    termsheetName={termsheetName}
                    setTermsheetName={setTermsheetName}
                    termsheetDate={termsheetDate}
                    setTermsheetDate={setTermsheetDate}
                  />

                  {renderUploadTabContent()}
                  {renderEmailTabContent()}
                  {renderDirectInputTabContent()}
                </div>
              </Tabs>
            </div>

            {/* Team members sidebar */}
            <TeamMemberSidebar members={members} setmembers={setMembers}/>
          </div>
        </div>
      </Card>
    </div>
  )
}