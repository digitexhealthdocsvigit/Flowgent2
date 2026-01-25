FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

HEALTHCHECK --interval=60s --timeout=10s CMD node healthcheck.js || exit 1

CMD ["node", "agent.js"]
