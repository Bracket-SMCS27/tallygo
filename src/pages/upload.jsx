import React, { useState, useEffect } from "react";
import Camera from "../components/Camera.jsx";
import JsonEditor from "../components/JsonEditor.jsx";
import "./upload.css";

const Upload = () => {
  const [logs, setLogs] = useState([]);
  const [capturedImage, setCapturedImage] = useState(null);
  const [recognizedText, setRecognizedText] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = {
      id: Date.now(),
      message,
      type,
      timestamp,
    };

    setLogs((prevLogs) => [newLog, ...prevLogs]);
  };

  useEffect(() => {
    addLog("Upload page loaded");
    addLog("Camera initializing...");
  }, []);

  const handleCapture = (imageData) => {
    if (imageData) {
      setCapturedImage(imageData);
      addLog("Image captured successfully");
      processImageWithAI(imageData);
    } else {
      setCapturedImage(null);
      setRecognizedText(null);
      addLog("Camera reset for new capture");
    }
  };

  const processImageWithAI = (imageData) => {
    setIsProcessing(true);
    addLog("Sending image to AI for text recognition...");

    setTimeout(() => {
      const mockResponse = {
        title: "Shopping List",
        items: "Milk, Eggs, Bread, Butter",
        priority: "High",
        date: "May 26, 2025",
        notes: "Remember to check expiry dates",
      };

      setRecognizedText(mockResponse);
      setIsProcessing(false);
      addLog("Text recognition completed", "success");
    }, 2000);
  };

  const handleJsonUpdate = (updatedData) => {
    setRecognizedText(updatedData);
    addLog("Text data updated successfully", "success");
  };

  return (
    <div className="upload-container">
      <div className="left-box">
        <div className="camera-box">
          <Camera onCapture={handleCapture} />
        </div>

        <div className="json-box">
          {isProcessing ? (
            <div className="empty-state">
              <p>Processing image...</p>
              <p>Please wait while the AI analyzes the text.</p>
            </div>
          ) : (
            <JsonEditor data={recognizedText} onUpdate={handleJsonUpdate} />
          )}
        </div>
      </div>

      <div className="right-box">
        <h3>System Logs</h3>
        <div className="logs-container">
          {logs.length === 0 ? (
            <div className="log-entry">No logs yet</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className={`log-entry ${log.type}`}>
                <span className="log-timestamp">[{log.timestamp}]</span>{" "}
                {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
