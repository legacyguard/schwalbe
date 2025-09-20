import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { RemindersDashboard } from '../components/RemindersDashboard'
import { ReminderForm } from '../components/ReminderForm'

export function RemindersRoutes() {
  return (
    <Routes>
      <Route index element={<RemindersDashboard />} />
      <Route path="new" element={<ReminderForm />} />
      <Route path=":id/edit" element={<ReminderForm />} />
      <Route path="*" element={<Navigate to="/reminders" replace />} />
    </Routes>
  )
}

export default RemindersRoutes;
