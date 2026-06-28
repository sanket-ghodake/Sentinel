FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /workspace/sentinel/ui

# Copy package configurations
COPY ui/package*.json ./

# Install dependencies
RUN npm install

# Copy source code (optional if mounting, but good for build reproducibility)
COPY ui/ ./

# Expose Vite development server port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host"]
