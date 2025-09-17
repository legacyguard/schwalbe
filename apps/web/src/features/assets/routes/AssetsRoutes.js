import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate } from 'react-router-dom';
import { AssetsDashboard } from '../components/AssetsDashboard';
import { AssetsList } from '../components/AssetsList';
import { AssetForm } from '../components/AssetForm';
export function AssetsRoutes() {
    return (_jsxs(Routes, { children: [_jsx(Route, { index: true, element: _jsx(AssetsDashboard, {}) }), _jsx(Route, { path: "list", element: _jsx(AssetsList, {}) }), _jsx(Route, { path: "new", element: _jsx(AssetForm, {}) }), _jsx(Route, { path: ":id/edit", element: _jsx(AssetForm, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/assets", replace: true }) })] }));
}
