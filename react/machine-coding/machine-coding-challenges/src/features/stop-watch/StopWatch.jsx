import { useState, useEffect } from "react";

export default function StopWatch() {
  const [isStarted, setIsStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const handleStart = () => {
    setIsStarted(true);
  };

  const handleStop = () => {
    setIsStarted(false);
  };

  const handleReset = () => {
    setIsStarted(false);
    setCurrentTime(0);
  };
  useEffect(() => {
    let interval;
    if (isStarted) {
      interval = setInterval(() => {
        setCurrentTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isStarted]);

  const hrs = Math.floor(currentTime / 3600);
  const mins = Math.floor((currentTime % 3600) / 60);
  const secs = currentTime % 60;
  const formattedTime = `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  return (
    <>
      <h2>Stop Watch</h2>
      <h3>Time: {formattedTime}</h3>
      <button onClick={handleStart}>Start</button>
      <button onClick={handleStop}>Stop</button>
      <button onClick={handleReset}>Reset</button>
    </>
  );
}
