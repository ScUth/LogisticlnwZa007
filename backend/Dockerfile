# Production image for Node.js backend
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies (only production)
COPY package*.json ./
ENV NODE_ENV=production
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose backend port
EXPOSE 4826

# Start the backend in production mode
CMD ["npm", "start"]
