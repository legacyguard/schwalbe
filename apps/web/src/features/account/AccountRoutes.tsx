import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Billing } from './Billing'
import { BillingDetails } from './BillingDetails'

export function AccountRoutes() {
  return (
    <Routes>
      <Route path="/billing" element={<Billing />} />
      <Route path="/billing/details" element={<BillingDetails />} />
    </Routes>
  )
}
