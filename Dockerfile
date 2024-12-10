# Use Node.js v20 as the base image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app listens on
EXPOSE 3000

# Command to run the app (use 'npm run serve' if applicable)
CMD ["npm", "run", "serve"]