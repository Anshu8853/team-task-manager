# Railway Deployment Guide - Team Task Manager

## Prerequisites

- Railway account (https://railway.app)
- GitHub repository with the project
- Already built and tested locally ✓

---

## Step 1: Create Railway Project

1. Go to https://railway.app/dashboard
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select this repository
4. Railway will automatically detect it's a Node.js/Next.js project

---

## Step 2: Configure Environment Variables

In Railway dashboard, go to **Variables** and add:

```
DATABASE_URL=file:./data/app.db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
```

**Important:** Generate a strong `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 3: Configure Persistent Volume

Railway needs persistent storage for the SQLite database file so it survives redeploys.

1. In Railway dashboard, go to **Storage**
2. Click **"Add Storage"**
3. Set **Mount Path:** `/app/data`
4. This ensures the SQLite file (`/app/data/app.db`) persists across deployments

---

## Step 4: Configure Build & Start Commands

Railway should auto-detect from `package.json`, but verify:

**Build Command:**
```
prisma db push && next build
```

**Start Command:**
```
next start
```

These are already set in `package.json`, so Railway will use them automatically.

---

## Step 5: Deploy

1. Click the **Deploy** button
2. Railway will:
   - Clone the repo
   - Install dependencies
   - Run build command (schema sync + Next build)
   - Start the server
3. Once deployed, Railway will give you a live URL

---

## Step 6: Seed Demo Data (First Deploy Only)

After the first deployment, the database schema is created but empty. To seed demo users:

Option A: Use Railway Shell
1. In Railway dashboard, go to **Logs** 
2. Click **Terminal** tab
3. Run:
   ```bash
   npm run db:seed
   ```

Option B: Make an API call
Once deployed, you can create users via the signup endpoint.

---

## Demo Accounts After Seeding

```
Admin:
- Email: admin@teamtask.local
- Password: Password123!

Member:
- Email: member@teamtask.local
- Password: Password123!
```

---

## Accessing Your Deployed App

After successful deployment, Railway will provide a URL like:
```
https://your-app-name-production.up.railway.app
```

Your app will be fully accessible at this URL with:
- ✅ Full authentication (signup/login)
- ✅ Projects and team management
- ✅ Task assignment and tracking
- ✅ Dashboard with statistics
- ✅ Role-based access control
- ✅ All 13 REST API endpoints

---

## Monitoring & Logs

In Railway dashboard:
- **Logs:** Real-time server output
- **Metrics:** CPU, memory, network usage
- **Deployments:** History of all deployments
- **Env:** View/update environment variables

---

## Troubleshooting

### Build Fails
- Check **Logs** for error messages
- Ensure all dependencies are in `package.json`
- Verify `prisma/schema.prisma` is valid

### App Won't Start
- Check if `JWT_SECRET` is set
- Verify `DATABASE_URL=file:./data/app.db` is configured
- Check if volume mount is active

### Database Issues
- Ensure volume mount at `/app/data` is configured
- Run `npm run db:seed` to initialize demo data
- Check database file exists at `/app/data/app.db`

### Authentication Not Working
- Verify `JWT_SECRET` is a strong random string
- Check cookies are being set (browser DevTools → Application → Cookies)
- Ensure `NODE_ENV=production` is set

---

## Production Checklist

- [ ] Repository pushed to GitHub
- [ ] Railway project created from GitHub
- [ ] `DATABASE_URL` set to `file:./data/app.db`
- [ ] `JWT_SECRET` set to a strong random value
- [ ] Volume mount configured at `/app/data`
- [ ] App builds successfully (check Logs)
- [ ] App starts without errors
- [ ] Demo data seeded via `npm run db:seed`
- [ ] Signup/login works
- [ ] Projects can be created
- [ ] Tasks can be assigned
- [ ] Dashboard displays data
- [ ] Logout redirects to home
- [ ] Share live URL with submission

---

## Deployment URL Format

Your live app will be accessible at:
```
https://{railway-app-name}-production.up.railway.app
```

Share this URL for the submission.

---

## Next Steps

1. Push this repository to GitHub (if not already done)
2. Create a new Railway project
3. Follow steps 1-5 above
4. Test the live app
5. Submit the live URL along with GitHub repo link

**The app is now ready for production deployment!** 🚀
