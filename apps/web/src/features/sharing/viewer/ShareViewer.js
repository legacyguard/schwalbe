import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sharingService } from '@schwalbe/shared';
import { MetaTags } from '@/components/common/MetaTags';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
export function ShareViewer() {
    const { shareId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState(null);
    const [expiresAt, setExpiresAt] = useState(null);
    // Password state not needed for rendering; handled via status
    const [password, setPassword] = useState('');
    const [resource, setResource] = useState(null);
    useEffect(() => {
        let mounted = true;
        async function run() {
            if (!shareId)
                return;
            try {
                const res = await sharingService.verifyShareAccess(shareId);
                if (!mounted)
                    return;
                setExpiresAt(res.expiresAt ?? null);
                if (res.status === 'ok') {
                    setStatus('ok');
                    setResource({ type: res.resourceType, id: res.resourceId, permissions: res.permissions });
                }
                else if (res.status === 'password_required') {
                    setStatus('password_required');
                }
                else if (res.status === 'password_incorrect') {
                    setStatus('password_incorrect');
                    setError(t('sharing/viewer.incorrectPassword'));
                }
                else if (res.status === 'expired') {
                    setStatus('expired');
                    setError(t('sharing/viewer.expiredMessage'));
                }
                else {
                    setStatus('invalid');
                    setError(t('sharing/viewer.invalidMessage'));
                }
            }
            catch {
                setStatus('invalid');
                setError(t('sharing/viewer.unableToVerify'));
            }
        }
        run();
        return () => { mounted = false; };
    }, [shareId]);
    const title = useMemo(() => {
        if (status === 'ok')
            return t('sharing/viewer.sharedViewer');
        if (status === 'password_required' || status === 'password_incorrect')
            return t('sharing/viewer.enterPassword');
        if (status === 'expired')
            return t('sharing/viewer.linkExpired');
        return t('sharing/viewer.invalidLink');
    }, [status, t]);
    async function onSubmitPassword(e) {
        e.preventDefault();
        if (!shareId)
            return;
        try {
            const res = await sharingService.verifyShareAccess(shareId, password);
            setExpiresAt(res.expiresAt ?? null);
            if (res.status === 'ok') {
                setStatus('ok');
                setResource({ type: res.resourceType, id: res.resourceId, permissions: res.permissions });
                setError(null);
            }
            else if (res.status === 'password_incorrect') {
                setStatus('password_incorrect');
                setError(t('sharing/viewer.incorrectPassword'));
            }
            else if (res.status === 'expired') {
                setStatus('expired');
                setError(t('sharing/viewer.expiredMessage'));
            }
            else {
                setStatus('invalid');
                setError(t('sharing/viewer.invalidMessage'));
            }
        }
        catch {
            setStatus('invalid');
            setError(t('sharing/viewer.unableToVerify'));
        }
    }
    function onPrint() {
        window.print();
    }
    return (_jsxs("div", { className: "min-h-[60vh] text-white p-6", children: [_jsx(MetaTags, { title: title, description: t('sharing/viewer.metaDescription') }), _jsx(Helmet, { children: _jsx("meta", { name: "robots", content: "noindex, nofollow" }) }), status === 'loading' && (_jsx("div", { className: "max-w-xl mx-auto text-center opacity-80", children: t('sharing/viewer.loading') })), (status === 'password_required' || status === 'password_incorrect') && (_jsxs("div", { className: "max-w-md mx-auto bg-slate-800 p-6 rounded-lg shadow", children: [_jsx("h1", { className: "text-xl font-semibold mb-4", children: t('sharing/viewer.protectedTitle') }), _jsx("p", { className: "mb-4 text-slate-300", children: t('sharing/viewer.protectedPrompt') }), error && _jsx("div", { className: "mb-4 text-red-400", children: error }), _jsxs("form", { onSubmit: onSubmitPassword, className: "space-y-4", children: [_jsxs("label", { className: "block", children: [_jsx("span", { className: "block mb-1", children: t('sharing/viewer.passwordLabel') }), _jsx("input", { type: "password", className: "w-full bg-slate-700 border border-slate-600 rounded px-3 py-2", value: password, onChange: (e) => setPassword(e.target.value), required: true, "aria-label": "Password" })] }), _jsx("button", { type: "submit", className: "bg-sky-600 hover:bg-sky-700 px-4 py-2 rounded", "aria-label": t('sharing/viewer.unlockAria'), children: t('sharing/viewer.unlock') })] })] })), status === 'expired' && (_jsxs("div", { className: "max-w-md mx-auto bg-slate-800 p-6 rounded-lg shadow text-center", children: [_jsx("h1", { className: "text-xl font-semibold mb-2", children: t('sharing/viewer.linkExpired') }), _jsx("p", { className: "text-slate-300", children: t('sharing/viewer.expiredMessage') })] })), status === 'invalid' && (_jsxs("div", { className: "max-w-md mx-auto bg-slate-800 p-6 rounded-lg shadow text-center", children: [_jsx("h1", { className: "text-xl font-semibold mb-2", children: t('sharing/viewer.invalidLink') }), _jsx("p", { className: "text-slate-300", children: t('sharing/viewer.invalidMessage') })] })), status === 'ok' && resource && (_jsxs("div", { className: "max-w-3xl mx-auto bg-slate-800 p-6 rounded-lg shadow", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h1", { className: "text-xl font-semibold", children: t('sharing/viewer.sharedViewer') }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded", onClick: () => navigate('/assets'), children: t('sharing/viewer.back') }), _jsx("button", { className: "bg-sky-600 hover:bg-sky-700 px-3 py-2 rounded", onClick: onPrint, children: t('sharing/viewer.exportPdf') })] })] }), _jsxs("div", { className: "text-slate-300 mb-4", children: [_jsxs("div", { children: [_jsxs("span", { className: "text-slate-400", children: [t('sharing/viewer.type'), ":"] }), " ", resource.type] }), _jsxs("div", { children: [_jsxs("span", { className: "text-slate-400", children: [t('sharing/viewer.resourceId'), ":"] }), " ", resource.id] }), expiresAt && (_jsxs("div", { children: [_jsxs("span", { className: "text-slate-400", children: [t('sharing/viewer.expires'), ":"] }), " ", new Date(expiresAt).toLocaleString()] }))] }), _jsxs("div", { className: "bg-slate-900/50 border border-slate-700 rounded p-4", children: [_jsx("p", { children: t('sharing/viewer.contentPlaceholder') }), _jsx("pre", { className: "mt-2 text-xs whitespace-pre-wrap", children: JSON.stringify(resource.permissions, null, 2) })] })] }))] }));
}
