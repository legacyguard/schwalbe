import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnon = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';
export const AuthPanel = () => {
    const supabase = useMemo(() => createClient(supabaseUrl, supabaseAnon), []);
    const handleSignIn = async () => {
        await supabase.auth.signInWithOAuth({ provider: 'google' });
    };
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };
    return (_jsxs("div", { style: { padding: 12, border: '1px solid #eee', borderRadius: 8, background: '#fff' }, children: [_jsx("h3", { children: "Authentication" }), _jsx("p", { style: { fontSize: 12, color: '#555' }, children: "Connect your account to enable Family Shield." }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { onClick: handleSignIn, children: "Sign in with Google" }), _jsx("button", { onClick: handleSignOut, children: "Sign out" })] })] }));
};
export default AuthPanel;
