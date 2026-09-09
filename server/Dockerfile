FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy server source code
COPY . .

# Copy client files
COPY ../client ../client

# Expose port
EXPOSE 5000

# Start command
CMD ["node", "server.js"]
