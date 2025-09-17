# Domain Setup Guide - legacyguard.cz

## Overview
This guide provides step-by-step instructions for configuring the `legacyguard.cz` domain with Forpsi as the domain provider and Vercel as the hosting platform.

## 🌐 Domain Information
- **Domain**: legacyguard.cz
- **Registrar**: Forpsi (forpsi.com)
- **Hosting**: Vercel
- **SSL**: Automatic via Vercel

## 📋 Prerequisites
- Access to Forpsi admin panel
- Access to Vercel dashboard
- Project deployed to Vercel

## 🚀 Setup Steps

### Step 1: Vercel Configuration

#### 1.1 Add Domain to Vercel Project
```bash
# Using Vercel CLI
vercel domains add legacyguard.cz

# Or add via dashboard:
# 1. Go to https://vercel.com/dashboard
# 2. Select your project
# 3. Go to Settings → Domains
# 4. Add "legacyguard.cz"
```

#### 1.2 Vercel will provide DNS records
After adding the domain, Vercel will show required DNS records:
- A record for apex domain
- CNAME record for www subdomain

### Step 2: Forpsi DNS Configuration

#### 2.1 Login to Forpsi Admin
1. Navigate to https://admin.forpsi.com
2. Login with your credentials
3. Go to "Domény" (Domains) section
4. Select `legacyguard.cz`
5. Click on "DNS záznamy" (DNS records)

#### 2.2 Configure DNS Records

##### Remove Default Records
First, remove any conflicting A or CNAME records:
- Remove default A record pointing to Forpsi parking
- Remove default CNAME for www if exists

##### Add Vercel Records

**A Record for Apex Domain (@)**
```
Název (Name): @ nebo prázdné (@ or empty)
Typ (Type): A
Hodnota (Value): 76.76.21.21
TTL: 3600
```

**CNAME Record for WWW**
```
Název (Name): www
Typ (Type): CNAME
Hodnota (Value): cname.vercel-dns.com
TTL: 3600
```

**Alternative: Using Vercel's IP Addresses**
If you need to use A records for both:
```
@ → 76.76.21.21
www → 76.76.21.21
```

#### 2.3 Additional Recommended Records

**CAA Record (Certificate Authority Authorization)**
```
Název (Name): @
Typ (Type): CAA
Hodnota (Value): 0 issue "letsencrypt.org"
TTL: 3600
```

**TXT Record for Domain Verification**
```
Název (Name): _vercel
Typ (Type): TXT
Hodnota (Value): [Vercel will provide this]
TTL: 3600
```

### Step 3: Subdomain Configuration (Optional)

#### API Subdomain
```
Název (Name): api
Typ (Type): CNAME
Hodnota (Value): cname.vercel-dns.com
TTL: 3600
```

#### App Subdomain
```
Název (Name): app
Typ (Type): CNAME
Hodnota (Value): cname.vercel-dns.com
TTL: 3600
```

#### Staging Subdomain
```
Název (Name): staging
Typ (Type): CNAME
Hodnota (Value): cname.vercel-dns.com
TTL: 3600
```

### Step 4: Email Configuration (if needed)

If you want to use email with legacyguard.cz:

#### MX Records for Google Workspace
```
Priority 1: ASPMX.L.GOOGLE.COM
Priority 5: ALT1.ASPMX.L.GOOGLE.COM
Priority 5: ALT2.ASPMX.L.GOOGLE.COM
Priority 10: ALT3.ASPMX.L.GOOGLE.COM
Priority 10: ALT4.ASPMX.L.GOOGLE.COM
```

#### SPF Record
```
Název (Name): @
Typ (Type): TXT
Hodnota (Value): "v=spf1 include:_spf.google.com ~all"
TTL: 3600
```

### Step 5: Verification

#### 5.1 DNS Propagation Check
Use online tools to verify DNS propagation:
- https://dnschecker.org
- https://whatsmydns.net

Check for:
- `legacyguard.cz` → 76.76.21.21
- `www.legacyguard.cz` → cname.vercel-dns.com

#### 5.2 Vercel Dashboard Verification
1. Go to Vercel project settings
2. Check Domains section
3. Look for green checkmarks next to:
   - legacyguard.cz ✓
   - www.legacyguard.cz ✓

