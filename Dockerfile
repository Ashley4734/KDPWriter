# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev deps for build)
RUN npm ci

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Build the production server separately
RUN npx esbuild server/production.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/server.js

# Remove dev dependencies after build
RUN npm ci --only=production && npm cache clean --force

# Expose port 5000
EXPOSE 5000

# Start the application using production server
CMD ["node", "dist/server.js"]