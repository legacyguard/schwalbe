import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate } from 'react-router-dom';
import { DocumentList } from '../components/DocumentList';
import { DocumentUpload } from '../components/DocumentUpload';
import { DocumentDetail } from '../components/DocumentDetail';
export function DocumentRoutes() {
    return (_jsxs(Routes, { children: [_jsx(Route, { index: true, element: _jsx(DocumentList, {}) }), _jsx(Route, { path: "new", element: _jsx(DocumentUpload, {}) }), _jsx(Route, { path: ":id", element: _jsx(DocumentDetail, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/documents", replace: true }) })] }));
}
