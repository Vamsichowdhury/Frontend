# Video Player - System Design Overview

**Level:** Medium-Hard  
**Time to Solve:** 60-75 minutes  
**Tech Stack:** React + HTML5 Video API  

---

## Problem Statement

Build a video player with:
- Play/pause/stop controls
- Seek bar (click to jump, drag to scrub)
- Volume control + mute toggle
- Fullscreen mode
- Playback speed control (0.5x, 1x, 1.5x, 2x)
- Quality selection (360p, 720p, 1080p)
- Buffering indicator
- Keyboard shortcuts
- Picture-in-picture support

---

## Real-World Examples

- YouTube player
- Netflix viewer
- Vimeo player
- Twitch live player
- Disney+ viewer

---

## What This Tests

| Skill | Why It Matters |
|-------|---------------|
| HTML5 Video API | Core browser video interface |
| useRef for DOM interaction | Direct video element control |
| Time-based state | Current time, duration, buffered |
| Event handling | Video events (play, pause, timeupdate) |
| Custom UI over native controls | Build from scratch |
| Streaming concepts | HLS, DASH, buffering |

---

## What You'll Learn

- HTML5 `<video>` element API (play, pause, seek, volume)
- `useRef` to imperatively control DOM elements
- Video events: `timeupdate`, `loadedmetadata`, `waiting`, `canplay`
- Progress bar with seek and buffer visualization
- `requestAnimationFrame` for smooth progress updates
- Keyboard event handling for player shortcuts
- HLS (HTTP Live Streaming) and adaptive bitrate concept
- Fullscreen API

---

## High-Level Architecture

```
<VideoPlayer src={videoUrl} />
├── <VideoElement ref={videoRef} />   (hidden native controls)
└── <CustomControls />
    ├── <ProgressBar />
    │   ├── BufferTrack     (grey — buffered range)
    │   └── PlayheadTrack   (red — current time)
    ├── <ControlsRow>
    │   ├── <PlayPauseButton />
    │   ├── <VolumeControl />
    │   │   ├── <MuteButton />
    │   │   └── <VolumeSlider />
    │   ├── <TimeDisplay />    ("2:34 / 10:00")
    │   ├── <SpeedSelector />  (1x, 1.5x, 2x)
    │   ├── <QualitySelector />
    │   └── <FullscreenButton />
    └── <BufferingOverlay />    (spinner when buffering)
```

---

## Data Structure

```javascript
// Player state
const [playing, setPlaying] = useState(false);
const [currentTime, setCurrentTime] = useState(0);
const [duration, setDuration] = useState(0);
const [volume, setVolume] = useState(1);       // 0 to 1
const [muted, setMuted] = useState(false);
const [buffering, setBuffering] = useState(false);
const [playbackSpeed, setPlaybackSpeed] = useState(1);
const [quality, setQuality] = useState("720p");
const [isFullscreen, setIsFullscreen] = useState(false);
const [buffered, setBuffered] = useState(0);   // % of video buffered

const videoRef = useRef(null); // direct access to <video> element

// Controls auto-hide
const [controlsVisible, setControlsVisible] = useState(true);
const hideControlsTimer = useRef(null);
```

---

## Data Flow

```
Video loads:
  → attach event listeners to video element
  → onLoadedMetadata → setDuration(video.duration)
  → onTimeUpdate → setCurrentTime(video.currentTime)
  → onWaiting → setBuffering(true)
  → onCanPlay → setBuffering(false)

User clicks Play:
  → videoRef.current.play()
  → video fires "play" event
  → setPlaying(true)

User clicks Pause:
  → videoRef.current.pause()
  → setPlaying(false)

User seeks on progress bar:
  → calculate time = (clickX / barWidth) * duration
  → videoRef.current.currentTime = time
  → setCurrentTime(time)

User changes volume:
  → videoRef.current.volume = newVolume
  → setVolume(newVolume)

User changes playback speed:
  → videoRef.current.playbackRate = speed
  → setPlaybackSpeed(speed)

User presses fullscreen:
  → playerRef.current.requestFullscreen()
  → listen to fullscreenchange event

Keyboard shortcuts:
  → Space: toggle play/pause
  → Left/Right Arrow: seek ±5 seconds
  → Up/Down Arrow: volume ±10%
  → F: fullscreen toggle
  → M: mute toggle
```

---

## Key Concepts to Learn

### 1. useRef for Video Control
```javascript
const videoRef = useRef(null);

// Direct imperative control — NOT state
const togglePlay = () => {
  if (videoRef.current.paused) {
    videoRef.current.play();
  } else {
    videoRef.current.pause();
  }
};
```

### 2. Video Event Listeners
```javascript
useEffect(() => {
  const video = videoRef.current;

  const onTimeUpdate = () => setCurrentTime(video.currentTime);
  const onLoadedMetadata = () => setDuration(video.duration);
  const onWaiting = () => setBuffering(true);
  const onCanPlay = () => setBuffering(false);
  const onPlay = () => setPlaying(true);
  const onPause = () => setPlaying(false);

  video.addEventListener("timeupdate", onTimeUpdate);
  video.addEventListener("loadedmetadata", onLoadedMetadata);
  video.addEventListener("waiting", onWaiting);
  video.addEventListener("canplay", onCanPlay);
  video.addEventListener("play", onPlay);
  video.addEventListener("pause", onPause);

  return () => {
    video.removeEventListener("timeupdate", onTimeUpdate);
    // ...remove all
  };
}, []);
```

### 3. Progress Bar with Seek
```jsx
const handleProgressClick = (e) => {
  const bar = e.currentTarget;
  const rect = bar.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const percent = clickX / rect.width;
  const seekTime = percent * duration;
  videoRef.current.currentTime = seekTime;
};

// Progress bar render
<div className="progress-bar" onClick={handleProgressClick}>
  <div style={{ width: `${(buffered / duration) * 100}%` }} className="buffer" />
  <div style={{ width: `${(currentTime / duration) * 100}%` }} className="playhead" />
</div>
```

### 4. Format Time Display
```javascript
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
// "2:34"
```

### 5. Adaptive Bitrate (HLS) Concept
```javascript
// Real streaming uses HLS via hls.js library
import Hls from "hls.js";

if (Hls.isSupported()) {
  const hls = new Hls();
  hls.loadSource("https://example.com/video.m3u8"); // HLS manifest
  hls.attachMedia(videoRef.current);
}
```

---

## Implementation Phases

### Phase 1 — Basic Player
- Video element with src
- Play/pause button
- Current time / duration display

### Phase 2 — Progress Bar
- Time display ("2:34 / 10:00")
- Clickable seek bar
- Buffer visualization

### Phase 3 — Volume Control
- Volume slider (0-100%)
- Mute toggle
- Volume keyboard shortcuts

### Phase 4 — Advanced Controls
- Playback speed selector
- Fullscreen toggle
- Auto-hide controls on mouse idle

### Phase 5 — Streaming (Conceptual)
- HLS manifest explanation
- Quality switching
- Buffering state handling

---

## Performance Considerations

- Use `requestAnimationFrame` for smooth progress bar updates (not just timeupdate)
- Lazy load the player when video enters viewport
- Pause video when tab is hidden (`visibilitychange` event)
- Reduce quality automatically on slow connection

---

## Edge Cases to Know

| Edge Case | How to Handle |
|-----------|--------------|
| Video fails to load | Error overlay with retry button |
| Seeking while buffering | Wait for canplay event |
| Fullscreen blocked by browser | Catch promise rejection |
| Autoplay blocked by browser | Show play button, don't auto-start |
| Poor network | Lower quality automatically |
| Mobile (no hover) | Always show controls |
