#!/bin/bash

# Deployment script for My Health Companion
set -e

echo "Starting deployment..."

# Setup SSH and clone repo
mkdir -p ~/.ssh
ssh-keyscan github.com >> ~/.ssh/known_hosts
ssh -T git@github.com || true

if [ ! -d "/root/my-health-companion" ]; then
  git clone git@github.com:salluzziluca/my-health-companion.git /root/my-health-companion
fi

cd /root/my-health-companion

# Fetch latest changes
git fetch origin

# Checkout and reset to remote branch (handles conflicts)
git checkout rama_cd
git reset --hard origin/rama_cd

# Clean up any existing containers and volumes
echo "Cleaning up existing containers..."
docker compose down -v || true

# Build and start services
echo "Building and starting services..."
docker compose up -d --build

echo "Deployment completed!" 