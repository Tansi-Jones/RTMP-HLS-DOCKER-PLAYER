import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import "./player.css";
import Hls from "hls.js";

interface VideoPlayerProps {
  videoSources: string[];
}

const VideoPlayerHLS: React.FC<VideoPlayerProps> = ({ videoSources }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState("HD");
  const [selectedSpeed, setSelectedSpeed] = useState(1);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [repeatMode, setRepeatMode] = useState<"all" | "one" | "off">("off");
  const [isShuffleOn, setIsShuffleOn] = useState(false);

  const getNextIndex = useCallback(
    (currentIndex: number) => {
      return (currentIndex + 1) % videoSources.length;
    },
    [videoSources]
  );

  const getPrevIndex = useCallback(
    (currentIndex: number) => {
      return currentIndex === 0 ? videoSources.length - 1 : currentIndex - 1;
    },
    [videoSources]
  );

  const getRandomIndex = useCallback(() => {
    return Math.floor(Math.random() * videoSources.length);
  }, [videoSources]);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  useLayoutEffect(() => {
    const initializeHls = () => {
      if (videoRef.current) {
        const hls = new Hls();
        hls.loadSource(videoSources[currentVideoIndex]);
        console.log("HLS");
        hls.attachMedia(videoRef.current);
      }
    };

    // Check if the file extension is .m3u8 for HLS
    if (videoSources[currentVideoIndex].endsWith(".m3u8")) {
      if (Hls.isSupported()) {
        initializeHls();
      } else if (
        videoRef.current?.canPlayType("application/vnd.apple.mpegurl")
      ) {
        videoRef.current.src = videoSources[currentVideoIndex];
      }
    } else {
      // Use native HTML5 video player for other formats (e.g., mp4, mp3)
      videoRef.current?.setAttribute("src", videoSources[currentVideoIndex]);
      videoRef.current?.load();
    }
  }, [videoSources, currentVideoIndex]);

  const isMobileDevice = () => {
    return window.screen.width <= 768; // Adjust this threshold based on your design considerations
  };

  const handleOrientationChange = () => {
    if (isMobileDevice()) {
      const isLandscape = window.matchMedia("(orientation: landscape)").matches;
      console.log(isLandscape);

      if (isLandscape) {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
        document.documentElement.style.overflow = "auto";
      }
    }
  };

  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoClick = () => {
    togglePlayPause();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
      setIsPlaying(!isPlaying);
    }
  }, [videoRef, isPlaying]);

  const handleVolumeChange = (value: number) => {
    if (videoRef.current) {
      videoRef.current.volume = value;
      setVolume(value);
    }
  };

  const toggleFullScreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullScreen(false);
        handleOrientationChange(); // Apply styling on exiting fullscreen
      } else {
        videoRef.current.requestFullscreen().then(() => {
          setIsFullScreen(true);
          handleOrientationChange(); // Apply styling on entering fullscreen
        });
      }
    }
  };

  const handleSeekBarChange = (value: number) => {
    if (videoRef.current) {
      const newTime = value * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleQualityChange = (value: string) => {
    // Handle logic for changing video quality
    setSelectedQuality(value);
  };

  const handleSpeedChange = (value: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = value;
      setSelectedSpeed(value);
    }
  };

  const handleNextVideo = useCallback(() => {
    if (videoRef.current) {
      // Pause and reset the video
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);

      // Move to the next video
      setCurrentVideoIndex((prevIndex) => getNextIndex(prevIndex));
    }
  }, [videoRef, setIsPlaying, setCurrentVideoIndex, getNextIndex]);

  const handlePrevVideo = useCallback(() => {
    if (videoRef.current) {
      // Pause and reset the video
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);

      // Move to the previous video
      setCurrentVideoIndex((prevIndex) => getPrevIndex(prevIndex));
    }
  }, [videoRef, setIsPlaying, setCurrentVideoIndex, getPrevIndex]);

  const handleSeekForward = useCallback(() => {
    if (videoRef.current) {
      const newTime = Math.min(
        videoRef.current.currentTime + 30,
        videoRef.current.duration
      );
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [videoRef, setCurrentTime]);

  const handleSeekBackward = useCallback(() => {
    if (videoRef.current) {
      const newTime = Math.max(videoRef.current.currentTime - 30, 0);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [videoRef, setCurrentTime]);

  const toggleRepeatMode = useCallback(() => {
    switch (repeatMode) {
      case "off":
        setRepeatMode("all");
        break;
      case "all":
        setRepeatMode("one");
        break;
      case "one":
        setRepeatMode("off");
        break;
      default:
        break;
    }
  }, [repeatMode, setRepeatMode]);

  const toggleShuffle = useCallback(() => {
    setIsShuffleOn((prevShuffle) => !prevShuffle);
  }, [setIsShuffleOn]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case " ":
          togglePlayPause();
          break;
        case "n":
        case "N":
          handleNextVideo();
          break;
        case "p":
        case "P":
          handlePrevVideo();
          break;
        case "ArrowRight":
          handleSeekForward();
          break;
        case "ArrowLeft":
          handleSeekBackward();
          break;
        case "r":
        case "R":
          toggleRepeatMode();
          break;
        case "s":
        case "S":
          toggleShuffle();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    togglePlayPause,
    handleNextVideo,
    handlePrevVideo,
    handleSeekForward,
    handleSeekBackward,
    toggleRepeatMode,
    toggleShuffle,
  ]);

  useEffect(() => {
    if (videoRef.current) {
      switch (repeatMode) {
        case "off":
          videoRef.current.loop = false;
          break;
        case "all":
          videoRef.current.loop = true;
          break;
        case "one":
          videoRef.current.loop = true;
          break;
        default:
          break;
      }
    }
  }, [repeatMode]);

  useEffect(() => {
    if (isShuffleOn) {
      setCurrentVideoIndex(getRandomIndex());
    }
  }, [isShuffleOn, videoSources, setCurrentVideoIndex, getRandomIndex]);

  // useEffect(() => {
  //   if (videoRef.current) {
  //     videoRef.current.src = videoSources[currentVideoIndex];
  //     videoRef.current.load();
  //     setIsPlaying(true);
  //   }
  // }, [currentVideoIndex, videoSources]);

  const getRepeatModeLabel = () => {
    switch (repeatMode) {
      case "off":
        return "Repeat Off";
      case "all":
        return "Repeat All";
      case "one":
        return "Repeat One";
      default:
        return "";
    }
  };

  return (
    <div>
      <video
        ref={videoRef}
        src={videoSources[currentVideoIndex]}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onClick={handleVideoClick}
      />
      <div className={`controls ${isFullScreen ? "fullscreen" : ""}`}>
        <button onClick={togglePlayPause}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
        />
        <button onClick={toggleFullScreen}>
          {isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
        <button onClick={handlePrevVideo}>Prev</button>
        <button onClick={handleNextVideo}>Next</button>
        <button onClick={handleSeekBackward}>-30s</button>
        <button onClick={handleSeekForward}>+30s</button>
        <button onClick={toggleRepeatMode}>{getRepeatModeLabel()}</button>
        <button onClick={toggleShuffle}>
          {isShuffleOn ? "Shuffle On" : "Shuffle Off"}
        </button>
      </div>
      <div className="timeline">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={currentTime / duration || 0}
          onChange={(e) => handleSeekBarChange(parseFloat(e.target.value))}
        />
        <div className="track" />
      </div>
      <div className="settings">
        <label>Quality:</label>
        <select
          value={selectedQuality}
          onChange={(e) => handleQualityChange(e.target.value)}
        >
          {qualityOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label>Speed:</label>
        <select
          value={selectedSpeed}
          onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
        >
          {speedOptions.map((option) => (
            <option key={option} value={option}>
              {option}x
            </option>
          ))}
        </select>

        <div>Formated Time: {formatTime(currentTime)}</div>
      </div>
    </div>
  );
};

const qualityOptions = ["HD", "SD", "1080p", "720p"];
const speedOptions = [0.5, 1, 1.5, 2];

export default VideoPlayerHLS;
