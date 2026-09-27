# Deploying ISutra to Vercel — Complete Guide

This repository is pre-configured for **seamless deployment on Vercel**. You can deploy both the React frontend and the Express backend API in a **single unified Vercel project** or deploy them separately.

---

## ⚡ Option 1: Unified Full-Stack Deployment (Recommended)

In this setup, Vercel hosts both the **React frontend** and the **Express backend serverless API** under a single domain (e.g., `https://isutra.vercel.app`). 
- **Zero CORS issues** (frontend and API share the exact same domain).
- **Single repository deployment** (no separate hosting needed for backend).
- **Automatic routing**: Requests to `/api/...` go to the backend API serverless function, and all other routes serve the React SPA with full client-side routing support.

### Step 1: Push your code to GitHub

If you haven't committed and pushed your latest changes:
```bash
git add .
git commit -m "Configure Vercel deployment with serverless API and client-side rewrites"
git push origin main
```

---

### Step 2: Import into Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and log in (or sign up with GitHub).
2. Click **"Add New..."** → **"Project"**.
3. Under **"Import Git Repository"**, select your `ISutra` repository and click **Import**.
4. Configure Project Settings:
   - **Framework Preset**: *Vite* (or *Other*)
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build --prefix frontend` (or leave default `npm run build`)
   - **Output Directory**: `frontend/dist`

---

### Step 3: Add Environment Variables (Optional)

In the **Environment Variables** section on Vercel, you can add:

| Variable | Description | Default / Fallback |
| :--- | :--- | :--- |
| `AI_PROVIDER` | AI provider for extraction (`gemini` or `openai`) | `gemini` |
| `AI_API_KEY` | Google Gemini API Key or OpenAI API Key | Uses offline deterministic NLP rule extractor if omitted |
| `AI_MODEL` | Model name (e.g. `gemini-1.5-flash`) | `gemini-1.5-flash` |
| `SUPABASE_URL` | Supabase Project URL | Uses memory fallback if omitted |
| `SUPABASE_ANON_KEY` | Supabase Anon Public Key | Uses memory fallback if omitted |
| `NODE_ENV` | Environment mode | `production` |

> [!NOTE]
> `VITE_API_URL` is **not required** in unified deployment mode! The frontend defaults to `/api`, which automatically routes to your serverless backend on the same domain.

---

### Step 4: Click Deploy

Click **"Deploy"**. Vercel will:
1. Install dependencies
2. Build the Vite production bundle to `frontend/dist`
3. Package the serverless function `api/index.ts`
4. Assign you a production URL (e.g. `https://isutra.vercel.app`)

---

## 💻 Option 2: Deploy Using Vercel CLI (From Terminal)

You can also deploy directly from your local terminal using the Vercel CLI:

1. In your terminal, run:
   ```bash
   npx vercel
   ```
2. Follow the interactive prompts:
   - **Set up and deploy?**: `y`
   - **Which scope?**: Choose your personal account or team
   - **Link to existing project?**: `N`
   - **What's your project's name?**: `isutra`
   - **In which directory is your code located?**: `./`
   - **Want to modify settings?**: `N`
3. To deploy directly to production:
   ```bash
   npx vercel --prod
   ```

---

## 🌐 Option 3: Deploy Frontend Only to Vercel (With External Backend)

If you prefer hosting your Express backend on a long-running server (such as Render, Railway, AWS EC2, or Fly.io) and only host the React frontend on Vercel:

1. In the Vercel Dashboard, import the repository.
2. In **Root Directory**, click **Edit** and select **`frontend`**.
3. Under **Environment Variables**, add:
   - `VITE_API_URL`: Your backend API URL (e.g., `https://isutra-backend.onrender.com/api`)
4. Click **Deploy**.
   - The included `frontend/vercel.json` will automatically configure SPA client rewrites so all React Router paths (`/dashboard`, `/analyze`, etc.) work seamlessly without 404 errors on refresh.
5. In your backend host, set `CORS_ORIGIN` to your Vercel frontend URL (e.g., `https://isutra.vercel.app`).

---

## 🔍 How to Verify the Deployment

Once deployed, test these endpoints:

1. **Frontend**: Visit `https://your-app.vercel.app/`
   - Test navigating to `/dashboard`, `/analyze`, and `/standards`.
   - Refresh the page to verify client-side routing works.
2. **Backend API Health Check**: Visit `https://your-app.vercel.app/api/health`
   - Should return `{ "status": "ok", "service": "ISutra — AI-Powered Indian Standards Intelligence", ... }`.
3. **Standards Directory**: Visit `https://your-app.vercel.app/api/standards`
   - Should return verified BIS standards.
4. **End-to-End Extraction**: In the frontend `/analyze` page, enter a sample requirement (e.g. `100W outdoor LED street light, IP66`) and click **Analyze**. Verify requirements extraction and standard matching.

---

## 🛠️ Configuration Files Reference

- [`vercel.json`](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/vercel.json): Root Vercel configuration routing `/api/*` to the serverless function and all other paths to `frontend/dist/index.html`.
- [`api/index.ts`](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/api/index.ts): Vercel Serverless Function entry point bridging Vercel HTTP requests to Express.
- [`frontend/vercel.json`](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/frontend/vercel.json): Client-side SPA routing fallback for standalone frontend deployment.
- [`backend/src/index.ts`](file:///c:/Users/Eshwar%20Ajay%20Sai/Documents/ISutra/ISutra/backend/src/index.ts): Express server entry point with serverless execution guard and dynamic Vercel CORS support.
