# 🖼️ LegacyGuard Social Media Image Generator

This directory contains tools to generate a professional 1200x630px social media image for LegacyGuard.

## 🎯 What You Get

A beautiful social media image featuring:
- **LegacyGuard branding** with shield icon
- **Professional tagline**: "Your Legacy, Secured. Your Family, Protected."
- **Key features**: AI-Powered Security, Family Protection, Document Management
- **Modern design** with gradients and subtle patterns
- **Perfect dimensions** for all social media platforms

## 🚀 Quick Start Options

### Option 1: Generate PNG with Node.js (Recommended)
```bash
# Install canvas package
npm install canvas

# Generate the image
node scripts/generate-og-image.js
```

**Result**: `public/og-image.png` (ready to use)

### Option 2: Use HTML Version
1. Open `public/og-image.html` in Chrome/Firefox
2. Right-click on the image area → "Inspect"
3. Right-click on `.og-image` element → "Capture node screenshot"
4. Save as `og-image.png`

### Option 3: Use SVG Version
1. Open `public/og-image.svg` in any browser
2. Use browser's "Print" function
3. Save as PDF, then convert to PNG at 1200x630px

## 📱 Social Media Ready

The generated image is optimized for:
- ✅ **Facebook** - Perfect preview when sharing links
- ✅ **LinkedIn** - Professional appearance in posts
- ✅ **Twitter** - Large image card display
- ✅ **WhatsApp/Telegram** - Rich link previews
- ✅ **Instagram** - Story and post sharing

## 🎨 Design Features

- **Colors**: LegacyGuard brand colors (slate, blue, green)
- **Typography**: Professional, readable fonts
- **Layout**: Clean, modern, trustworthy appearance
- **Branding**: Prominent LegacyGuard logo and name
- **Message**: Clear value proposition

## 🔧 Customization

### Change Colors
Edit the color values in any of the source files:
- Background: `#0f172a`, `#1e293b`, `#334155`
- Accent: `#3b82f6`, `#10b981`, `#8b5cf6`
- Text: `#e2e8f0`, `#cbd5e1`

### Change Text
Modify the tagline and features in the source files:
- Tagline: "Your Legacy, Secured. Your Family, Protected."
- Features: "AI-Powered Security", "Family Protection", "Document Management"

### Change Logo
Replace the shield emoji (🛡️) with your custom logo or icon.

## 📏 Technical Specifications

- **Dimensions**: 1200 x 630 pixels (exact)
- **Format**: PNG (recommended), SVG, HTML
- **File Size**: Under 1MB (optimized)
- **Colors**: RGB, web-safe
- **Transparency**: None (solid background)

## 🧪 Testing

After generating your image:

1. **Upload to your domain**: Place in `public/` folder
2. **Test with social media tools**:
   - Facebook: https://developers.facebook.com/tools/debug/
   - Twitter: https://cards-dev.twitter.com/validator
   - LinkedIn: https://www.linkedin.com/post-inspector/

3. **Verify appearance** on all platforms

## 🆘 Troubleshooting

### Canvas Installation Issues
If you get canvas errors:
```bash
# On macOS
brew install pkg-config cairo pango libpng jpeg giflib librsvg

# On Ubuntu/Debian
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Then reinstall canvas
npm install canvas
```

### Alternative Solutions
- Use the HTML version (no dependencies)
- Use the SVG version (convert online)
- Use online image generators (Canva, Figma)

## 📚 Next Steps

1. **Generate the image** using any method above
2. **Upload to your domain** (public folder)
3. **Update MetaTags component** with correct URL
4. **Test social media sharing**
5. **Monitor performance** and optimize

## 🎉 Success!

Once complete, your LegacyGuard links will display beautifully on all social media platforms with:
- Professional appearance
- Clear branding
- Compelling messaging
- Optimal engagement

---

**Generated**: January 2025  
**Version**: 1.0  
**Maintainer**: Development Team
