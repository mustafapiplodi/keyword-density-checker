# Keep Render Service Alive Solutions

This document explains how to prevent your Render free tier service from sleeping after 15 minutes of inactivity.

## Current Implementation: GitHub Actions (Free)

We've implemented a GitHub Actions workflow that automatically pings your backend every 10 minutes.

### How It Works

1. **Health Check Endpoint**: `/api/health`
   - Returns service status and timestamp
   - Lightweight endpoint designed for keep-alive pings

2. **GitHub Actions Workflow**: `.github/workflows/keep-alive.yml`
   - Runs automatically every 10 minutes
   - Sends GET request to health endpoint
   - Logs response for monitoring

### Enable GitHub Actions

GitHub Actions are automatically enabled when you push this workflow file. To verify:

1. Go to your GitHub repository
2. Click the "Actions" tab
3. You should see "Keep Render Service Alive" workflow
4. It will run automatically every 10 minutes

### Manual Trigger

You can manually trigger the workflow:
1. Go to Actions tab
2. Select "Keep Render Service Alive"
3. Click "Run workflow"

---

## Alternative Solutions

### Option 1: UptimeRobot (External Service)

**Pros:**
- Dedicated monitoring service
- Email alerts if service goes down
- Dashboard with uptime statistics
- More reliable than GitHub Actions

**Setup:**
1. Go to https://uptimerobot.com
2. Create free account
3. Add monitor:
   - Type: HTTP(s)
   - URL: `https://keyword-density-checker-z0sk.onrender.com/api/health`
   - Interval: 5 minutes
4. Done! Service will stay awake

### Option 2: Cron-job.org

**Pros:**
- Simple to set up
- Reliable
- Free unlimited jobs

**Setup:**
1. Go to https://cron-job.org
2. Create account
3. Add new cron job:
   - URL: `https://keyword-density-checker-z0sk.onrender.com/api/health`
   - Interval: Every 10 minutes
4. Enable job

### Option 3: Vercel Cron Jobs

**Requirement:** Vercel Pro plan ($20/month)

Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/ping-backend",
    "schedule": "*/10 * * * *"
  }]
}
```

Then create API route that pings Render backend.

### Option 4: Render Paid Plan

**Cost:** $7/month

**Benefit:** No sleep, no need for keep-alive

Upgrade at: https://dashboard.render.com

---

## Monitoring

### Check if Keep-Alive is Working

Test the health endpoint:
```bash
curl https://keyword-density-checker-z0sk.onrender.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "Keyword Density Checker API is running",
  "timestamp": "2025-11-10T13:15:00",
  "spacy_available": true
}
```

### GitHub Actions Logs

1. Go to Actions tab in GitHub
2. Click on any workflow run
3. View logs to see ping results

---

## Troubleshooting

### GitHub Actions Not Running

- Check if Actions are enabled in repository settings
- Verify workflow file is in `.github/workflows/` directory
- GitHub Actions require at least one commit to the default branch

### Service Still Sleeping

- GitHub Actions free tier has usage limits (2,000 minutes/month)
- Use UptimeRobot as backup
- Consider upgrading to Render paid plan

### Too Many Requests

If you see rate limiting:
- Increase interval to 12-14 minutes (still under 15-minute sleep threshold)
- Use only one keep-alive service at a time

---

## Recommendations

**For Production:**
1. Use **UptimeRobot** (most reliable, includes monitoring)
2. Keep **GitHub Actions** as backup
3. Consider upgrading to Render paid plan when budget allows

**For Development:**
1. **GitHub Actions** (current implementation) is sufficient
2. Monitor via Actions tab
3. Manually wake service when needed

---

## Cost Comparison

| Solution | Cost | Reliability | Setup Time |
|----------|------|-------------|------------|
| GitHub Actions | Free | Good | 5 min |
| UptimeRobot | Free | Excellent | 5 min |
| Cron-job.org | Free | Excellent | 5 min |
| Vercel Cron | $20/mo | Excellent | 15 min |
| Render Paid | $7/mo | Perfect | 1 min |

---

## Current Status

✅ Health check endpoint created: `/api/health`
✅ GitHub Actions workflow deployed
✅ Runs every 10 minutes automatically
✅ Service will not sleep during active hours

**Note:** GitHub Actions may not run during periods of repository inactivity. For 24/7 uptime, use UptimeRobot as primary solution.
