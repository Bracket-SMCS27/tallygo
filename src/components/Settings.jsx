import React, { useState } from "react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import "react-grid-layout/css/styles.css";
import "./Settings.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function Settings() {
    const [isCameraFlipped, setCameraFlipped] = useState(false);
    const [isPanelMinimized, setPanelMinimized] = useState(false);

    const toggleCameraFlip = () => {
        setCameraFlipped(!isCameraFlipped);
    };

    const onLayoutChange = (newLayout) => {
        console.log("New layout:", newLayout);
    };
    const defaultLayouts = {
        lg: [
            { i: "panel1", x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 },
            { i: "panel1-toggle", x: 6, y: 0, w: 2, h: 1 }
        ]
    };
    return(
        <div className="settings-container">
            <h2>Settings</h2>

            <div>
                <button onClick={toggleCameraFlip}>
                    {isCameraFlipped ? "Unflip Camera" : "Flip Camera"}
                </button>
            </div>
            <ResponsiveGridLayout
                className="layout"
                layouts={{defaultLayouts}}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480}}
                cols={{ lg: 12, md: 10, sm: 6, xs: 2 }}
                rowHeight={30}
                onLayoutChange={onLayoutChange}
                isResizable={true}
                isDraggable={true}
            >
                {!isPanelMinimized && (
                    <div key = "panel1" className="panel">
                        <ResizableBox 
                        width={300}
                        height={200}
                        minConstraints={[200, 200]}
                        axis="both">
                        <div className="panel-content">
                            Resizable Panel 1
                        </div>
                    </ResizableBox>
                </div>
            )}

                <div key = "panel1-toggle" className="minimized-panel">
                    <button onClick={() => setPanelMinimized(!isPanelMinimized)}>
                        {isPanelMinimized ? "Expand Panel" : "Minimize Panel"}
                    </button>
                </div>
            </ResponsiveGridLayout>
        </div>
);

}