# Use the official Node.js image as a parent image
FROM node:22

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install copyfiles globally
RUN npm install -g copyfiles

# Install typescript globally
RUN npm install -g typescript

# Install dependencies and build the project
RUN npm install && npm run build

# Copy the rest of the project files
COPY . .

# Expose the port the app runs on
EXPOSE 443

# Define the command to run the app
CMD ["npm", "start"]
