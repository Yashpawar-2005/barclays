// src/components/comps/admin/EmailInfoForm.tsx

import { useState } from 'react'
import { Input } from '../../../ui/input'
import { Button } from '../../../ui/button'
import { Mail, Lock } from 'lucide-react'

interface EmailInfoFormProps {
  email: string
  setEmail: (email: string) => void
  orderId: string
  setOrderId: (orderId: string) => void
}

export const EmailInfoForm: React.FC<EmailInfoFormProps> = ({
  email,
  setEmail,
  orderId,
  setOrderId,
}) => {
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const handleExtract = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        'http://localhost:4000/api/v1/fetch-order-email',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            orderId,
            organisationId: '42',
          }),
        }
      )
      const data = await res.json()
      console.log('Fetched data:', data)
      // TODO: surface `data` in UI or pass to parent
    } catch (err) {
      console.error('Error extracting from email:', err)
    } finally {
      setLoading(false)
    }
  }

  const canExtract =
    !!email.trim() && !!password.trim() && !!orderId.trim() && !loading

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
      <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center">
        <Mail className="h-4 w-4 mr-2 text-slate-600" />
        Email Information
      </h3>
      <div className="space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
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

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="password"
              type="password"
              placeholder="Enter email password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 border-slate-300 focus:border-slate-500 focus:ring-slate-500"
            />
          </div>
        </div>

        {/* Order ID */}
        <div>
          <label
            htmlFor="order-id"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
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

        {/* Extract Button */}
        <div className="pt-4">
          <Button
            onClick={handleExtract}
            disabled={!canExtract}
            className="w-full bg-black text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Extracting...' : 'Extract from email'}
          </Button>
        </div>
      </div>
    </div>
  )
}
