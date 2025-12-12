# 🛡️ SACCO Fraud Detection System

A modern, real-time fraud detection platform built for Savings and Credit Cooperative Organizations (SACCOs). Designed to help administrators identify suspicious activities early, protect member assets, and maintain operational integrity.

---

## ✨ What This System Does

Managing a SACCO means protecting your members' hard-earned savings. This system acts as your vigilant partner, continuously monitoring transactions and alerting you to potential fraud before it causes damage.

**Three layers of protection:**
- **Rule-Based Detection** — Catches obvious red flags like unusually large transactions or after-hours activity
- **Statistical Anomaly Detection** — Identifies transactions that deviate significantly from normal patterns
- **Behavioral Analytics** — Learns member habits over time to spot subtle, coordinated fraud attempts

---

## 🏗️ System Architecture

<presentation-mermaid>
graph TB
    subgraph Client["Frontend (React + Vite)"]
        UI[Dashboard UI]
        Charts[Real-time Charts]
        Alerts[Alert Management]
        Auth[Authentication]
    end

    subgraph State["State Management"]
        Zustand[Zustand Store]
    end

    subgraph Detection["Fraud Detection Engine"]
        Rules[Rule-Based Checks]
        Anomaly[Anomaly Detection]
        Behavioral[Behavioral Analysis]
    end

    subgraph Backend["Lovable Cloud (Supabase)"]
        AuthService[Authentication]
        Database[(PostgreSQL)]
        RLS[Row Level Security]
    end

    UI --> Zustand
    Charts --> Zustand
    Alerts --> Zustand
    Auth --> AuthService
    
    Zustand --> Detection
    Detection --> Rules
    Detection --> Anomaly
    Detection --> Behavioral
    
    AuthService --> Database
    Database --> RLS
</presentation-mermaid>

### Data Flow

<presentation-mermaid>
sequenceDiagram
    participant User as Administrator
    participant App as Dashboard
    participant Engine as Detection Engine
    participant Store as Zustand Store
    participant DB as Database

    User->>App: Upload CSV / Start Live Feed
    App->>Engine: Process Transactions
    Engine->>Engine: Rule-Based Checks
    Engine->>Engine: Anomaly Detection
    Engine->>Engine: Behavioral Analysis
    Engine->>Store: Update State with Alerts
    Store->>App: Real-time UI Update
    App->>User: Display Alerts & Metrics
    User->>App: Review & Resolve Alerts
    App->>DB: Persist Actions
</presentation-mermaid>

---

## 🔐 User Roles & Access

| Role | Dashboard | Transactions | Alerts | Settings | Analytics |
|------|-----------|--------------|--------|----------|-----------|
| **Admin** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **Risk Officer** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **Auditor** | ✅ View | ✅ View | ✅ View | ❌ None | ✅ View |

New users are assigned the **Auditor** role by default for security.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui |
| **State** | Zustand |
| **Charts** | Recharts |
| **Backend** | Lovable Cloud (Supabase) |
| **Auth** | Supabase Auth with RLS |
| **Export** | jsPDF, CSV generation |

---

## 🚀 Deployment

### Option 1: Deploy with Lovable (Recommended)

The fastest way to get your fraud detection system live:

1. Open your project in [Lovable](https://lovable.dev)
2. Click **Publish** in the top-right corner
3. Click **Update** to deploy your changes
4. Your app is live! Share the provided URL with your team

**Custom Domain Setup:**
1. Go to **Project → Settings → Domains**
2. Click **Connect Domain**
3. Follow the DNS configuration instructions
4. SSL is automatically provisioned

### Option 2: Self-Hosting

Clone and deploy to your own infrastructure:

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Build for production
npm run build

# Preview the build locally
npm run preview
```

The `dist/` folder contains your production-ready static files. Deploy to any static hosting provider:

| Provider | Command/Notes |
|----------|---------------|
| **Vercel** | `vercel --prod` |
| **Netlify** | Drag & drop `dist/` folder |
| **AWS S3** | Upload to S3 + CloudFront |
| **Cloudflare Pages** | Connect GitHub repo |

### Environment Variables

For self-hosted deployments, configure these variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboard/      # Dashboard widgets & charts
│   ├── layout/         # Navigation & page structure
│   ├── transactions/   # Transaction management
│   ├── alerts/         # Alert components
│   └── ui/             # Reusable UI components (shadcn)
├── contexts/           # React contexts (Auth)
├── hooks/              # Custom React hooks
├── lib/
│   ├── fraudDetection.ts    # Rule-based detection
│   ├── behavioralAnalysis.ts # Behavioral patterns
│   ├── liveFeedSimulator.ts  # Demo data generation
│   ├── exportUtils.ts        # CSV/PDF exports
│   ├── store.ts              # Zustand state
│   └── types.ts              # TypeScript definitions
├── pages/              # Route components
└── integrations/       # Backend integrations
```

---

## 🎯 Key Features

- **Real-time Monitoring** — Live transaction feed with instant fraud detection
- **Multi-layer Detection** — Rule-based, statistical, and behavioral analysis
- **Risk Scoring** — Automatic risk scoring for members based on activity
- **Export Reports** — Generate PDF/CSV reports for audits and board meetings
- **Dark Mode** — Professional dark-first design with light mode option
- **Role-based Access** — Granular permissions for different user types

---

## 🤝 Contributing

We welcome contributions! Whether it's bug fixes, new detection rules, or UI improvements:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software developed for SACCO fraud detection purposes.

---

<p align="center">
  Built with ❤️ for safer SACCOs everywhere
</p>
