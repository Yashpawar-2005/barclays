// src/components/comps/admin/EmailInfoForm.tsx

import React from 'react'
import { Input } from '../../../ui/input'
import { Lock, FileText } from 'lucide-react'

type EmailInfoFormProps = {
  email: string
  setEmail: (val: string) => void
  password: string
  setPassword: (val: string) => void
  orderId: string
  setOrderId: (val: string) => void
  termsheetName: string
  setTermsheetName: (val: string) => void
  error?: string | null
}

export const EmailInfoForm: React.FC<EmailInfoFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  orderId,
  setOrderId,
  termsheetName,
  setTermsheetName,
  error,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
      <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center">
        <Lock className="h-4 w-4 mr-2 text-slate-600" />
        Email Extraction Details
      </h3>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email Address *
          </label>
          <Input
            id="email"
            type="email"
            placeholder="your-email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Email Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="password"
              type="password"
              placeholder="Enter email password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="order-id" className="block text-sm font-medium mb-1">
            Order ID *
          </label>
          <Input
            id="order-id"
            placeholder="Your order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="termsheet-name"
            className="block text-sm font-medium mb-1"
          >
            Termsheet Name *
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="termsheet-name"
              placeholder="e.g. May 2025 Invoice"
              value={termsheetName}
              onChange={(e) => setTermsheetName(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
