import React from 'react'
import { LegalLayout } from './LegalLayout'

export default function CookiesCS() {
  return (
    <LegalLayout lang="cs" title="Zásady používání souborů cookie">
      <p>Používáme pouze nezbytné cookies potřebné pro provoz služby a zapamatování vašich preferencí (např. jazyk a souhlas).</p>
      <h2>Typy cookies</h2>
      <ul>
        <li>Nezbytné: Nutné pro základní funkce (relace a stav souhlasu).</li>
      </ul>
      <h2>Souhlas</h2>
      <p>Cookies můžete přijmout prostřednictvím našeho banneru. Před souhlasem se vyhýbáme jakémukoli sledování.</p>
    </LegalLayout>
  )
}
