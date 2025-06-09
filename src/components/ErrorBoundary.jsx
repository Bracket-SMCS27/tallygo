import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorInfo: null,
      errorLogs: [],
    };
  }

  static getDerivedStateFromError(error) {
    let logs = [];
    try {
      const storedLogs = sessionStorage.getItem("tallygo_logs");
      if (storedLogs) {
        logs = JSON.parse(storedLogs);
      }
    } catch (e) {
      console.error("Failed to retrieve logs from sessionStorage", e);
    }

    return {
      hasError: true,
      errorLogs: logs,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);

    let logs = [];
    try {
      const storedLogs = sessionStorage.getItem("tallygo_logs");
      if (storedLogs) {
        logs = JSON.parse(storedLogs);
        console.log(`Retrieved ${logs.length} logs from sessionStorage`);
      } else {
        console.log("No logs found in sessionStorage");
      }
    } catch (e) {
      console.error("Failed to retrieve logs from sessionStorage", e);
    }

    this.setState({
      errorInfo,
      errorLogs: logs,
      errorMessage: error.toString(),
    });

    const timestamp = new Date().toLocaleTimeString();
    const newLog = {
      id: Date.now(),
      message: `ERROR BOUNDARY TRIGGERED: ${error.toString()}`,
      type: "error",
      timestamp,
    };

    try {
      logs.unshift(newLog);
      sessionStorage.setItem("tallygo_logs", JSON.stringify(logs.slice(0, 50)));
    } catch (e) {
      console.error("Failed to update logs in sessionStorage", e);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, textAlign: "center" }}>
          <h2>Something went wrong</h2>
          <p>
            The application encountered an error. Please try refreshing the
            page.
          </p>

          <button
            className="camera-button"
            onClick={() => window.location.reload()}
            style={{ marginTop: 15, marginBottom: 20 }}
          >
            Refresh Page
          </button>

          {this.state.errorLogs && this.state.errorLogs.length > 0 && (
            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                textAlign: "left",
                border: "1px solid #444",
                borderRadius: "8px",
                padding: "10px",
                backgroundColor: "#333",
                marginTop: "20px",
              }}
            >
              <h3>Debug Logs</h3>
              {this.state.errorLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: "5px",
                    borderBottom: "1px solid #444",
                    color:
                      log.type === "error"
                        ? "#ff6b6b"
                        : log.type === "success"
                        ? "#0be881"
                        : "#fff",
                  }}
                >
                  <span style={{ color: "#888", fontSize: "0.8rem" }}>
                    [{log.timestamp}]
                  </span>{" "}
                  {log.message}
                </div>
              ))}
            </div>
          )}

          {this.state.errorInfo && (
            <div
              style={{
                marginTop: 20,
                textAlign: "left",
                border: "1px solid #ff6b6b",
                borderRadius: "8px",
                padding: "10px",
                backgroundColor: "rgba(255, 51, 51, 0.1)",
              }}
            >
              <h4>Error Details:</h4>
              <div style={{ color: "#ff6b6b", marginBottom: "10px" }}>
                {this.state.errorMessage || "Unknown error"}
              </div>
              <pre
                style={{
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                  color: "#ff6b6b",
                  fontSize: "0.9rem",
                }}
              >
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}

          {}
          <div
            style={{
              marginTop: 20,
              textAlign: "left",
              border: "1px solid #888",
              borderRadius: "8px",
              padding: "10px",
              backgroundColor: "#333",
            }}
          >
            <h4>Debug Info:</h4>
            <div>
              Error Logs Found:{" "}
              {this.state.errorLogs ? this.state.errorLogs.length : 0}
            </div>
            <div>
              localStorage Available:{" "}
              {typeof localStorage !== "undefined" ? "Yes" : "No"}
            </div>
            <div>
              sessionStorage Available:{" "}
              {typeof sessionStorage !== "undefined" ? "Yes" : "No"}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
