#!/bin/bash

# Deploy ConfMap reverse proxy worker to Cloudflare
# Prerequisites: Install Wrangler CLI and authenticate

echo "🚀 Deploying ConfMap reverse proxy worker to Cloudflare..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first:"
    echo "npm install -g wrangler"
    echo "wrangler login"
    exit 1
fi

# Deploy the worker
echo "📦 Deploying worker..."
wrangler deploy

if [ $? -eq 0 ]; then
    echo "✅ Worker deployed successfully!"
    echo ""
    echo "🌐 Your reverse proxy is now active:"
    echo "   - confmap.com/ → confql.com/confmap.html"
    echo "   - confmap.com/map → confql.com/map.html"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Configure custom domain in Cloudflare dashboard"
    echo "   2. Set up DNS records for confmap.com"
    echo "   3. Test the URLs"
    echo ""
    echo "📚 See CLOUDFLARE_DEPLOYMENT.md for detailed instructions"
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi
