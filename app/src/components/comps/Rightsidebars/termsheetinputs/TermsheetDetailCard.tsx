import { File } from "lucide-react"
import { Input } from "../../../ui/input"
import { Calendar } from "lucide-react"
interface TermsheetDetailsCardProps {
    termsheetName: string
    setTermsheetName: (name: string) => void
    termsheetDate: string
    setTermsheetDate: (date: string) => void
  }
export const TermsheetDetailsCard: React.FC<TermsheetDetailsCardProps> = ({ 
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