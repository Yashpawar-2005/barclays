import { Input } from "../../../ui/input"
import { Mail } from "lucide-react"
interface EmailInfoFormProps {
    email: string
    setEmail: (email: string) => void
    orderId: string
    setOrderId: (orderId: string) => void
  }
export const EmailInfoForm: React.FC<EmailInfoFormProps> = ({ email, setEmail, orderId, setOrderId }) => (
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