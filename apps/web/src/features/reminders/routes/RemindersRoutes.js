import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate } from 'react-router-dom';
import { RemindersDashboard } from '../components/RemindersDashboard';
import { ReminderForm } from '../components/ReminderForm';
export function RemindersRoutes() {
    return (_jsxs(Routes, { children: [_jsx(Route, { index: true, element: _jsx(RemindersDashboard, {}) }), _jsx(Route, { path: "new", element: _jsx(ReminderForm, {}) }), _jsx(Route, { path: ":id/edit", element: _jsx(ReminderForm, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/reminders", replace: true }) })] }));
}
