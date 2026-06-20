# Video Player — Interview Transcript

**Level:** Medium-Hard | **Duration:** 60-75 min | **Status:** ⏹️ Not Started

---

## Progress Tracker

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Requirements & Clarification | ⏹️ |
| 2 | Architecture & HTML5 Video API | ⏹️ |
| 3 | Controls Implementation | ⏹️ |
| 4 | Seek Bar & Progress | ⏹️ |
| 5 | Streaming & Edge Cases | ⏹️ |

---

# Phase 1 — Requirements & Clarification

**Interviewer:**
> "Design a video player. What do you need to know before starting?"

**What candidate should ask:**
- [ ] Recorded video or live stream?
- [ ] What controls are needed? (play, pause, seek, volume, fullscreen?)
- [ ] Quality selection? (360p, 720p, 1080p)
- [ ] Subtitle support?
- [ ] Keyboard shortcuts?
- [ ] Mobile support?
- [ ] What video format? (MP4, HLS, DASH?)

**Interviewer answers:**
> "Recorded video (on-demand). All controls. Yes quality selection. No subtitles for now. Yes keyboard shortcuts. Mobile should work. MP4 for now, mention HLS as bonus."

**Candidate response:** *(write your response here)*

---

# Phase 2 — Architecture & HTML5 Video API

**Interviewer:**
> "Should you use the browser's native video controls or build custom ones?"

**Expected answer — custom:**
```
Native controls: different look per browser/OS
                 no brand consistency
                 limited customization

Custom controls: full design control
                 consistent cross-browser
                 can add features (speed, quality, chapters)
                 → set controls={false} on <video> element
```

**Expected architecture:**
```
<VideoPlayer>
├── <video ref={videoRef} />     (hidden native controls)
└── <ControlsOverlay>
    ├── <BufferingSpinner>
    ├── <ProgressBar>
    └── <ControlsRow>
        ├── PlayPauseButton
        ├── VolumeControl
        ├── TimeDisplay
        ├── SpeedSelector
        ├── QualitySelector
        └── FullscreenButton
```

**Interviewer pushback:**
> "Why `useRef` for the video element instead of `useState`?"

**Expected:** We need imperative control — calling `.play()`, `.pause()`, setting `.currentTime`. useRef gives direct DOM access without causing re-renders.

**Candidate response:** *(write your response here)*

---

# Phase 3 — Controls Implementation

**Interviewer:**
> "Walk me through the play/pause, volume, and speed controls."

**Expected:**
```javascript
const videoRef = useRef(null);

const togglePlay = () => {
  videoRef.current.paused
    ? videoRef.current.play()
    : videoRef.current.pause();
};

const setVolume = (value) => {   // 0 to 1
  videoRef.current.volume = value;
  setMuted(value === 0);
};

const setSpeed = (rate) => {
  videoRef.current.playbackRate = rate;
  setPlaybackSpeed(rate);
};
```

**Expected video event listeners:**
```javascript
useEffect(() => {
  const video = videoRef.current;
  const onPlay = () => setPlaying(true);
  const onPause = () => setPlaying(false);
  const onTimeUpdate = () => setCurrentTime(video.currentTime);
  const onLoadedMetadata = () => setDuration(video.duration);
  const onWaiting = () => setBuffering(true);
  const onCanPlay = () => setBuffering(false);

  video.addEventListener("play", onPlay);
  video.addEventListener("pause", onPause);
  video.addEventListener("timeupdate", onTimeUpdate);
  video.addEventListener("loadedmetadata", onLoadedMetadata);
  video.addEventListener("waiting", onWaiting);
  video.addEventListener("canplay", onCanPlay);
  return () => { /* remove all */ };
}, []);
```

**Candidate response:** *(write your response here)*

---

# Phase 4 — Seek Bar & Progress

**Interviewer:**
> "How does clicking on the progress bar seek to a position?"

**Expected:**
```javascript
const handleSeek = (e) => {
  const bar = e.currentTarget;
  const { left, width } = bar.getBoundingClientRect();
  const clickX = e.clientX - left;
  const seekTime = (clickX / width) * duration;
  videoRef.current.currentTime = seekTime;
};

// Display buffer progress
const getBufferedPercent = () => {
  const video = videoRef.current;
  if (!video || !video.buffered.length) return 0;
  return (video.buffered.end(0) / video.duration) * 100;
};
```

**Expected time display:**
```javascript
const formatTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};
// "2:34 / 10:00"
```

**Interviewer pushback:**
> "The progress bar update seems choppy. How do you smooth it?"

**Expected:** `timeupdate` fires ~4 times/second. For smoother UI, use `requestAnimationFrame` to read `currentTime` and update the progress bar every frame (60fps).

**Candidate response:** *(write your response here)*

---

# Phase 5 — Streaming & Edge Cases

**Interviewer:**
> "For Netflix-level video — millions of users, adaptive quality — what changes?"

**Expected HLS explanation:**
```
HLS (HTTP Live Streaming):
- Video split into small chunks (2-10 seconds each)
- Multiple quality versions of each chunk
- .m3u8 manifest file lists all chunks
- Player picks quality based on network speed
- Seamlessly switches quality mid-playback

Library: hls.js or video.js for HLS support in browser
```

**Interviewer:**
> "What if autoplay is blocked by the browser?"

**Expected:** Browsers block autoplay with sound. Solutions:
1. Autoplay muted (always allowed)
2. Wait for user gesture before playing
3. Show prominent play button as initial state

**Interviewer final question:**
> "Keyboard shortcuts — Space for play/pause, arrows for seek. How do you implement without conflicting with page scrolling?"

**Expected:** `onKeyDown` on the player container with `tabIndex={0}` (makes it focusable). `e.preventDefault()` for Space (prevents page scroll) and Arrow keys.

**Candidate response:** *(write your response here)*

---

## Post-Interview Reflection

**What went well:** *(fill after practice)*

**What to improve:** *(fill after practice)*

**Key learnings:** *(fill after practice)*
