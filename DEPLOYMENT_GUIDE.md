# 🚀 Zero-Cost Deployment Guide for EduTrack

This guide explains how to deploy EduTrack for **$0/month** and the limits you need to know.

## 1. The "Forever Free" Stack

To keep this completely free, we use the following services with their generous free tiers:

| Component | Service | Free Tier Limits | What happens if you exceed? |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Vercel** (or Netlify) | 100GB Bandwidth/mo | Site might be temporarily disabled or you get a warning. |
| **Backend** | **Render** (or Railway) | 750 Instance Hours/mo | Service spins down (sleeps) after inactivity. First request takes 30s to load. |
| **Database** | **MongoDB Atlas** | 512 MB Storage | You cannot add more data until you delete old data. |

---

## 2. ⚠️ Important Caveats for "Many Users"

You asked: *"If many other users use this, will it still be free?"*

**Yes, it remains free, BUT:**

1.  **Performance will vary**: Free tier servers (like Render's) "sleep" after 15 minutes of inactivity. When a new user visits, they will wait roughly **30-50 seconds** for the backend to wake up.
    *   *Solution*: This is fine for a portfolio. For a real product, you'd pay $7/mo to keep it awake.
2.  **Database Limit**: 512MB is a lot for just text (millions of assignments), but if "many users" implies thousands of active students, you might hit connection limits (concurrent users).
    *   *Limit*: ~500 concurrent connections.
3.  **Rate Limiting**: We added code to limit users to **100 requests / 15 mins**. If "many users" try to spam the API, they will be blocked for a while. This protects your free tier from being overwhelmed.

**Verdict**: For a portfolio, class project, or beta with < 50 active users, **it is absolutely robust and free**.

---

## 3. Step-by-Step Deployment

### A. Database (MongoDB Atlas)
1.  Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a **Shared (Free)** cluster.
3.  Create a Database User (username/password).
4.  Allow Access from Anywhere (`0.0.0.0/0`) in Network Access.
5.  Get your connection string: `mongodb+srv://<user>:<password>@cluster...`

### B. Backend (Render.com)
1.  Connect your GitHub repo to Render.
2.  Select **Web Service**.
3.  **Build Command**: `npm install`
4.  **Start Command**: `node server.js`
5.  **Environment Variables**:
    *   `NODE_ENV`: `production`
    *   `MONGODB_URI`: (Your Atlas connection string from Step A)
    *   `JWT_SECRET`: (Any long random string)
    *   `ALLOWED_ORIGINS`: (Your Frontend URL, set this *after* deploying frontend)

### C. Frontend (Vercel)
1.  Install Vercel CLI or use their dashboard.
2.  Import `edutrack-frontend` folder.
3.  **Environment Variables**:
    *   `VITE_API_URL`: (Your Backend URL from Step B, e.g., `https://edutrack-api.onrender.com`)
4.  Deploy!

---

## 4. Keeping it Free (Code Features We Added)
*   **Disabled File Uploads**: Prevents storage costs.
*   **Rate Limiting**: Prevents bandwidth spikes.
*   **In-Memory Option**: If you don't want MongoDB Atlas, setting `USE_MEMORY_DB=true` enables a temporary database that resets every time the server restarts (Great for simple demos).
