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

  const processImageWithAI = async (imageData) => {
    setIsProcessing(true);
    addLog("Sending image to AI for text recognition...");

    try {
      const apiKey = process.env.REACT_APP_MISTRAL_API_KEY;
      if(!apiKey){
        throw new Error("Missing API Key");
      }

      const payload = {
        model: "mistral-medium-latest",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: 
                  `This image is of a filled-in ballot.
                  Return a JSON object mapping each category name to an object with its id_letter, vote_id, and reg_id fields.
                  Use this exact format, and do not include any extra commentary:

                  {
                    "CATEGORY_NAME": { "id_letter": "A", "vote_id": "123", "reg_id": "12456" },
                    ...
                  }
                  Respond in valid JSON only.`,
              },
              {
                type: "image_url",
                image_url: imageData,
              },
            ],
          },
        ],
      };

      const response = await fetch(
        "https://api.mistral.ai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error?.message || "AI service error");
      }

      let content = result.choices[0].message.content.trim();
      content = content.replace(/^```json\s*|```$/g, "");
      const parsed = JSON.parse(content);

      setRecognizedText(parsed);
      addLog("Text completion completed", "success");
    } catch (error) {
      console.error("AI call failed", error);
      addLog(`Error during text recognition: ${error.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
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
