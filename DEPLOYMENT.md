# Deployment Guide for ConfMap

This guide provides instructions for deploying the ConfMap application to two popular platforms: Netlify (for simple static hosting) and DigitalOcean (using Docker for more control).

---

## Option 1: Deploying to Netlify

Netlify is the easiest way to deploy a frontend application. It's perfect for static sites and handles the build process for you.

### Prerequisites
- A Netlify account (free tier is sufficient).
- Your project pushed to a GitHub, GitLab, or Bitbucket repository.

### Steps
1.  **Log in to Netlify** and go to your dashboard.
2.  Click **"Add new site"** and select **"Import an existing project"**.
3.  **Connect to your Git provider** (e.g., GitHub) and authorize Netlify.
4.  **Choose your repository** for the ConfMap project.
5.  **Configure Build Settings**:
    - **Branch to deploy**: `main` (or your primary branch).
    - **Build command**: `npm run build:prod`
    - **Publish directory**: `dist`
6.  Click **"Deploy site"**. Netlify will automatically build and deploy your application.

Your site will be live in a few minutes!

---

## Option 2: Deploying to DigitalOcean with Docker

This method provides more flexibility and is suitable for a production environment where you want more control over the server.

### Prerequisites
- A DigitalOcean account.
- A Droplet (server) created with Docker pre-installed. You can use the "Docker on Ubuntu" one-click app from the DigitalOcean Marketplace.
- Docker and Docker Compose installed on your local machine.
- Your project pushed to a Git repository.

### Steps

#### 1. SSH into Your Droplet
First, connect to your DigitalOcean Droplet:
```sh
ssh root@<your_droplet_ip>
```

#### 2. Clone Your Repository
Clone your project onto the Droplet:
```sh
git clone <your_repository_url>
cd confmap-repo-name # Change to your repo name
```

#### 3. Run the Deployment Script
The `deploy.sh` script automates the entire process. Make it executable and run it:
```sh
chmod +x deploy.sh
./deploy.sh
```

The script will:
- Build the Docker image using `docker-compose`.
- Start the Nginx service in a container.
- Perform a health check to ensure the application is running.

#### 4. Access Your Application
Once the script finishes, you can access your ConfMap application by navigating to `http://<your_droplet_ip>` in your web browser.

### Managing the Application
- **To stop the application**: `docker-compose down`
- **To view logs**: `docker-compose logs -f`
- **To restart**: `docker-compose restart`

---

Congratulations! You've successfully deployed ConfMap.
