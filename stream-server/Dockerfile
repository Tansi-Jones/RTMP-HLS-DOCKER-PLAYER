FROM node:14-alpine

# RUN ["node","main.js"]

# Setting working directory
WORKDIR /app

# Copying package.json and package-lock.json
COPY package*.json ./

COPY main.js ./

# Copying nginx.conf
COPY nginx.conf  /etc/nginx/nginx.conf

# Installing dependencies
RUN npm install

# Install FFmpeg. This is needed to convert the video to HLS
RUN apk add --no-cache ffmpeg

# /usr/bin/ffmpeg is the default path for ffmpeg, copy it to /app
RUN cp /usr/bin/ffmpeg ./

# Exposing ports
EXPOSE 8000
EXPOSE 1935
EXPOSE 3000

# Running the app
CMD ["node", "main.js"]