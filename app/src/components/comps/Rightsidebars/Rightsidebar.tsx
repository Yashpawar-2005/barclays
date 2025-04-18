import type React from "react"

import { useState, useRef } from "react"
import { Button } from "../../ui/button"
import { Card } from "../../ui/card"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import { ScrollArea } from "../../ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import { Badge } from "../../ui/badge"
import { Separator } from "../../ui/separator"
import { 
  FileText, Upload, X, CheckCircle, Users, Mail, 
  MessageSquare, Send, AlertCircle, Download,
  Info, File, Calendar
} from "lucide-react"
import { Alert, AlertDescription } from "../../ui/alert"

// Types
type Member = {
  id: string
  name: string
  role: string
  avatar?: string
  status: "online" | "offline" | "away"
}

// Props interfaces for component typing
interface TermsheetDetailsCardProps {
  termsheetName: string
  setTermsheetName: (name: string) => void
  termsheetDate: string
  setTermsheetDate: (date: string) => void
}

interface FileUploadAreaProps {
  file: File | null
  setFile: (file: File | null) => void
  isDragging: boolean
  setIsDragging: (isDragging: boolean) => void
  fileInputRef: React.RefObject<HTMLInputElement>
  setTermsheetName: (name: string) => void
}

interface EmailInfoFormProps {
  email: string
  setEmail: (email: string) => void
  orderId: string
  setOrderId: (orderId: string) => void
}

interface TeamMemberSidebarProps {
  members: Member[]
}

interface MemberItemProps {
  member: Member
}

