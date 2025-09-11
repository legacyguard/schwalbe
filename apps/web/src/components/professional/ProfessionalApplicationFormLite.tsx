import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function ProfessionalApplicationFormLite() {
  const prefersReducedMotion = useReducedMotion();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    professional_title: '',
    bar_number: '',
    licensed_states: '' as string,
    specializations: '' as string,
    experience_years: 0,
  });
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      // Simulate a successful submit without any API glue
      await new Promise(resolve => setTimeout(resolve, 200));
      setStatus('Submitted (simulated)');
    } catch {
      setStatus('Submission simulated');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 640 }}>
      <div style={{ fontWeight: 600 }}>Professional Application (Lite)</div>
      <input
        required
        placeholder="Full name"
        value={form.full_name}
        onChange={e => setForm({ ...form, full_name: e.target.value })}
        style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
      />
      <input
        required
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
      />
      <input
        required
        placeholder="Professional title"
        value={form.professional_title}
        onChange={e => setForm({ ...form, professional_title: e.target.value })}
        style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
      />
      <input
        required
        placeholder="Bar number"
        value={form.bar_number}
        onChange={e => setForm({ ...form, bar_number: e.target.value })}
        style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
      />
      <input
        placeholder="Licensed states (comma separated)"
        value={form.licensed_states}
        onChange={e => setForm({ ...form, licensed_states: e.target.value })}
        style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
      />
      <input
        placeholder="Specializations (comma separated)"
        value={form.specializations}
        onChange={e => setForm({ ...form, specializations: e.target.value })}
        style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
      />
      <input
        type="number"
        min={0}
        placeholder="Experience years"
        value={form.experience_years}
        onChange={e => setForm({ ...form, experience_years: Number(e.target.value) || 0 })}
        style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
      />
      <motion.button
        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
        disabled={loading}
        type="submit"
        style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', background: '#16a34a', color: '#fff' }}
      >
        {loading ? 'Submitting…' : 'Submit Application'}
      </motion.button>
      {status && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{ color: '#065f46', background: '#ecfdf5', padding: 8, borderRadius: 6 }}
        >
          {status}
        </motion.div>
      )}
    </form>
  );
}

