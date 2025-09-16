import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Billing } from './Billing'
import { BillingDetails } from './BillingDetails'
import { DeleteAccount } from './DeleteAccount'
import { ExportData } from './ExportData'

export function AccountRoutes() {
  return (
    <Routes>
      <Route path="/billing" element={<Billing />} />
      <Route path="/billing/details" element={<BillingDetails />} />
      <Route path="/delete" element={<DeleteAccount />} />
      <Route path="/export" element={<ExportData />} />
    </Routes>
  )
}
