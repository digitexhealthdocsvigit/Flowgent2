# Use Node.js 18 on Alpine Linux (lightweight, secure, fast)
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (optimization for layer caching)
COPY package*.json ./

# Install only production dependencies (no dev tools)
RUN npm install --production

# Copy all application files
COPY . .

# Start the Agent Zero service
CMD ["node", "agent.js"]
