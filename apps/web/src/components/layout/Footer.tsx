import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-amber-200/50 py-6 text-center text-sm text-white font-bold bg-amber-800/90 backdrop-blur-xl">
      <p className="text-white font-bold">{new Date().getFullYear()} LegacyGuard. Securely guide your family forward.</p>
    </footer>
  );
}

export default Footer;
