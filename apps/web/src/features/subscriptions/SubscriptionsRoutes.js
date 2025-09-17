import { jsx as _jsx } from "react/jsx-runtime";
import { Routes, Route } from 'react-router-dom';
import { SubscriptionsDashboard } from './SubscriptionsDashboard';
export function SubscriptionsRoutes() {
    return (_jsx(Routes, { children: _jsx(Route, { path: "/", element: _jsx(SubscriptionsDashboard, {}) }) }));
}
