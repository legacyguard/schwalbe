import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate } from 'react-router-dom';
import TermsEN from '@/pages/legal/terms.en';
import TermsCS from '@/pages/legal/terms.cs';
import TermsSK from '@/pages/legal/terms.sk';
import PrivacyEN from '@/pages/legal/privacy.en';
import PrivacyCS from '@/pages/legal/privacy.cs';
import PrivacySK from '@/pages/legal/privacy.sk';
import CookiesEN from '@/pages/legal/cookies.en';
import CookiesCS from '@/pages/legal/cookies.cs';
import CookiesSK from '@/pages/legal/cookies.sk';
import ImprintEN from '@/pages/legal/imprint.en';
import ImprintCS from '@/pages/legal/imprint.cs';
import ImprintSK from '@/pages/legal/imprint.sk';
export function LegalRoutes() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "terms.en", element: _jsx(TermsEN, {}) }), _jsx(Route, { path: "terms.cs", element: _jsx(TermsCS, {}) }), _jsx(Route, { path: "terms.sk", element: _jsx(TermsSK, {}) }), _jsx(Route, { path: "privacy.en", element: _jsx(PrivacyEN, {}) }), _jsx(Route, { path: "privacy.cs", element: _jsx(PrivacyCS, {}) }), _jsx(Route, { path: "privacy.sk", element: _jsx(PrivacySK, {}) }), _jsx(Route, { path: "cookies.en", element: _jsx(CookiesEN, {}) }), _jsx(Route, { path: "cookies.cs", element: _jsx(CookiesCS, {}) }), _jsx(Route, { path: "cookies.sk", element: _jsx(CookiesSK, {}) }), _jsx(Route, { path: "imprint.en", element: _jsx(ImprintEN, {}) }), _jsx(Route, { path: "imprint.cs", element: _jsx(ImprintCS, {}) }), _jsx(Route, { path: "imprint.sk", element: _jsx(ImprintSK, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "terms.en", replace: true }) })] }));
}
