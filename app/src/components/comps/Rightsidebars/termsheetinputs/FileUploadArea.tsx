import { CheckCircle,Upload } from "lucide-react"
import { Badge } from "../../../ui/badge"
import { FileText } from "lucide-react"
import { Button } from "../../../ui/button"
import { X } from "lucide-react"

interface FileUploadAreaProps {
    file: File | null
    setFile: (file: File | null) => void
    isDragging: boolean
    setIsDragging: (isDragging: boolean) => void
    fileInputRef: React.RefObject<HTMLInputElement>
    setTermsheetName: (name: string) => void
  }
  
  
export const FileUploadArea: React.FC<FileUploadAreaProps> = ({ 
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
  