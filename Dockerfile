FROM node:20-alpine

WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/

# Install server dependencies
WORKDIR /app/server
RUN npm install --production

# Copy all source code
WORKDIR /app
COPY server ./server
COPY client ./client

# Expose port
EXPOSE 5000

# Start command
WORKDIR /app/server
CMD ["node", "server.js"]
