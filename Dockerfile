# Use the official Node.js image as a parent image
FROM node:22

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies and build the project
RUN npm install

# Copy the rest of the project files
COPY . .
RUN npm run build

# Expose the port the app runs on
EXPOSE 443

# Define the command to run the app
CMD ["npm", "start"]
