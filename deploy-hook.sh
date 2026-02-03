#!/bin/bash
# Deploy script for btp-tracker via GitHub
# This script commits and pushes changes to trigger automatic Vercel deployment

set -e

REPO_DIR="/home/stefano/clawd/btp-tracker"
COMMIT_MESSAGE="$1"

# Default commit message if none provided
if [ -z "$COMMIT_MESSAGE" ]; then
  COMMIT_MESSAGE="chore: trigger deploy $(date +%Y-%m-%d\ %H:%M:%S)"
fi

cd "$REPO_DIR"

echo "📦 Preparing deployment..."
echo "📝 Commit message: $COMMIT_MESSAGE"

# Stage all changes
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
  echo "✅ No changes to deploy"
  exit 0
fi

# Commit and push
git commit -m "$COMMIT_MESSAGE"
git push origin main

echo "🚀 Deployment triggered! Check Vercel dashboard for progress."
echo "🌐 Your site will be live at: https://btp-tracker.vercel.app"
