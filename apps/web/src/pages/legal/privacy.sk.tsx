import React from 'react'
import { LegalLayout } from './LegalLayout'

export default function PrivacySK() {
  return (
    <LegalLayout lang="sk" title="Zásady ochrany osobných údajov">
      <p>Vaše súkromie je dôležité. Zhromažďujeme iba nevyhnutné údaje na poskytovanie služby. Osobné údaje nepredávame.</p>
      <h2>Aké údaje zbierame</h2>
      <p>Identifikátory účtu, dokumenty, ktoré nahráte, nastavenia a prevádzkové logy (bez osobných údajov v logoch).</p>
      <h2>Ako údaje používame</h2>
      <p>Na poskytovanie, údržbu a zlepšovanie služby, vrátane bezpečnosti a právnej zhody.</p>
      <h2>Uloženie a zabezpečenie</h2>
      <p>Používame priemyselné štandardy zabezpečenia a šifrovania. Prístupy sú chránené prísnymi zásadami.</p>
      <h2>Vaše práva</h2>
      <p>Môžete pristupovať k svojim údajom, aktualizovať ich, exportovať alebo vymazať, kde je to možné.</p>
      <h2>Kontakt</h2>
      <p>Pre otázky týkajúce sa súkromia kontaktujte support@legacyguard.app.</p>
      <h2>Informácie o fakturácii</h2>
      <p>Informácie o zrušení predplatného, odklade (grace period), skúšobných verziách a refundáciách nájdete v Podmienkach používania (sekcia Zrušenie predplatného a vrátenie platieb). Platobné údaje neukladáme do logov a používame predvolené pravidlá Stripe pre pomerné sumy.</p>
    </LegalLayout>
  )
}
