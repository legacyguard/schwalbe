import React from 'react';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-amber-200/50 py-6 text-center text-sm text-white font-bold bg-amber-800/90 backdrop-blur-xl">
      <p className="text-white font-bold">{t('common:footer.copyright')}</p>
    </footer>
  );
}

export default Footer;
