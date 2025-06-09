import React, { useState, useEffect } from "react";
import Camera from "../components/Camera.jsx";
import JsonEditor from "../components/JsonEditor.jsx";
import "./upload.css";

const Upload = () => {
  const [logs, setLogs] = useState([]);
  const [capturedImage, setCapturedImage] = useState(null);
  const [recognizedText, setRecognizedText] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiError, setApiError] = useState(null);

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = {
      id: Date.now(),
      message,
      type,
      timestamp,
    };

    setLogs((prevLogs) => {
      const updatedLogs = [newLog, ...prevLogs];

      try {
        sessionStorage.setItem(
          "tallygo_logs",
          JSON.stringify(updatedLogs.slice(0, 50))
        );
      } catch (e) {
        console.warn("Failed to save logs to sessionStorage", e);
      }

      return updatedLogs;
    });
  };

  useEffect(() => {
    addLog("Upload page loaded");
    addLog("Camera initializing...");

    try {
      const testLog = {
        id: Date.now(),
        message: "Test log entry",
        type: "info",
        timestamp: new Date().toLocaleTimeString(),
      };

      sessionStorage.setItem("tallygo_test", JSON.stringify(testLog));
      const retrieved = sessionStorage.getItem("tallygo_test");

      if (retrieved) {
        addLog("Session storage is working correctly", "success");
      } else {
        addLog("WARNING: Session storage test failed", "error");
      }
    } catch (e) {
      addLog(`Session storage error: ${e.message}`, "error");
      console.error("SessionStorage error:", e);
    }

    return () => {
      setCapturedImage(null);
      setRecognizedText(null);
    };
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

    let localImageCopy = imageData;

    try {
      const apiKey = import.meta.env.VITE_APP_MISTRAL_API_KEY;
      if (!apiKey) {
        throw new Error("Missing API Key");
      }

      const imageSizeKB = Math.round(imageData.length / 1024);
      addLog(`Image size: ${imageSizeKB}KB`, "info");

      if (imageSizeKB > 10000) {
        addLog(
          "Warning: Image is very large, processing may take longer",
          "info"
        );
      }

      const payload = {
        model: "mistral-medium-latest",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `This image is of a filled-in ballot.
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
                image_url: localImageCopy,
              },
            ],
          },
        ],
      };

      addLog("Connecting to Mistral API...", "info");

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

      if (!response.ok) {
        const errorText = await response.text();
        addLog(`API returned status ${response.status}`, "error");
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      addLog("Response received, processing...", "info");

      const result = await response.json();
      addLog("Response received from API", "success");

      let content = result.choices[0].message.content.trim();
      content = content.replace(/```json|```/g, "").trim();

      try {
        console.log("Raw content from API:", content);
        addLog(
          `Attempting to parse JSON response (${content.length} chars)`,
          "info"
        );

        let parsed;
        try {
          parsed = JSON.parse(content);
        } catch (e) {
          const jsonMatch = content.match(/\{.*\}/s);
          if (jsonMatch) {
            content = jsonMatch[0];
            parsed = JSON.parse(content);
            addLog("Extracted JSON from response text", "info");
          } else {
            throw e;
          }
        }

        if (typeof parsed !== "object" || parsed === null) {
          throw new Error("API returned invalid data structure");
        }

        const sanitized = {};

        Object.entries(parsed).forEach(([key, value]) => {
          if (typeof value === "object" && value !== null) {
            sanitized[key] = {
              id_letter: value.id_letter || "",
              vote_id: value.vote_id || "",
              reg_id: value.reg_id || "",
            };
          } else {
            sanitized[key] = {
              id_letter: "",
              vote_id: String(value),
              reg_id: "",
            };
          }
        });

        addLog(
          `Successfully parsed JSON with ${
            Object.keys(sanitized).length
          } entries`,
          "success"
        );
        setRecognizedText(sanitized);
      } catch (parseError) {
        addLog(`JSON parse error: ${parseError.message}`, "error");
        console.error("Failed to parse JSON:", content);
        setApiError(`Failed to parse AI response: ${parseError.message}`);
      }
    } catch (error) {
      console.error("AI call failed", error);
      addLog(`Error during text recognition: ${error.message}`, "error");
      setApiError(error.message);
    } finally {
      setIsProcessing(false);
      localImageCopy = null;
    }
  };

  const handleJsonUpdate = (updatedData, meta) => {
    setRecognizedText(updatedData);

    if (meta?.submitted) {
      addLog("Data successfully submitted to database", "success");
    } else {
      addLog("Text data updated successfully", "success");
    }
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
          ) : apiError ? (
            <div className="empty-state error">
              <p>Error processing image</p>
              <p>{apiError}</p>
              <button
                className="camera-button"
                onClick={() => setApiError(null)}
                style={{ marginTop: "15px" }}
              >
                Try Again
              </button>
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
