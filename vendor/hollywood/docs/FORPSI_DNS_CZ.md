# Konfigurace DNS pro legacyguard.cz na Forpsi

## 🎯 Rychlý průvodce

Tento dokument obsahuje přesné hodnoty pro nastavení DNS záznamů na Forpsi pro doménu **legacyguard.cz**.

## 📋 DNS záznamy k nastavení

### 1. Hlavní doména (legacyguard.cz)

| Pole | Hodnota |
|------|---------|
| **Název záznamu** | @ nebo prázdné |
| **Typ** | A |
| **Hodnota** | 76.76.21.21 |
| **TTL** | 3600 |

### 2. WWW subdoména

| Pole | Hodnota |
|------|---------|
| **Název záznamu** | www |
| **Typ** | A |
| **Hodnota** | 76.76.21.21 |
| **TTL** | 3600 |

### 3. Staging prostředí (volitelné)

| Pole | Hodnota |
|------|---------|
| **Název záznamu** | staging |
| **Typ** | CNAME |
| **Hodnota** | cname.vercel-dns.com |
| **TTL** | 3600 |

### 4. API subdoména (volitelné)

| Pole | Hodnota |
|------|---------|
| **Název záznamu** | api |
| **Typ** | CNAME |
| **Hodnota** | cname.vercel-dns.com |
| **TTL** | 3600 |

## 🔧 Postup nastavení na Forpsi

### Krok 1: Přihlášení do administrace
1. Otevřete https://admin.forpsi.com
2. Přihlaste se svými údaji
3. V menu vyberte **"Domény"**

### Krok 2: Výběr domény
1. Najděte doménu **legacyguard.cz**
2. Klikněte na název domény
3. Vyberte **"DNS záznamy"** nebo **"Editace DNS"**

### Krok 3: Odstranění starých záznamů
⚠️ **Důležité**: Nejprve odstraňte konfliktní záznamy

Odstraňte tyto záznamy pokud existují:
- A záznam pro @ směřující na parking Forpsi
- A záznam pro www směřující na parking Forpsi
- Jakékoliv CNAME záznamy pro www

### Krok 4: Přidání nových záznamů

#### A) Hlavní doména
1. Klikněte na **"Přidat záznam"**
2. Vyplňte:
   - **Název**: @ (nebo nechte prázdné)
   - **Typ**: A
   - **Hodnota**: 76.76.21.21
   - **TTL**: 3600
3. Klikněte **"Uložit"**

#### B) WWW subdoména
1. Klikněte na **"Přidat záznam"**
2. Vyplňte:
   - **Název**: www
   - **Typ**: A
   - **Hodnota**: 76.76.21.21
   - **TTL**: 3600
3. Klikněte **"Uložit"**

### Krok 5: Uložení změn
🔴 **DŮLEŽITÉ**: Nezapomeňte kliknout na hlavní tlačítko **"Uložit změny"** nebo **"Potvrdit"** pro aplikaci všech změn!

## ✅ Kontrolní seznam

- [ ] Přihlášen do admin.forpsi.com
- [ ] Vybrána doména legacyguard.cz
- [ ] Odstraněny staré A záznamy
- [ ] Přidán A záznam pro @ → 76.76.21.21
- [ ] Přidán A záznam pro www → 76.76.21.21
- [ ] Změny uloženy tlačítkem "Uložit změny"
- [ ] Čekání 5-30 minut na propagaci

## 🔍 Ověření funkčnosti

### Online nástroje pro kontrolu:
1. https://dnschecker.org - zadejte "legacyguard.cz"
2. https://whatsmydns.net - zadejte "legacyguard.cz"

### Kontrola v terminálu:
```bash
# Windows (CMD)
nslookup legacyguard.cz

# Mac/Linux
dig legacyguard.cz
host legacyguard.cz
```

### Očekávané výsledky:
- legacyguard.cz → 76.76.21.21 ✓
- www.legacyguard.cz → 76.76.21.21 ✓

## ⏱️ Časová osa

| Akce | Čas |
|------|-----|
| Nastavení DNS na Forpsi | 0 min |
| Propagace v rámci Forpsi | 5-10 min |
| Částečná propagace DNS | 30 min |
| Plná propagace DNS | 2-24 hodin |
| SSL certifikát od Vercel | 10-60 min po propagaci |

## 🚨 Řešení problémů

### DNS se neaktualizuje
- Zkontrolujte, zda jste klikli na **"Uložit změny"**
- Počkejte alespoň 30 minut
- Vymažte DNS cache: 
  - Windows: `ipconfig /flushdns`
  - Mac: `dscacheutil -flushcache`

### Stránka nefunguje
- Ověřte DNS záznamy na dnschecker.org
- Zkontrolujte Vercel dashboard
- Kontaktujte podporu Forpsi: support@forpsi.com

### Chyba SSL certifikátu
- Počkejte 1 hodinu po nastavení DNS
- Ověřte, že DNS směřuje na 76.76.21.21
- Zkuste znovu nasadit projekt na Vercel

## 📞 Kontakty pro podporu

### Forpsi
- **Email**: support@forpsi.com
- **Telefon**: +420 257 329 330
- **Web**: https://podpora.forpsi.com

### Vercel
- **Status**: https://vercel-status.com
- **Dokumentace**: https://vercel.com/docs

## 🎉 Po úspěšném nastavení

Jakmile bude vše fungovat:
1. Web bude dostupný na https://legacyguard.cz ✓
2. Automatické přesměrování z www.legacyguard.cz ✓
3. SSL certifikát aktivní (zelený zámek) ✓
4. Rychlé načítání díky Vercel Edge Network ✓

## 📝 Poznámky

- Vercel automaticky zajistí SSL certifikát (Let's Encrypt)
- Není potřeba kupovat SSL certifikát od Forpsi
- DNS změny mohou trvat až 48 hodin (obvykle fungují do 1 hodiny)
- Forpsi DNS servery: ns.forpsi.cz, ns.forpsi.it, ns.forpsi.net
