#!/bin/bash

echo "Starting deployment..."

cd /srv/apps/dashboard

echo "Pulling latest code..."
git pull origin main

echo "Installing dependencies..."
npm install

echo "Building project..."
npm run build

echo "Deployment completed!"