#### 5.3 SSL Certificate
- SSL certificate will be automatically provisioned by Vercel
- This usually takes 10-60 minutes after DNS verification
- Check: https://legacyguard.cz should show padlock icon

### Step 6: Configure Redirects

#### In Vercel.json
```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "host",
          "value": "www.legacyguard.cz"
        }
      ],
      "destination": "https://legacyguard.cz/$1",
      "permanent": true
    }
  ]
}
```

## 🔍 Troubleshooting

### DNS Not Resolving
- **Issue**: Domain not pointing to Vercel
- **Solution**: 
  1. Check DNS records in Forpsi
  2. Wait for DNS propagation (up to 48 hours)
  3. Clear DNS cache: `dscacheutil -flushcache` (macOS)

### SSL Certificate Error
- **Issue**: SSL certificate not working
- **Solution**:
  1. Verify DNS records are correct
  2. Check Vercel dashboard for domain status
  3. Re-deploy the project
  4. Contact Vercel support if persists

### Wrong Content Showing
- **Issue**: Old content or parking page
- **Solution**:
  1. Clear browser cache
  2. Check DNS records point to Vercel
  3. Verify deployment is successful

### Forpsi Specific Issues
- **DNS Changes Not Saving**: 
  - Ensure you click "Uložit" (Save) after changes
  - Wait 5-10 minutes for Forpsi to update
  
- **Cannot Remove Records**:
  - Some records might be locked
  - Contact Forpsi support: support@forpsi.com

## 📊 DNS Record Summary

| Type | Name | Value | TTL | Purpose |
|------|------|-------|-----|---------|
| A | @ | 76.76.21.21 | 3600 | Main domain |
| CNAME | www | cname.vercel-dns.com | 3600 | WWW subdomain |
| TXT | _vercel | [from Vercel] | 3600 | Domain verification |
| CAA | @ | 0 issue "letsencrypt.org" | 3600 | SSL certificate |

## 🔐 Security Considerations

1. **DNSSEC**: Consider enabling DNSSEC in Forpsi for additional security
2. **CAA Records**: Restrict certificate issuance to trusted CAs
3. **SPF/DKIM/DMARC**: Configure if using email
4. **Rate Limiting**: Configure in Vercel for DDoS protection

## 📞 Support Contacts

### Forpsi Support
- **Email**: support@forpsi.com
- **Phone**: +420 257 329 330
- **Portal**: https://podpora.forpsi.com

### Vercel Support
- **Dashboard**: https://vercel.com/support
- **Docs**: https://vercel.com/docs
- **Status**: https://vercel-status.com

## ✅ Checklist

- [ ] Domain added to Vercel project
- [ ] A record configured in Forpsi
- [ ] CNAME record configured for www
- [ ] DNS propagation verified
- [ ] SSL certificate active
- [ ] Domain accessible via HTTPS
- [ ] WWW redirect working
- [ ] Email records configured (if needed)
- [ ] DNSSEC enabled (optional)
- [ ] Monitoring set up

## 🚀 Next Steps

After domain setup is complete:

1. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_APP_URL=https://legacyguard.cz
   NEXT_PUBLIC_API_URL=https://api.legacyguard.cz
   ```

2. **Update Social Media Links**
   - Update all social profiles with new domain
   - Update email signatures

3. **Set up Analytics**
   - Configure Google Analytics for legacyguard.cz
   - Set up monitoring for uptime

4. **SEO Configuration**
   - Submit sitemap to Google Search Console
   - Update robots.txt
   - Configure meta tags

5. **Legal Requirements**
   - Update privacy policy with new domain
   - Update terms of service
   - Ensure GDPR compliance for .cz domain

## 📝 Notes for Czech Domain (.cz)

The .cz domain has specific requirements:
- **Registry**: CZ.NIC
- **WHOIS**: Public information required
- **Legal**: Must comply with Czech law
- **Language**: Consider Czech language support
- **Cookie Law**: EU cookie consent required

## 🎯 Final Verification

Once setup is complete, verify:
```bash
# Check DNS resolution
nslookup legacyguard.cz
dig legacyguard.cz

# Check SSL certificate
openssl s_client -connect legacyguard.cz:443 -servername legacyguard.cz

# Check HTTP headers
curl -I https://legacyguard.cz

# Check redirects
curl -I http://www.legacyguard.cz
```
