const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");

let keys = ["supersecret", "tansi", "jones1234"];

app.use(express.urlencoded({ extended: true }));

app.post("/auth", function (req, res) {
  /* This server is only available to nginx */
  const streamkey = req.body.name;
  console.log("Stream key: ", streamkey);

  /* You can make a database of users instead :) */
  if (keys.includes(streamkey)) {
    console.log("Stream key accepted: ", streamkey);
    res.status(200).send();
    return;
  }

  /* Reject the stream */
  res.status(403).send();
});

// app.get('/stream/:token', (req, res) => {
//   const { token } = req.params;
//   if (tokens.has(token)) {
//       const streamUrl = `http://localhost/hls/your_stream_key.m3u8?token=${token}`; // Replace 'your_stream_key' with actual logic
//       res.status(200).json({ streamUrl });
//   } else {
//       res.status(403).send("Forbidden");
//   }
// });

app.post("/cleanup", (req, res) => {
  const { name } = req.body; // Assume you pass the stream name
  console.log(`Stream ${name} has ended.`);

  // Perform cleanup tasks
  const hlsPath = path.join("/tmp/IVS", name);
  fs.rmdir(hlsPath, { recursive: true }, (err) => {
    if (err) {
      console.error(`Failed to delete HLS data for stream ${name}:`, err);
      return res.status(500).send("Internal Server Error");
    }
    console.log(`Deleted HLS data for stream ${name}`);
    res.status(200).send("OK");
  });
});

app.listen(8000, function () {
  console.log("Listening on port 8000!");
});
