# SeraphAi AI Mortgage Tools

This is a static HTML site powered by SeraphAi's intelligent mortgage automation suite. It includes interactive modules for:

- ✅ Lead Scoring
- 📄 Document AI (W-2, FNMA 3.2, MISMO)
- 🧠 Underwriting Assistant
- ⚙️ RPA Automation Workflow
- 🔍 Compliance Checker
- 💬 Chatbot Assistant (Botpress)

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
