import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Billing } from './Billing'

export function AccountRoutes() {
  return (
    <Routes>
      <Route path="/billing" element={<Billing />} />
    </Routes>
  )
}