import React, { useState, useEffect } from "react";

const JsonEditor = ({ data, onUpdate }) => {
  const [editableData, setEditableData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    setEditableData(data || {});
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

  const handleSubmitToDatabase = async () => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("https://tallygo-api.vercel.app/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: editableData,
          timestamp: new Date().toISOString(),
          userId: localStorage.getItem("tallygo_user_id") || "anonymous",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit data");
      }

      setSubmitStatus("success");
      if (onUpdate) {
        onUpdate(editableData, { submitted: true });
      }
    } catch (error) {
      console.error("Database submission failed:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
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
              <input
                type="text"
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                className="field-input"
              />
            ) : (
              <div className="field-value">{value}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default JsonEditor;
