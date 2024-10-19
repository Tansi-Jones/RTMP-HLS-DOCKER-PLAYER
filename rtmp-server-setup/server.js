const NodeMediaServer = require("node-media-server");
const express = require("express");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffmpeg = require("fluent-ffmpeg");

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 60,
    ping_timeout: 30,
  },
  http: {
    port: 7000,
    allow_origin: "*",
  },
};

const nms = new NodeMediaServer({
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 60,
    ping_timeout: 30,
  },
  http: {
    port: 7000,
    allow_origin: "*",
  },
  trans: {
    ffmpeg: ffmpegInstaller.path,
  },
});
const app = express();

// Serve the static HTML page with the video player
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Use fluent-ffmpeg to transcode the stream for HTTP playback
nms.on("postPublish", (id, StreamPath, args) => {
  const streamKey = StreamPath.split("/").pop();
  const outputUrl = `http://localhost:8000/live/${streamKey}/index.m3u8`;
  console.log("Output: ", outputUrl);
  console.log("Key: ", streamKey);
  console.log("Path: ", StreamPath);

  ffmpeg(`rtmp://localhost:1935${StreamPath}`)
    .videoCodec("libx264")
    .audioCodec("aac")
    .outputFormat("hls")
    .addOption("-hls_time", 4)
    .addOption("-hls_list_size", 10)
    .addOption("-hls_wrap", 10)
    .on("end", () => {
      console.log(`Transcoding finished for stream ${streamKey}`);
    })
    .on("error", (err) => {
      console.error(`Error transcoding stream ${streamKey}: ${err}`);
    })
    .save(`public/live/${streamKey}/index.m3u8`);
});

nms.run();

app.listen(8000, () => {
  console.log(ffmpegInstaller);
  console.log("HTTP server listening on port 8000");
});
