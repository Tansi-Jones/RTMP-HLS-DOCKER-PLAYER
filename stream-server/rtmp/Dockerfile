FROM tiangolo/nginx-rtmp

COPY nginx.conf /etc/nginx/nginx.conf

COPY index.html /www/

# Create the directory for HLS files
RUN mkdir -p /var/www/videos/hls

# Set the correct permissions for the video directory
RUN chmod -R 755 /var/www/videos