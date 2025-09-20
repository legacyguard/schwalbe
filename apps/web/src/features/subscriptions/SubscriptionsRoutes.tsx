import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { SubscriptionsDashboard } from './SubscriptionsDashboard'

export function SubscriptionsRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SubscriptionsDashboard />} />
    </Routes>
  )
}

export default SubscriptionsRoutes;