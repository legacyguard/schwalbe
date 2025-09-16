export type SupportedCurrency = 'CZK' | 'EUR'

export function formatCurrency(amountCents: number, currency: SupportedCurrency, locale?: string): string {
  const amt = amountCents / 100
  if (currency === 'CZK') {
    // CZK: usually 0 decimals on invoices, but we keep 0 for display; Stripe handles exact amounts on invoices
    const fmt = new Intl.NumberFormat(locale || 'cs-CZ', { style: 'currency', currency: 'CZK', minimumFractionDigits: 0, maximumFractionDigits: 0 })
    return fmt.format(amt)
  }
  // EUR
  const fmt = new Intl.NumberFormat(locale || 'sk-SK', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return fmt.format(amt)
}

export function currencySymbol(currency: SupportedCurrency): string {
  return currency === 'CZK' ? 'Kč' : '€'
}