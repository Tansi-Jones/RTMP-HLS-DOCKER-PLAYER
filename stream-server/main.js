import express from "express";
import NodeMediaServer from "node-media-server";
// import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
// import ffmpeg from "fluent-ffmpeg";

const app = express();

// Set FFmpeg path
// ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const nms = new NodeMediaServer({
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 10,
    ping_timeout: 60,
  },
  http: {
    port: 8000,
    mediaroot: "./media",
    allow_origin: "*",
  },
  trans: {
    ffmpeg: "./ffmpeg",
    tasks: [
      {
        app: "live",
        hls: true,
        hlsFlags: "[hls_time=2:hls_list_size=3:hls_flags=delete_segments]",
        hlsKeep: false,
      },
    ],
  },
  fission: {
    ffmpeg: "./ffmpeg",
    tasks: [
      {
        rule: "media/*",
        model: [
          {
            ab: "128k",
            vb: "1500k",
            vs: "1280x720",
            vf: "30",
          },
          {
            ab: "96k",
            vb: "1000k",
            vs: "854x480",
            vf: "24",
          },
          {
            ab: "96k",
            vb: "600k",
            vs: "640x360",
            vf: "20",
          },
        ],
      },
      {
        rule: "media/*",
        model: [
          {
            ab: "128k",
            vb: "1500k",
            vs: "720x1280",
            vf: "30",
          },
          {
            ab: "96k",
            vb: "1000k",
            vs: "480x854",
            vf: "24",
          },
          {
            ab: "64k",
            vb: "600k",
            vs: "360x640",
            vf: "20",
          },
        ],
      },
    ],
  },
});

nms.on("preConnect", (id, args) => {
  console.log(
    "[NodeEvent on preConnect]",
    `id=${id} args=${JSON.stringify(args)}`
  );
  // let session = nms.getSession(id);
  // session.reject();
});

nms.on("postConnect", (id, args) => {
  console.log(
    "[NodeEvent on postConnect]",
    `id=${id} args=${JSON.stringify(args)}`
  );
});

nms.on("doneConnect", (id, args) => {
  console.log(
    "[NodeEvent on doneConnect]",
    `id=${id} args=${JSON.stringify(args)}`
  );
});

nms.on("prePublish", (id, StreamPath, args) => {
  console.log(
    "[NodeEvent on prePublish]",
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );
  // Implement authentication for your streamers...
  // let session = nms.getSession(id);
  // session.reject();
});

nms.on("postPublish", (id, StreamPath, args) => {
  console.log(
    "[NodeEvent on postPublish]",
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );

  //   const streamKey = StreamPath.split("/").pop();
  //   const outputUrl = `http://localhost:8000/live/${streamKey}/index.m3u8`;
  //   console.log("Output: ", outputUrl);
  //   console.log("Key: ", streamKey);
  //   console.log("Path: ", StreamPath);

  //   ffmpeg(`rtmp://localhost:1935${StreamPath}`)
  //     .videoCodec("libx264")
  //     .audioCodec("aac")
  //     .outputFormat("hls")
  //     .addOption("-hls_time", 4)
  //     .addOption("-hls_list_size", 10)
  //     .addOption("-hls_wrap", 10)
  //     .on("end", () => {
  //       console.log(`Transcoding finished for stream ${streamKey}`);
  //     })
  //     .on("error", (err) => {
  //       console.error(`Error transcoding stream ${streamKey}: ${err}`);
  //     })
  //     .save(`public/live/${streamKey}/index.m3u8`);
});

// Reroute to new endpoint
// app.get("/tansi-live", (req, res) => {
//   const streamKey = "week"; // This corresponds to your live stream
//   const outputUrl = `http://localhost:8000/live/${streamKey}/index.m3u8`;

//   console.log("Output: ", outputUrl);

//   res.redirect(outputUrl); // Redirect to the actual stream URL
// });

nms.on("donePublish", (id, StreamPath, args) => {
  console.log(
    "[NodeEvent on donePublish]",
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );
});

nms.on("prePlay", (id, StreamPath, args) => {
  console.log(
    "[NodeEvent on prePlay]",
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );
  // let session = nms.getSession(id);
  // session.reject();
});

nms.on("postPlay", (id, StreamPath, args) => {
  console.log(
    "[NodeEvent on postPlay]",
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );
});

nms.on("donePlay", (id, StreamPath, args) => {
  console.log(
    "[NodeEvent on donePlay]",
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );
});

// Use run method to start our media server.
nms.run();

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