// Helper components
const TermsheetDetailsCard: React.FC<TermsheetDetailsCardProps> = ({ 
  termsheetName, 
  setTermsheetName, 
  termsheetDate, 
  setTermsheetDate 
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 mb-6">
    <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center">
      <File className="h-4 w-4 mr-2 text-slate-600" />
      Termsheet Details
    </h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="termsheet-name" className="block text-sm font-medium text-slate-700 mb-2">
          Termsheet Name *
        </label>
        <Input
          id="termsheet-name"
          placeholder="Enter termsheet name"
          value={termsheetName}
          onChange={(e) => setTermsheetName(e.target.value)}
          className="w-full border-slate-300 focus:border-slate-500 focus:ring-slate-500"
        />
      </div>
      <div>
        <label htmlFor="termsheet-date" className="block text-sm font-medium text-slate-700 mb-2">
          <Calendar className="h-3 w-3 inline-block mr-1 text-slate-500" />
          Date (Optional)
        </label>
        <Input
          id="termsheet-date"
          type="date"
          value={termsheetDate}
          onChange={(e) => setTermsheetDate(e.target.value)}
          className="w-full border-slate-300 focus:border-slate-500 focus:ring-slate-500"
        />
      </div>
    </div>
  </div>
)

const FileUploadArea: React.FC<FileUploadAreaProps> = ({ 
  file, 
  setFile, 
  isDragging, 
  setIsDragging, 
  fileInputRef, 
  setTermsheetName 
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])

      // If no termsheet name is provided, use the file name without extension
      const fileName = e.target.files[0].name
      const nameWithoutExtension = fileName.split(".").slice(0, -1).join(".")
      setTermsheetName(nameWithoutExtension)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])

      // If no termsheet name is provided, use the file name without extension
      const fileName = e.dataTransfer.files[0].name
      const nameWithoutExtension = fileName.split(".").slice(0, -1).join(".")
      setTermsheetName(nameWithoutExtension)
    }
  }

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFile(null)
  }

  return (
    <div className="flex-1 flex flex-col">
      <label className="block text-sm font-medium text-slate-700 mb-2">Upload Termsheet Document</label>
      <div
        className={`border-2 border-dashed rounded-lg flex-1 flex flex-col items-center justify-center p-12 transition-colors ${
          isDragging ? "border-slate-500 bg-slate-50" : "border-slate-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.docx,.doc"
        />

        {!file ? (
          <>
            <div className="bg-slate-100 p-6 rounded-full mb-6">
              <Upload className="h-10 w-10 text-slate-500" />
            </div>
            <p className="text-lg text-center text-slate-800 mb-2 font-medium">
              Drag and drop your termsheet here
            </p>
            <p className="text-sm text-center text-slate-500 mb-6">or click to browse your files</p>
            <Badge variant="outline" className="text-xs py-1 px-3 border-slate-300">
              Supports PDF, DOCX
            </Badge>
          </>
        ) : (
          <div className="w-full flex flex-col items-center">
            <div className="bg-slate-100 p-5 rounded-full mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div className="flex items-center justify-between w-full max-w-lg bg-slate-50 p-5 rounded-lg border border-slate-200">
              <div className="flex items-center space-x-4">
                <FileText className="h-10 w-10 text-slate-700" />
                <div>
                  <p className="text-base font-medium text-slate-900">{file.name}</p>
                  <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                className="hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const EmailInfoForm: React.FC<EmailInfoFormProps> = ({ email, setEmail, orderId, setOrderId }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
    <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center">
      <Mail className="h-4 w-4 mr-2 text-slate-600" />
      Email Information
    </h3>
    <div className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
          Email Address *
        </label>
        <Input
          id="email"
          type="email"
          placeholder="Enter email address containing termsheet"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border-slate-300 focus:border-slate-500 focus:ring-slate-500"
        />
      </div>

      <div>
        <label htmlFor="order-id" className="block text-sm font-medium text-slate-700 mb-2">
          Order ID *
        </label>
        <Input
          id="order-id"
          placeholder="Enter order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="w-full border-slate-300 focus:border-slate-500 focus:ring-slate-500"
        />
      </div>
    </div>
  </div>
)

const TeamMemberSidebar: React.FC<TeamMemberSidebarProps> = ({ members }) => {
  const getStatusColor = (status: Member["status"]) => {
    switch (status) {
      case "online": return "bg-green-500"
      case "away": return "bg-yellow-500"
      case "offline": return "bg-gray-400"
    }
  }

  const MemberItem: React.FC<MemberItemProps> = ({ member }) => (
    <div className={`flex items-center p-3 rounded-md hover:bg-slate-100 transition-colors ${member.status === "offline" ? "opacity-60" : ""}`}>
      <div className="relative">
        <Avatar className="h-10 w-10 border border-slate-200">
          <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
          <AvatarFallback className="bg-slate-200 text-slate-600">{member.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white ${getStatusColor(member.status)}`}
        />
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-slate-800">{member.name}</p>
        <p className="text-xs text-slate-500">{member.role}</p>
      </div>
    </div>
  )

  const onlineMembers = members.filter(m => m.status === "online" || m.status === "away")
  const offlineMembers = members.filter(m => m.status === "offline")

  return (
    <div className="w-80 border-l border-slate-200 bg-white flex flex-col shadow-inner">
      <div className="p-5 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center">
            <Users className="h-4 w-4 mr-2 text-slate-500" />
            Team Members
          </h3>
          <Badge variant="outline" className="text-xs border-slate-300">
            {members.length}
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="mb-4">
            <h4 className="text-xs uppercase text-slate-500 font-semibold mb-2 tracking-wider">Active Now</h4>
            <Separator className="bg-slate-100" />
          </div>
          <div className="space-y-2">
            {onlineMembers.map((member) => (
              <MemberItem key={member.id} member={member} />
            ))}
          </div>

          <div className="mt-6 mb-4">
            <h4 className="text-xs uppercase text-slate-500 font-semibold mb-2 tracking-wider">Offline</h4>
            <Separator className="bg-slate-100" />
          </div>
          <div className="space-y-2">
            {offlineMembers.map((member) => (
              <MemberItem key={member.id} member={member} />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

// Main component
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

  // Sample members data - in a real app, this would come from your backend
  const members: Member[] = [
    {
      id: "1",
      name: "Alex Johnson",
      role: "Deal Lead",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "online",
    },
    { id: "2", name: "Sarah Williams", role: "Legal", avatar: "/placeholder.svg?height=40&width=40", status: "online" },
    { id: "3", name: "Michael Chen", role: "Finance", avatar: "/placeholder.svg?height=40&width=40", status: "away" },
    {
      id: "4",
      name: "Emma Davis",
      role: "Compliance",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "offline",
    },
  ]

  const handleUploadSubmit = async () => {
    if (!file || !termsheetName.trim()) {
      alert("Please provide both a termsheet name and upload a file.")
      return
    }

    // Here you would implement the logic to send the termsheet to the backend
    const formData = new FormData()
    formData.append("termsheetName", termsheetName)
    formData.append("termsheetDate", termsheetDate)
    formData.append("file", file)

    console.log("Submitting termsheet:", { name: termsheetName, date: termsheetDate, file })
    alert("Termsheet uploaded successfully!")
  }

  const handleEmailExtraction = async () => {
    if (!email.trim() || !orderId.trim() || !termsheetName.trim()) {
      alert("Please provide email, order ID, and termsheet name to extract termsheet.")
      return
    }

    // Simulate API call to backend for extraction
    setIsExtracting(true)
    
    // Simulate API delay
    setTimeout(() => {
      setIsExtracting(false)
      setExtractionSuccess(true)
      
      // Reset after showing success for 3 seconds
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

    // Here you would implement the logic to send the termsheet content to the backend
    console.log("Submitting direct termsheet:", { 
      name: termsheetName,
      date: termsheetDate,
      content: directTermsheetContent 
    })
    alert("Termsheet content submitted successfully!")
    
    // Reset fields after submission
    setDirectTermsheetContent("")
  }

  // Render tab content components
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
            <TeamMemberSidebar members={members} />
          </div>
        </div>
      </Card>
    </div>
  )
}