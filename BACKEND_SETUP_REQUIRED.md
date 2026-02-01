# 🚨 Backend Setup - Action Required

## Current Status

❌ **In-memory MongoDB is not working** - Disk space or corruption issues  
✅ **All code is ready and tested**  
⚡ **Action Needed:** Set up MongoDB Atlas (FREE, 5 minutes)

---

## Why MongoDB Atlas?

1. ✅ **FREE Forever** - No credit card needed
2. ✅ **Cloud Database** - Works from anywhere
3. ✅ **Production Ready** - Same database for dev and production
4. ✅ **512 MB Free** - More than enough for development
5. ✅ **No Installation** - Just a connection string

---

## Setup Steps (5 Minutes)

### Step 1: Create Account (1 minute)
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/GitHub or email
3. Choose "FREE" tier
4. Click "Create"

### Step 2: Create Cluster (2 minutes)
1. Select **M0 FREE** tier
2. Choose closest region (e.g., US East, Mumbai, etc.)
3. Cluster Name: `EduTrack` (or any name)
4. Click **"Create Cluster"** (takes 1-3 minutes)

### Step 3: Create Database User (1 minute)
1. Click **"Database Access"** in left sidebar
2. Click **"ADD NEW DATABASE USER"**
3. Choose **"Password"** authentication
4. Username: `edutrack_user`
5. Password: Create a strong password (save it!)
6. Database User Privileges: **"Atlas admin"**
7. Click **"Add User"**

### Step 4: Allow Network Access (30 seconds)
1. Click **"Network Access"** in left sidebar
2. Click **"ADD IP ADDRESS"**
3. Click **"ALLOW ACCESS FROM ANYWHERE"** (0.0.0.0/0)
4. Click **"Confirm"**

### Step 5: Get Connection String (30 seconds)
1. Click **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Click **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://edutrack_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password from Step 3
6. Add `/edutrack` before the `?` to specify database name

**Final connection string should look like:**
```
mongodb+srv://edutrack_user:YourPassword123@cluster0.abc123.mongodb.net/edutrack?retryWrites=true&w=majority
```

### Step 6: Update .env File
1. Open `.env` file in your project
2. Find the line: `MONGODB_URI=mongodb+srv://...`
3. Replace it with YOUR connection string from Step 5
4. Save the file

**Example:**
```env
MONGODB_URI=mongodb+srv://edutrack_user:YourPassword123@cluster0.abc123.mongodb.net/edutrack?retryWrites=true&w=majority
```

---

## Start Your Server

```powershell
# In your project folder
node server.js
```

You should see:
```
🎓 EduTrack - Smart Student Study Management System
✅ MongoDB Connected: cluster0.abc123.mongodb.net
🚀 EduTrack Backend running on port 5000
```

---

## Test Your Backend

```powershell
# Test health endpoint
Invoke-RestMethod http://localhost:5000/health

# Run complete test suite
.\test-complete.ps1
```

---

## Troubleshooting

### "Authentication failed"
- Check your password in the connection string
- Make sure you replaced `<password>` with actual password
- No special characters should be URL-encoded

### "IP not whitelisted"
- Go to Network Access
- Make sure 0.0.0.0/0 is added
- Wait 2-3 minutes for changes to apply

### "Cannot connect"
- Check your internet connection
- Try the connection string in MongoDB Compass first
- Make sure cluster is active (not paused)

---

## Alternative: Local MongoDB

If you prefer local MongoDB:

**Windows:**
1. Download: https://www.mongodb.com/try/download/community
2. Install MongoDB Community Server
3. Update `.env`:
   ```env
   USE_MEMORY_DB=false
   MONGODB_URI=mongodb://localhost:27017/edutrack
   ```
4. Start MongoDB service
5. Run `node server.js`

---

## What's Next?

Once your server is running successfully:

1. ✅ Test all APIs using `.\test-complete.ps1`
2. ✅ Verify test accounts work
3. ✅ Start building your frontend
4. ✅ Connect frontend to `http://localhost:5000/api`

---

## Test Accounts

After running test-complete.ps1, you'll have:

**Admin:**
- Email: `admin@edutrack.com`
- Password: `admin123456`

**Teacher:**
- Email: `teacher@edutrack.com`
- Password: `teacher123`

**Student:**
- Email: `student@edutrack.com`
- Password: `student123`
- Enrollment: `2024CSE001`

---

## Need Help?

1. Check `MONGODB_SETUP.md` for detailed MongoDB Atlas guide
2. Check `API_DOCUMENTATION.md` for all API endpoints
3. Check `QUICK_START.md` for usage examples

---

## Summary

🎯 **Goal:** Get MongoDB Atlas connection string  
⏱️ **Time:** 5 minutes  
💰 **Cost:** FREE  
🚀 **Result:** Production-ready backend

**Let's get your backend running perfectly!** 🚀
