import { jsx as _jsx } from "react/jsx-runtime";
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
// Stub for future user/account menu
export function UserIcon() {
    return (_jsx(Button, { "aria-label": "User", className: "text-slate-200 hover:text-white hover:bg-slate-800/50 px-2 py-1 rounded", title: "User (coming soon)", children: _jsx(User, { className: "w-4 h-4" }) }));
}
