# 💸 Volo: The AI-Powered Travel Budget Optimizer

**Travel smarter, not just further.** Volo is an intelligent travel orchestration engine designed to maximize budget efficiency. By integrating real-time cost-modeling, dynamic price-clamping, and multi-cloud AI, Volo transforms vague "travel plans" into strictly optimized, financially-viable itineraries.

---

## 🚀 Live Demo
You can access the full production build here: 
👉 **[https://volo-theta.vercel.app/](https://volo-theta.vercel.app/)**

> **⚠️ Note to Judges:** Volo is hosted on free-tier cloud infrastructure. Because our services scale down when inactive to save energy, **the first request may take 45-60 seconds** to wake up the servers (the "Cold Start"). Subsequent requests are lightning-fast.

---

## 🏗️ Technical Architecture
Volo is built on a distributed microservices architecture, ensuring that our financial modeling and AI intelligence remain resilient even under high load.



[Image of microservices architecture diagram]


* **Frontend:** Next.js (Deployed on Vercel)
* **Finance & Optimization Service:** C# .NET 10 (Dockerized on Render)
* **User Data & Auth Service:** C# .NET 10 (Dockerized on Render)

---

## 📈 The Financial Engine
Unlike standard aggregators, Volo treats your budget as a **hard constraint**.
* **Dynamic Math Firewall:** Our backend enforces strict limits, preventing suggested itineraries from exceeding your specified budget.
* **Granular Cost Breakdown:** We dissect trip costs into *Transport*, *Accommodation*, and *Daily Allowance*, ensuring 100% financial transparency.
* **Currency-Agnostic Processing:** Native handling of multi-currency constraints (TRY/EUR).

---

## 🛠️ Local Development Setup
To run Volo locally, you will need to clone the repository and run all three services simultaneously.

### 1. Prerequisites
* **Node.js** (v18+)
* **.NET 10 SDK**
* A code editor (VS Code recommended)

### 2. Clone the Repository
```bash
git clone [https://github.com/tseliasas/Volo.git](https://github.com/tseliasas/Volo.git)
cd Volo

cd backend
dotnet restore
dotnet run
# API runs on localhost:5133

cd db-backend
dotnet restore
dotnet run
# API runs on localhost:5088

cd frontend
npm install
npm run dev
# App runs on localhost:3000
