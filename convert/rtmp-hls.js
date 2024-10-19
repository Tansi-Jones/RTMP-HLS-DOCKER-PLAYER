const express = require("express");
const { NodeMediaServer } = require("node-media-server");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

const app = express();
const server = http.createServer(app);

// Configure the RTMP server
const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 60,
    ping_timeout: 30,
  },
  http: {
    port: 8000,
    allow_origin: "*",
  },
};

const nms = new NodeMediaServer(config);
nms.run();

// Serve the HLS files using Express
const hlsDir = path.join(__dirname, "hls");
app.use("/hls", express.static(hlsDir));

// Handle RTMP stream and convert to HLS
nms.on("postPublish", (id, StreamPath) => {
  const hlsStreamKey = StreamPath.split("/").pop();
  const hlsStreamPath = `/hls/${hlsStreamKey}.m3u8`;
  const hlsFilePath = path.join(hlsDir, `${hlsStreamKey}.m3u8`);

  // Ensure the HLS directory exists
  if (!fs.existsSync(hlsDir)) {
    fs.mkdirSync(hlsDir);
  }

  // Create HLS playlist
  fs.writeFileSync(
    hlsFilePath,
    `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360\n${hlsStreamKey}.m3u8`
  );

  // Use fluent-ffmpeg for HLS conversion
  const rtmpUrl = `rtmp://localhost:1935${StreamPath}`;
  ffmpeg(rtmpUrl)
    .inputOptions(["-c:v libx264", "-c:a aac", "-strict experimental"])
    .output(path.join(hlsDir, `${hlsStreamKey}.m3u8`))
    .on("end", () => {
      console.log("HLS conversion finished");
    })
    .on("error", (err) => {
      console.error("Error during HLS conversion:", err);
    })
    .run();
});

// Start the Express server
const port = 3000;
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
