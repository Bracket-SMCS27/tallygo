import React from "react";
import { useState } from "react";
import "/.upload.css"
const Upload = () => {
  const [images, setimages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    setimages(fileArray);
    const previewUrls = fileArray.map((file) => URL.createObjectURL(file));
    setPreviews(previewUrls);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    setLoading(true);
    const formData = new FormData();
    images.forEach((file) => formData.append("ballots", file));
    try {
      const res = await fetch("/api/process-ballots", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, field, value) => {
  setData((prev) => ({
      ...prev,
      [index]: { ...prev[index], [field]: value },
    }));
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/submit-votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        alert("Votes submitted successfully.");
        setImages([]);
        setPreviews([]);
        setData({});
      } else {
        alert("Submission failed.");
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  return (
    <div className="upload-container">
      <div
        className="dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <p>Drag & drop ballots here, or click to select files</p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {previews.length > 0 && (
        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Processing..." : "Process Ballots"}
        </button>
      )}
      <div className="preview-list">
        {previews.map((src, idx) => (
          <div className="preview-item" key={idx}>
            <img src={src} alt={`ballot-${idx}`} />
            {data[idx] && (
              <div className="details-form">
                <div className="form-row">
                  <label>Reg ID:</label>
                  <input
                    type="text"
                    value={data[idx].reg_id || ""}
                    onChange={(e) => handleChange(idx, "reg_id", e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label>Vote ID:</label>
                  <input
                    type="text"
                    value={data[idx].vote_id || ""}
                    onChange={(e) => handleChange(idx, "vote_id", e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label>ID Letter:</label>
                  <input
                    type="text"
                    value={data[idx].id_letter || ""}
                    onChange={(e) => handleChange(idx, "id_letter", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {Object.keys(data).length > 0 && (
        <button className="submit-button" onClick={handleSubmit}>
          Submit Votes
        </button>
      )}
    </div>
  );
};

export default Upload;