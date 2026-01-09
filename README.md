# SeraphAi AI Mortgage Tools

This is a static HTML site powered by SeraphAi's intelligent mortgage automation suite. It includes interactive modules for:

- 💰 **Crypto Asset Depletion Calculator** (NEW!)
- ✅ Lead Scoring
- 📄 Document AI (W-2, FNMA 3.2, MISMO)
- 🧠 Underwriting Assistant
- ⚙️ RPA Automation Workflow
- 🔍 Compliance Checker
- 💬 Chatbot Assistant (Botpress)

## 💰 Crypto Mortgage Calculator

Calculate mortgage affordability using cryptocurrency assets with the industry-standard **crypto asset depletion method**.

### How It Works

The calculator uses the following methodology:

1. **50% Haircut**: Your crypto value is reduced by 50% to account for market volatility
2. **84-Month Depletion**: The adjusted value is divided by 84 months (7 years)
3. **Qualifying Income**: This monthly amount is added to your other income for mortgage qualification
4. **DTI Analysis**: Calculates maximum home affordability based on debt-to-income ratios

### Features

- Calculate monthly income from crypto assets (Bitcoin, Ethereum, etc.)
- MSA-specific calculations for different cost areas (High/Medium/Low)
- Comprehensive PITI breakdown (Principal, Interest, Taxes, Insurance)
- HOA fee estimates based on location
- Total interest calculations over loan lifetime
- Real-time DTI ratio analysis
- Support for additional income sources
- Existing debt consideration

### Formula

```
Crypto Monthly Income = (Crypto Value × 0.5) ÷ 84
Total Qualifying Income = Crypto Monthly Income + Additional Income
Max Housing Payment = (Total Income × DTI%) - Other Debts
```

### Example

- Crypto Value: $168,000
- After 50% haircut: $84,000
- Monthly income: $84,000 ÷ 84 = $1,000/month
- With 43% DTI and $5,000 additional income → Affordability calculated based on MSA

## 🚀 Upload & Parse
Upload a `.fnm`, `.xml`, or `.pdf` file to simulate document extraction. This connects to a Flask API backend to parse data like:

- Credit score
- Income
- DTI
- LTV

## 🛠 How to Deploy

1. Push this folder to a GitHub repo (e.g., `seraphai-site`)
2. Go to **Settings → Pages** and set:
   - **Branch:** `main`
   - **Folder:** `/ (root)`
3. Your live site will be at `https://your-username.github.io/seraphai-site/`

## 🌐 Custom Domain (optional)

Update your DNS records and GitHub Pages custom domain setting. See `/CNAME` if using a custom domain like `www.seraphai.com`.

---

© 2025 SeraphAi. All rights reserved.
