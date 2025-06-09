// src/components/Camera.jsx
import React, { useRef, useState, useEffect } from "react";

const Camera = ({ onCapture }) => {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);

  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isCaptured, setIsCaptured] = useState(false);

  const [facingMode, setFacingMode] = useState("user");    // "user" (front) or "environment" (back)
  const [canFlip, setCanFlip] = useState(false);     // only true if device has >1 camera

  useEffect(() => {
    let activeStream;

    async function setupCamera() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === "videoinput");
        setCanFlip(videoInputs.length > 1);

        activeStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        setStream(activeStream);

        if (videoRef.current) {
          videoRef.current.srcObject = activeStream;
        }
      } catch (err) {
        setError("Camera access denied or not available");
        console.error("Camera error:", err);
      }
    }

    setupCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);  

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video  = videoRef.current;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg");
    setIsCaptured(true);
    onCapture?.(imageData);
  };

  const retakePhoto = () => {
    setIsCaptured(false);
    onCapture?.(null);
  };

  const flipCamera = () => {
    setFacingMode(fm => (fm === "user" ? "environment" : "user"));
    setIsCaptured(false);
  };

  return (
    <div className="camera-component">
      {error ? (
        <div className="camera-placeholder">{error}</div>
      ) : (
        <>
          {/* live preview */}
          <div
            className="camera-display"
            style={{ display: isCaptured ? "none" : "block" }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>

          {/* captured snapshot */}
          <div
            className="camera-display"
            style={{ display: isCaptured ? "block" : "none" }}
          >
            <canvas
              ref={canvasRef}
              style={{ width: "100%", height: "auto", objectFit: "contain" }}
            />
          </div>

          {/* controls */}
          <div className="camera-controls">
            {!isCaptured ? (
              <>
                {/* flip if available */}
                {canFlip && (
                  <button
                    className="camera-button"
                    onClick={flipCamera}
                    disabled={!stream}
                  >
                    Flip Camera
                  </button>
                )}
                <button
                  className="camera-button"
                  onClick={captureImage}
                  disabled={!stream}
                >
                  Capture Image
                </button>
              </>
            ) : (
              <button className="camera-button" onClick={retakePhoto}>
                Retake Photo
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Camera;