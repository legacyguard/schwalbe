import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { DocumentList } from '../components/DocumentList'
import { DocumentUpload } from '../components/DocumentUpload'
import { DocumentDetail } from '../components/DocumentDetail'

export function DocumentRoutes() {
  return (
    <Routes>
      <Route index element={<DocumentList />} />
      <Route path="new" element={<DocumentUpload />} />
      <Route path=":id" element={<DocumentDetail />} />
      <Route path="*" element={<Navigate to="/documents" replace />} />
    </Routes>
  )
}