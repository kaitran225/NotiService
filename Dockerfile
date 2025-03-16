FROM node:18-alpine

# Force production mode
ENV NODE_ENV=production

# Create app directory
WORKDIR /app

# Copy only the single file and package.json
COPY package.json noti-service.js ./

# Install production dependencies only
RUN npm install --production --no-package-lock && \
    npm cache clean --force

# Expose the port
EXPOSE 3000

# Run with minimal memory
CMD ["node", "--optimize_for_size", "--max_old_space_size=10", "noti-service.js"] 