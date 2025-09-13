# 🚨 QUICK FIX - Supabase RLS Error

Ak dostávate chybu **"new row violates security policy"**, postupujte takto:

## Krok 1: Vypnúť RLS úplne (Najrýchlejšie riešenie)

V Supabase Dashboard → SQL Editor spustite:

```sql
-- Vypnúť RLS na tabuľke documents
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
```

## Krok 2: Storage Bucket nastavenia

### Ak bucket neexistuje:
1. Choďte do Storage → New bucket
2. Názov: `user_documents`
3. **DÔLEŽITÉ**: Zvoľte "Public bucket" (áno, public pre development!)

### Ak bucket už existuje:
1. Storage → Settings (vedľa bucketu)
2. Prepnite na "Public"

## Krok 3: Otestujte upload

Upload by mal teraz fungovať bez problémov.

## ⚠️ POZOR
Toto je len pre LOCAL DEVELOPMENT! Pre produkciu potrebujete:
1. Správne RLS politiky
2. Private bucket
3. Clerk JWT template integráciu

## Alternatívne riešenie (ak chcete RLS zapnuté)

```sql
-- Zmazať všetky existujúce politiky
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;

-- Vytvoriť jednu politiku pre všetko
CREATE POLICY "Allow everything for dev" 
ON public.documents 
FOR ALL 
USING (true) 
WITH CHECK (true);
```

## Debug informácie

Ak stále nefunguje, skontrolujte:

1. **Supabase URL a Anon Key** v `.env.local`
2. **Clerk je prihlásený** (máte userId?)
3. **Browser console** pre presné error messages
4. **Network tab** - aká je presná odpoveď zo Supabase?
