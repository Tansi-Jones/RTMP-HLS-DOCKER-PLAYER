# Use the official Node.js 14 image
FROM node:18-alpine3.19

# Install ffmpeg
RUN apk update && apk add ffmpeg

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

COPY index.html /www/

# Install dependencies
RUN npm install

# Copy the application code to the working directory
COPY . .

# Expose RTMP and HTTP ports
EXPOSE 1935 8000

ENV FFMPEG_PATH='/usr/bin/ffmpeg'

# Run the Node-Media-Server when the container starts
CMD ["node", "app.js"]