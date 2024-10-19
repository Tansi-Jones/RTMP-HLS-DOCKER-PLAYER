// import Promo from "./assets/promo.mp4";
import "./App.css";

import VideoPlayerHLS from "./components/hlsvide";

function App() {
  return (
    <>
      <div>
        <h1>Custom Video Player</h1>

        <VideoPlayerHLS
          videoSources={[
            "https://res.cloudinary.com/dqw0lwkil/video/upload/v1671203198/Messages/Sequels/The_Power_and_Pursuit_of_Purpose_Part_1_m3snjl.mp4",
            "http://localhost:8080/hls/abdi.m3u8",
          ]}
        />
      </div>
    </>
  );
}

export default App;
