import React, { useState } from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import "react-resizable/css/styles.css";
import "react-grid-layout/css/styles.css";
import "./Settings.css";
import Camera from "./Camera";
const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Settings() {
    const [capturedImage, setCapturedImage] = useState(null);
    const [recognizedText, setRecognizedText] = useState(null);
    const [logs, setLogs] = useState([]);

    const onLayoutChange = (newLayout) => {
        console.log("New layout:", newLayout);
    };

    const defaultLayouts = {
        lg: [
            { i: "image", x: 0, y: 0, w: 6, h: 6, minW: 2, minH: 2 },
            { i: "log", x: 6, y: 0, w: 3, h: 6, minW: 2, minH: 2 },
            { i: "text", x: 9, y: 0, w: 3, h: 6, minW: 2, minH: 2 },
        ]
    };

    return (
        <div className="settings-container">
            <h2>Settings</h2>
            <ResponsiveGridLayout
                className="layout"
                layouts={defaultLayouts}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 2 }}
                rowHeight={600}
                onLayoutChange={onLayoutChange}
                isResizable={true}
                isDraggable={true}
            >
                <div key="image" className="panel">
                    <div className="panel-content">
                        Image
                        {/*<Camera onCapture={setCapturedImage} />
                        {capturedImage && (
                            <img
                                src={capturedImage}
                                alt="Captured"
                                style={{ width: "100%", marginTop: 8 }}
                            />
                        )}*/}
                    </div>
                </div>
                <div key="log" className="panel">
                    <div className="panel-content">
                        <strong>Log Output</strong>
                        <ul>
                            {logs.length === 0 && <li>No logs yet.</li>}
                            {logs.map((log, idx) => (
                                <li key={idx}>{log}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div key="text" className="panel">
                    <div className="panel-content">
                        <strong>Text Output</strong>
                        <div>{recognizedText || "No text recognized yet."}</div>
                    </div>
                </div>
            </ResponsiveGridLayout>
        </div>
    );
}