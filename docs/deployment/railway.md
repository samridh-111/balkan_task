# Railway Deployment Guide 🚂

This guide provides step-by-step instructions for deploying the Balkan File Management System on Railway.

## Prerequisites

- Railway account ([railway.app](https://railway.app))
- GitHub repository with the project
- Basic familiarity with Railway dashboard

## Architecture Overview

Railway deployment consists of:
- **PostgreSQL Database**: Railway's built-in managed database
- **Backend Service**: Go API server
- **Frontend Service**: React SPA served by Railway's Node.js runtime

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure your code is pushed to GitHub:
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2. Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your GitHub account
5. Select the `balkan_task` repository
6. Choose your branch (usually `main`)

### 3. Add PostgreSQL Database

1. In your Railway project, click **"Add Service"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will automatically create and configure PostgreSQL
4. **Important**: Wait for the database to be fully ready (green status)

### 4. Deploy Backend Service

#### Option A: Using Railway's Go Builder (Recommended)
1. In Railway dashboard, go to your project
2. Click **"Add Service"** → **"Empty Service"**
3. Name it `backend`
4. Set the **Root Directory** to `backend/`
5. Railway will detect it's a Go project and build automatically

#### Option B: Using Docker
1. Create a service and set **Root Directory** to `backend/`
2. Railway will use the `backend/Dockerfile`

#### Backend Environment Variables
In the backend service settings, add these variables:
```
SERVER_HOST=0.0.0.0
SERVER_PORT=8080
DB_SSLMODE=require
JWT_SECRET=your-super-secret-jwt-key-change-this-32-chars-minimum
STORAGE_PATH=./uploads
GIN_MODE=release
LOG_LEVEL=info
```

**Note**: Database variables (`DATABASE_*`) are provided automatically by Railway.

### 5. Deploy Frontend Service

1. Click **"Add Service"** → **"Empty Service"**
2. Name it `frontend`
3. Set **Root Directory** to `frontend/`
4. Railway will detect Node.js and use the `frontend/package.json`

#### Frontend Environment Variables
```
VITE_API_URL=https://your-backend-service-name.railway.app
```

**Note**: Replace with your actual backend service URL from Railway.

### 6. Configure Service Dependencies

1. In Railway dashboard, go to service settings
2. For the frontend service, you may need to set dependencies
3. Ensure backend starts before frontend

### 7. Database Migration

The backend will automatically run database migrations on startup. The schema will be created when the backend first connects to the PostgreSQL database.

### 8. Health Checks & Monitoring

Railway provides:
- Automatic health checks
- Logs and monitoring
- Auto-scaling (on paid plans)
- Backup management

## Domain Configuration

### Custom Domain (Optional)
1. In Railway dashboard, go to project settings
2. Add your custom domain
3. Railway will provide SSL certificates automatically
4. Update CORS settings if needed

## Environment Variables Reference

### Automatically Provided by Railway
- `DATABASE_URL` - Full PostgreSQL connection string
- `DATABASE_HOST` - Database hostname
- `DATABASE_PORT` - Database port
- `DATABASE_NAME` - Database name
- `DATABASE_USER` - Database username
- `DATABASE_PASSWORD` - Database password

### Required Custom Variables
- `JWT_SECRET` - Secure random string (64+ characters)
- `VITE_API_URL` - Frontend API endpoint URL

## Troubleshooting

### Common Issues

#### Backend Won't Start
- Check Railway logs for database connection errors
- Verify `JWT_SECRET` is set and long enough
- Ensure database is fully provisioned

#### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` is correct
- Check if backend service is running
- Ensure CORS is properly configured

#### Database Connection Issues
- Wait for PostgreSQL to be fully ready (green status)
- Check database credentials in Railway dashboard
- Verify `DB_SSLMODE=require` is set

#### File Upload Issues
- Check storage permissions
- Verify upload directory exists
- Monitor disk usage in Railway dashboard

### Logs & Debugging

```bash
# View service logs in Railway dashboard
# Go to service → "Logs" tab

# Check deployment status
# Go to service → "Deployments" tab
```

### Health Checks

Railway automatically monitors:
- Service health via `/health` endpoint
- Database connectivity
- Response times
- Error rates

## Scaling & Performance

### Railway Plans
- **Hobby**: Free tier with limitations
- **Pro**: Paid tier with more resources
- **Team**: Enterprise features

### Optimization Tips
- Use Railway's built-in CDN for static files
- Monitor memory and CPU usage
- Set up proper logging levels
- Configure auto-scaling rules

## Backup & Recovery

Railway provides:
- Automatic database backups
- Point-in-time recovery
- Data export capabilities
- Service snapshots

## Security Considerations

### Railway Security Features
- Automatic SSL/TLS certificates
- Database encryption at rest
- Network isolation between services
- Regular security updates

### Additional Security Steps
- Use strong `JWT_SECRET`
- Enable Railway's 2FA
- Regularly rotate credentials
- Monitor access logs
- Set up alerts for suspicious activity

## Cost Optimization

### Free Tier Limitations
- 512MB RAM per service
- 1GB disk space
- Limited concurrent connections
- Sleep after inactivity

### Upgrade Considerations
- Monitor usage metrics
- Plan for traffic spikes
- Consider reserved instances for steady load

## Maintenance

### Updates
- Push code changes to GitHub
- Railway auto-deploys on push
- Monitor deployment status
- Rollback if needed

### Monitoring
- Set up Railway alerts
- Monitor error rates
- Track performance metrics
- Review access logs regularly

## Support

- Railway Documentation: https://docs.railway.app/
- Railway Community: https://discord.gg/railway
- GitHub Issues: Report bugs in the project repository

---

## Quick Commands Summary

```bash
# Deploy
railway login
railway init
railway up

# Environment
railway variables set JWT_SECRET=your-secret-here
railway variables set VITE_API_URL=https://your-backend.railway.app

# Logs
railway logs

# Database
railway connect postgres
```

## Success Checklist ✅

- [ ] Railway project created
- [ ] PostgreSQL database added and ready
- [ ] Backend service deployed and healthy
- [ ] Frontend service deployed and accessible
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] File uploads working
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active
- [ ] Monitoring and alerts set up

**🎉 Your Balkan File Management System is now live on Railway!**
