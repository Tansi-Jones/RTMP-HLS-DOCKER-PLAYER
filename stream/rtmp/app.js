const NodeMediaServer = require("node-media-server");
require("dotenv").config();

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8000,
    mediaroot: "media",
    allow_origin: "*",
  },
  trans: {
    ffmpeg: process.env.FFMPEG_PATH,
    tasks: [
      // Transcoding for multiple resolutions
      {
        app: "live",
        hls: true,
        hlsFlags: "[hls_time=2:hls_list_size=3:hls_flags=delete_segments]",
        hlsKeep: false,
        dash: true,
        dashFlags: "[f=dash:window_size=3:extra_window_size=5]",
        dashKeep: false,
        // Task for 240p
        transcode: [
          {
            name: "240p",
            // Example settings; adjust bitrate/resolution as needed
            vcodec: "libx264",
            video_bitrate: "300k",
            width: 426,
            height: 240,
            fps: 30,
            preset: "fast",
          },
          // Task for 360p
          {
            name: "360p",
            vcodec: "libx264",
            video_bitrate: "600k",
            width: 640,
            height: 360,
            fps: 30,
            preset: "fast",
          },
          // Task for 720p
          {
            name: "720p",
            vcodec: "libx264",
            video_bitrate: "1500k",
            width: 1280,
            height: 720,
            fps: 30,
            preset: "medium",
          },
          // Task for 1080p
          {
            name: "1080p",
            vcodec: "libx264",
            video_bitrate: "3000k",
            width: 1920,
            height: 1080,
            fps: 30,
            preset: "slow",
          },
          // Task for 2K
          {
            name: "2k",
            vcodec: "libx264",
            video_bitrate: "6000k",
            width: 2560,
            height: 1440,
            fps: 30,
            preset: "slower",
          },
        ],
      },
    ],
  },
};

var nms = new NodeMediaServer(config);
nms.run();
