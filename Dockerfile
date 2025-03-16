# Use the smallest possible Node.js Alpine image
FROM node:18-alpine AS build

# Set NODE_ENV to production
ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/app

# Copy package.json
COPY package.json ./

# Install only production dependencies
RUN npm install --omit=dev --no-package-lock

# Copy app source
COPY . .

# Create final image with minimal footprint
FROM node:18-alpine

# Set NODE_ENV to production
ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/app

# Copy only necessary files from build stage
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/*.js ./

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application with extreme memory optimization
CMD ["node", "--optimize_for_size", "--max_old_space_size=15", "server.js"] 