import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
// Minimal sample data (no external deps)
const SAMPLE_PROFESSIONALS = [
    {
        id: 'p1',
        full_name: 'Sarah Johnson',
        professional_title: 'Senior Attorney',
        law_firm_name: 'Johnson & Associates',
        licensed_states: ['California', 'Nevada'],
        jurisdiction: 'California',
        specializations: [
            { name: 'Estate Planning', category: 'estate_planning' },
            { name: 'Tax Law', category: 'tax_law' },
        ],
        experience_years: 15,
        profile_verified: true,
        rating: 4.9,
        reviews_completed: 127,
        hourly_rate: 300,
    },
    {
        id: 'p2',
        full_name: 'Michael Chen',
        professional_title: 'Senior Partner',
        law_firm_name: 'LegalEagle Partners',
        licensed_states: ['New York'],
        jurisdiction: 'New York',
        specializations: [
            { name: 'Business Law', category: 'business_law' },
            { name: 'Real Estate Law', category: 'real_estate' },
        ],
        experience_years: 22,
        profile_verified: true,
        rating: 4.8,
        reviews_completed: 89,
        hourly_rate: 400,
    },
];
export function ProfessionalDirectoryLite() {
    const [query, setQuery] = useState('');
    const [list, setList] = useState(SAMPLE_PROFESSIONALS);
    const prefersReducedMotion = useReducedMotion();
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q)
            return list;
        return list.filter(p => (p.full_name || '').toLowerCase().includes(q) ||
            (p.professional_title || '').toLowerCase().includes(q) ||
            (p.law_firm_name || '').toLowerCase().includes(q) ||
            (p.specializations || []).some(s => (s.name || '').toLowerCase().includes(q)));
    }, [list, query]);
    return (_jsxs("div", { style: { padding: 16 }, children: [_jsx("div", { style: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }, children: _jsx("input", { value: query, onChange: e => setQuery(e.target.value), placeholder: "Search by name, title, firm, specialization", style: { flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 6 } }) }), _jsx("div", { style: { display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }, children: filtered.map((p, idx) => (_jsxs(motion.div, { initial: prefersReducedMotion ? false : { opacity: 0, y: 6 }, animate: prefersReducedMotion ? undefined : { opacity: 1, y: 0 }, transition: { duration: 0.24, delay: prefersReducedMotion ? 0 : idx * 0.04, ease: 'easeOut' }, whileHover: prefersReducedMotion ? undefined : { y: -2, scale: 1.01 }, style: { border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#fff' }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: 16 }, children: p.full_name }), _jsx("div", { style: { color: '#6b7280', fontSize: 14 }, children: p.professional_title }), p.law_firm_name && (_jsx("div", { style: { color: '#6b7280', fontSize: 12 }, children: p.law_firm_name })), _jsx("div", { style: { marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }, children: (p.specializations || []).slice(0, 4).map((s, i) => (_jsx("span", { style: { fontSize: 12, background: '#f1f5f9', padding: '2px 6px', borderRadius: 9999 }, children: s.name }, i))) }), _jsxs("div", { style: { marginTop: 8, fontSize: 12, color: '#374151' }, children: [_jsxs("span", { children: ["Rating: ", p.rating ?? '—'] }), ' ', _jsxs("span", { style: { marginLeft: 8 }, children: ["Experience: ", p.experience_years ?? '—', "y"] }), ' ', _jsxs("span", { style: { marginLeft: 8 }, children: ["Rate: ", p.hourly_rate ? `$${p.hourly_rate}/h` : '—'] })] })] }, p.id))) }), filtered.length === 0 && (_jsx("div", { style: { marginTop: 16, color: '#6b7280' }, children: "No professionals match your filters." }))] }));
}
