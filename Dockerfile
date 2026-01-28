# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use npm install instead of npm ci for flexibility)
RUN npm install --production

# Copy source code
COPY . .

# Build the Vite application
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
COPY healthcheck.js ./
HEALTHCHECK --interval=60s --timeout=10s CMD node healthcheck.js || exit 1

# Start the application
CMD ["npm", "run", "preview", "--", "--port", "3000", "--host", "0.0.0.0"]