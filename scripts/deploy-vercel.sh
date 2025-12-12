#!/bin/bash

# Vercel deployment script with environment variables

echo "🚀 Deploying to Vercel with environment variables..."

# Environment variables'ları Vercel'e ekle
echo "📝 Setting up environment variables..."

vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://cpeabuvpwftdejqxvsls.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZWFidXZwd2Z0ZGVqcXh2c2xzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjAxMzYsImV4cCI6MjA4MDgzNjEzNn0.1eHCTMTT9Xy6sWP0ygf0SSD0BXv0Ab8O_RsPGTcqnSM"
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZWFidXZwd2Z0ZGVqcXh2c2xzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjAxMzYsImV4cCI6MjA4MDgzNjEzNn0.1eHCTMTT9Xy6sWP0ygf0SSD0BXv0Ab8O_RsPGTcqnSM"
vercel env add NEXTAUTH_SECRET production <<< "semacelik-production-secret-key-2024-secure"
vercel env add NEXTAUTH_URL production <<< "https://semacelik.com"
vercel env add RATE_LIMIT_MAX_REQUESTS production <<< "50"
vercel env add RATE_LIMIT_WINDOW_MS production <<< "900000"
vercel env add ALLOWED_ORIGINS production <<< "https://semacelik.com,https://www.semacelik.com"
vercel env add NODE_ENV production <<< "production"

echo "✅ Environment variables set!"

# Deploy
echo "🚀 Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your site should be live at: https://semacelik.com"