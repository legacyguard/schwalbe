import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 py-6 text-center text-sm text-slate-400">
      <p>© {new Date().getFullYear()} LegacyGuard. Securely guide your family forward.</p>
    </footer>
  );
}

export default Footer;
