import React, { useState, useEffect } from "react";

const JsonEditor = ({ data, onUpdate }) => {
  const [editableData, setEditableData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    try {
      if (data && typeof data === "object") {
        const safeData = JSON.parse(JSON.stringify(data));
        setEditableData(safeData);
      } else {
        setEditableData({});
      }
    } catch (error) {
      console.error("Error setting editor data:", error);
      setEditableData({});
    }
  }, [data]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    if (onUpdate) {
      onUpdate(editableData);
    }
  };

  const handleCancel = () => {
    setEditableData(data || {});
    setIsEditing(false);
  };

  const handleChange = (key, value) => {
    setEditableData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNestedChange = (key, nestedKey, value) => {
    setEditableData((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [nestedKey]: value,
      },
    }));
  };

  const handleSubmitToDatabase = async () => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    const submitLog = (message, type = "info") => {
      const timestamp = new Date().toLocaleTimeString();
      const newLog = {
        id: Date.now(),
        message: `[SUBMIT] ${message}`,
        type,
        timestamp,
      };

      try {
        const storedLogs = sessionStorage.getItem("tallygo_logs");
        const logs = storedLogs ? JSON.parse(storedLogs) : [];

        logs.unshift(newLog);
        sessionStorage.setItem(
          "tallygo_logs",
          JSON.stringify(logs.slice(0, 50))
        );

        console.log(`[SUBMIT] ${message}`);
      } catch (e) {
        console.warn("Failed to save log to sessionStorage", e);
      }
    };

    try {
      submitLog("Preparing data for submission");
      const payload = {
        data: editableData,
        timestamp: new Date().toISOString(),
        userId: localStorage.getItem("tallygo_user_id") || "anonymous",
      };

      submitLog(
        `Data payload size: ${JSON.stringify(payload).length} characters`
      );

      submitLog("Sending data to API endpoint");
      const response = await fetch(
        "https://tallygo-api.vercel.app/api/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      submitLog(`Response status: ${response.status}`);

      const responseData = await response.text();
      submitLog(`Response body length: ${responseData.length} characters`);

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseData);
        submitLog(
          `Response parsed successfully: ${JSON.stringify(parsedResponse)}`
        );
      } catch (e) {
        submitLog(`Failed to parse response as JSON: ${e.message}`, "error");
        submitLog(
          `Raw response: ${responseData.substring(0, 200)}...`,
          "error"
        );
      }

      if (!response.ok) {
        submitLog(`API returned error status: ${response.status}`, "error");
        throw new Error(parsedResponse?.message || "Failed to submit data");
      }

      submitLog("Data submitted successfully", "success");
      setSubmitStatus("success");
      if (onUpdate) {
        onUpdate(editableData, { submitted: true });
      }
    } catch (error) {
      submitLog(`Submission error: ${error.message}`, "error");
      submitLog(`Error stack: ${error.stack}`, "error");
      console.error("Database submission failed:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
      submitLog("Submission process completed");
    }
  };

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="json-editor empty-state">
        <p>No text recognition data available yet.</p>
        <p>Capture an image to analyze text.</p>
      </div>
    );
  }

  return (
    <div className="json-editor">
      <h3>Recognized Text</h3>

      <div className="editor-controls">
        {!isEditing ? (
          <>
            <button onClick={handleEdit} className="edit-button">
              Edit Text
            </button>
            <button
              onClick={handleSubmitToDatabase}
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit to Database"}
            </button>
          </>
        ) : (
          <>
            <button onClick={handleSave} className="save-button">
              Save
            </button>
            <button onClick={handleCancel} className="cancel-button">
              Cancel
            </button>
          </>
        )}
      </div>

      {submitStatus && (
        <div className={`submit-status ${submitStatus}`}>
          {submitStatus === "success"
            ? "Data successfully submitted to database!"
            : "Failed to submit data. Please try again."}
        </div>
      )}

      <div className="json-content">
        {Object.entries(editableData).map(([key, value]) => (
          <div key={key} className="json-field">
            <div className="field-label">{key}:</div>
            {isEditing ? (
              typeof value === "object" && value !== null ? (
                <div className="nested-fields">
                  {Object.entries(value).map(([nestedKey, nestedValue]) => (
                    <div key={`${key}-${nestedKey}`} className="nested-field">
                      <div className="nested-label">{nestedKey}:</div>
                      <input
                        type="text"
                        value={nestedValue || ""}
                        onChange={(e) =>
                          handleNestedChange(key, nestedKey, e.target.value)
                        }
                        className="field-input"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={value || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="field-input"
                />
              )
            ) : typeof value === "object" && value !== null ? (
              <div className="field-value nested">
                {Object.entries(value).map(([nestedKey, nestedValue]) => (
                  <div key={`${key}-${nestedKey}`} className="nested-value">
                    <span className="nested-key">{nestedKey}:</span>{" "}
                    {nestedValue || ""}
                  </div>
                ))}
              </div>
            ) : (
              <div className="field-value">{value || ""}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default JsonEditor;
