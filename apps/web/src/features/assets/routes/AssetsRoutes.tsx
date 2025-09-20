import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AssetsDashboard } from '../components/AssetsDashboard';
import { AssetsList } from '../components/AssetsList';
import { AssetForm } from '../components/AssetForm';

export function AssetsRoutes() {
  return (
    <Routes>
      <Route index element={<AssetsDashboard />} />
      <Route path="list" element={<AssetsList />} />
      <Route path="new" element={<AssetForm />} />
      <Route path=":id/edit" element={<AssetForm />} />
      <Route path="*" element={<Navigate to="/assets" replace />} />
    </Routes>
  );
}

export default AssetsRoutes;
