#!/bin/bash

# Netlify Environment Variables Setup Script
# This script automates setting environment variables for the Netlify deployment

echo "🚀 Setting up Netlify environment variables..."

# Load environment variables from .env file
if [ ! -f .env ]; then
  echo "❌ Error: .env file not found!"
  exit 1
fi

# Extract values from .env (excluding comments and empty lines)
VITE_SUPABASE_URL=$(grep "^VITE_SUPABASE_URL=" .env | cut -d '=' -f2-)
VITE_SUPABASE_ANON_KEY=$(grep "^VITE_SUPABASE_ANON_KEY=" .env | cut -d '=' -f2-)
VITE_WEB3FORMS_ACCESS_KEY=$(grep "^VITE_WEB3FORMS_ACCESS_KEY=" .env | cut -d '=' -f2-)

echo "📋 Environment variables to be set:"
echo "  - VITE_SUPABASE_URL: ${VITE_SUPABASE_URL:0:30}..."
echo "  - VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY:0:30}..."
echo "  - VITE_WEB3FORMS_ACCESS_KEY: ${VITE_WEB3FORMS_ACCESS_KEY:0:30}..."

# Set environment variables using Netlify CLI
echo ""
echo "🔧 Setting VITE_SUPABASE_URL..."
npx netlify-cli env:set VITE_SUPABASE_URL "$VITE_SUPABASE_URL"

echo "🔧 Setting VITE_SUPABASE_ANON_KEY..."
npx netlify-cli env:set VITE_SUPABASE_ANON_KEY "$VITE_SUPABASE_ANON_KEY"

echo "🔧 Setting VITE_WEB3FORMS_ACCESS_KEY..."
npx netlify-cli env:set VITE_WEB3FORMS_ACCESS_KEY "$VITE_WEB3FORMS_ACCESS_KEY"

echo ""
echo "✅ Environment variables configured successfully!"
echo ""
echo "📦 To deploy with the new environment variables, run:"
echo "   npx netlify-cli deploy --prod"
echo ""
echo "Or trigger a rebuild in the Netlify dashboard."
