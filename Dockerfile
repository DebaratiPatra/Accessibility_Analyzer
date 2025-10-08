# Use an official Node.js image with Debian (so Puppeteer + Lighthouse can work)
FROM node:18-bullseye

# Set working directory
WORKDIR /app

# Copy backend files only
COPY backend ./backend

# Go to backend directory
WORKDIR /app/backend

# Install dependencies
RUN npm install

# Expose port 5000
EXPOSE 5000

# Start the backend
CMD ["npm", "start"]
