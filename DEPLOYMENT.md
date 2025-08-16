# 🚀 ConfQL-Map Deployment Guide

## 📋 Quick Start Options

### **Option 1: Netlify (Recommended for now)**
**Best for:** Quick deployment, free hosting, static sites
**Time:** 5 minutes
**Cost:** Free tier available

### **Option 2: DigitalOcean (Future-ready)**
**Best for:** Full control, custom domain, future backend features
**Time:** 15 minutes
**Cost:** $5-10/month

---

## 🚀 Option 1: Deploy to Netlify

### **Step 1: Push to GitHub**
```bash
git add .
git commit -m "Add deployment files"
git push origin main
```

### **Step 2: Connect to Netlify**
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Select the `confql-map` repository
5. Deploy settings:
   - **Build command:** (leave empty)
   - **Publish directory:** `.` (root)
6. Click "Deploy site"

### **Step 3: Custom Domain**
1. In Netlify dashboard → Site settings → Domain management
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate is automatic

**✅ Done! Your app is live on Netlify**

---

## 🐳 Option 2: Deploy to DigitalOcean

### **Prerequisites**
- DigitalOcean account
- Droplet with Docker installed
- Domain name (optional but recommended)

### **Step 1: Create DigitalOcean Droplet**
1. Create new droplet
2. Choose Ubuntu 22.04 LTS
3. Basic plan ($5/month is sufficient)
4. Add SSH key for secure access

### **Step 2: Connect to Your Server**
```bash
ssh root@YOUR_SERVER_IP
```

### **Step 3: Install Docker & Docker Compose**
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Add user to docker group
usermod -aG docker $USER
```

### **Step 4: Deploy Your App**
```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/confql-map.git
cd confql-map

# Deploy
./deploy.sh
```

### **Step 5: Configure Domain & SSL**
```bash
# Install Certbot for SSL
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d yourdomain.com

# Restart nginx
docker-compose restart
```

**✅ Done! Your app is live on DigitalOcean**

---

## 🔧 Configuration Options

### **Environment Variables**
Create `.env` file for custom settings:
```bash
NODE_ENV=production
PORT=80
DOMAIN=yourdomain.com
```

### **Custom Ports**
Edit `docker-compose.yml`:
```yaml
ports:
  - "3000:80"  # External:Internal
```

### **SSL with Let's Encrypt**
```bash
# Auto-renewal
crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 Monitoring & Maintenance

### **View Logs**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f confql-map
```

### **Update Application**
```bash
git pull origin main
./deploy.sh
```

### **Health Check**
```bash
curl http://localhost/health
# Should return: "healthy"
```

---

## 🚨 Troubleshooting

### **Port Already in Use**
```bash
# Check what's using port 80
netstat -tulpn | grep :80

# Kill process or change port in docker-compose.yml
```

### **Permission Denied**
```bash
# Fix file permissions
chmod +x deploy.sh
chown -R $USER:$USER .
```

### **Docker Build Fails**
```bash
# Clean Docker cache
docker system prune -a
docker-compose build --no-cache
```

---

## 🔒 Security Checklist

- [ ] Firewall configured (UFW)
- [ ] SSH key authentication only
- [ ] Regular security updates
- [ ] SSL certificate installed
- [ ] Monitoring set up
- [ ] Backups configured

---

## 💰 Cost Comparison

| Platform | Cost | Features | Best For |
|----------|------|----------|----------|
| **Netlify** | Free tier | Static hosting, CDN, SSL | Quick launch, MVP |
| **DigitalOcean** | $5-10/month | Full control, custom domain | Production, scaling |

---

## 🎯 Next Steps

1. **Choose your deployment option**
2. **Deploy following the guide above**
3. **Test your application**
4. **Configure custom domain**
5. **Set up monitoring**

**Need help?** Check the troubleshooting section or create an issue in the repository!
