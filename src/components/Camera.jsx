import React, { useRef, useState, useEffect } from "react";

const Camera = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isCaptured, setIsCaptured] = useState(false);

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError("Camera access denied or not available");
        console.error("Camera error:", err);
      }
    }

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL("image/jpeg");
      setIsCaptured(true);

      if (onCapture) {
        onCapture(imageData);
      }
    }
  };

  const retakePhoto = () => {
    setIsCaptured(false);
    if (onCapture) {
      onCapture(null);
    }
  };

  return (
    <div className="camera-component">
      {error ? (
        <div className="camera-placeholder">{error}</div>
      ) : (
        <>
          <div
            className="camera-display"
            style={{ display: isCaptured ? "none" : "block" }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>

          <div
            className="camera-display"
            style={{ display: isCaptured ? "block" : "none" }}
          >
            <canvas ref={canvasRef} style={{ width: "100%", objectFit: "contain" }} />
          </div>

          <div className="camera-controls">
            {!isCaptured ? (
              <button
                className="camera-button"
                onClick={captureImage}
                disabled={!stream}
              >
                Capture Image
              </button>
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
