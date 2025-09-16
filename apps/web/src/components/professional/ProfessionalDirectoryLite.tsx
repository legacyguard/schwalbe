import React, { useMemo, useState } from 'react';
import type { ProfessionalReviewer } from '@/types/professional';
import { motion, useReducedMotion } from 'framer-motion';

// Minimal sample data (no external deps)
const SAMPLE_PROFESSIONALS: ProfessionalReviewer[] = [
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
  const [list] = useState<ProfessionalReviewer[]>(SAMPLE_PROFESSIONALS);
  const prefersReducedMotion = useReducedMotion();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(p =>
      (p.full_name || '').toLowerCase().includes(q) ||
      (p.professional_title || '').toLowerCase().includes(q) ||
      (p.law_firm_name || '').toLowerCase().includes(q) ||
      (p.specializations || []).some(s => (s.name || '').toLowerCase().includes(q))
    );
  }, [list, query]);


  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, title, firm, specialization"
          style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
        />
      </div>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {filtered.map((p, idx) => (
          <motion.div
            key={p.id}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: prefersReducedMotion ? 0 : idx * 0.04, ease: 'easeOut' }}
            whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.01 }}
            style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#fff' }}
          >
            <div style={{ fontWeight: 600, fontSize: 16 }}>{p.full_name}</div>
            <div style={{ color: '#6b7280', fontSize: 14 }}>{p.professional_title}</div>
            {p.law_firm_name && (
              <div style={{ color: '#6b7280', fontSize: 12 }}>{p.law_firm_name}</div>
            )}
            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(p.specializations || []).slice(0, 4).map((s, i) => (
                <span key={i} style={{ fontSize: 12, background: '#f1f5f9', padding: '2px 6px', borderRadius: 9999 }}>{s.name}</span>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#374151' }}>
              <span>Rating: {p.rating ?? '—'}</span>{' '}
              <span style={{ marginLeft: 8 }}>Experience: {p.experience_years ?? '—'}y</span>{' '}
              <span style={{ marginLeft: 8 }}>Rate: {p.hourly_rate ? `$${p.hourly_rate}/h` : '—'}</span>
            </div>
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div style={{ marginTop: 16, color: '#6b7280' }}>No professionals match your filters.</div>
      )}
    </div>
  );
}

