# Use the official lightweight Node.js 20 image
FROM node:20-slim

# Create and change to the app directory
WORKDIR /usr/src/app

# Production mode: Express hides stack traces in error responses
ENV NODE_ENV=production

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy local code to the container image.
COPY . .

# Run the web service on container startup.
CMD [ "npm", "start" ]
