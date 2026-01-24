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

# Add health check (Railway auto-restarts if this fails)
HEALTHCHECK --interval=60s --timeout=10s \
  CMD node healthcheck.js || exit 1

# Start the Agent Zero service
CMD ["node", "agent.js"]
```

---

## 🎯 WHAT EACH LINE DOES

Let me explain the Dockerfile line by line:

### **Line 1: `FROM node:18-alpine`**
- **What it does:** Downloads a pre-built Node.js 18 environment
- **Why Alpine:** Smallest size (5MB vs 900MB), most secure, fastest builds
- **Result:** Gives you a clean Linux server with Node.js ready to run

### **Line 2: `WORKDIR /app`**
- **What it does:** Creates and moves into `/app` folder inside container
- **Why:** Keeps your code organized, prevents conflicts with system files
- **Result:** All subsequent commands run from `/app` directory

### **Line 3: `COPY package*.json ./`**
- **What it does:** Copies `package.json` and `package-lock.json` to container
- **Why separate:** If you change code but not dependencies, Docker reuses this layer (saves time)
- **Result:** Docker knows what npm packages to install

### **Line 4: `RUN npm install --production`**
- **What it does:** Installs your dependencies (@supabase/supabase-js, dotenv, node-fetch)
- **Why `--production`:** Skips dev tools, reduces size by 60-70%
- **Result:** All required libraries installed in `/app/node_modules`

### **Line 5: `COPY . .`**
- **What it does:** Copies all remaining files (agent.js, healthcheck.js, etc.)
- **Why after npm install:** Changes to code don't force re-install of all packages
- **Result:** Your application code is now in the container

### **Line 6-7: `HEALTHCHECK`**
- **What it does:** Runs `healthcheck.js` every 60 seconds
- **Why:** If Agent Zero crashes or loses database connection, Railway auto-restarts
- **Result:** Self-healing system that recovers from failures automatically

### **Line 8: `CMD ["node", "agent.js"]`**
- **What it does:** Starts your Agent Zero service
- **Why array syntax:** More reliable, handles signals properly, cleaner logs
- **Result:** Agent Zero begins polling InsForge every 5 minutes

---
