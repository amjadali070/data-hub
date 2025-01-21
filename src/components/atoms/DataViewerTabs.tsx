import React, { useState } from "react";
import CsvTableViewer from "./CsvTableViewer.tsx";
import JsonTableViewer from "./JsonTableViewer.tsx";
import XlsxTableViewer from "./XlsxTableViewer.tsx";

type ViewerTab = "csv" | "json" | "xlsx";

const DataViewerTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewerTab>("csv");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "csv":
        return <CsvTableViewer />;
      case "json":
        return <JsonTableViewer />;
      case "xlsx":
        return <XlsxTableViewer />;
      default:
        return null;
    }
  };

  return (
    // The outer container spans full width and is responsive.
    <div className="min-h-screen w-full bg-gray-100 p-4">
      {/* Main container with full width */}
      <div className="w-full bg-white rounded-lg">
        {/* Tabs Navigation */}
        <div className="w-full border-b border-gray-200">
          <nav className="flex w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab("csv")}
              className={`flex-1 px-4 py-2 focus:outline-none font-medium 
                ${
                  activeTab === "csv"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600"
                }`}
            >
              CSV Viewer
            </button>
            <button
              onClick={() => setActiveTab("json")}
              className={`flex-1 px-4 py-2 focus:outline-none font-medium 
                ${
                  activeTab === "json"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600"
                }`}
            >
              JSON Viewer
            </button>
            <button
              onClick={() => setActiveTab("xlsx")}
              className={`flex-1 px-4 py-2 focus:outline-none font-medium 
                ${
                  activeTab === "xlsx"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600"
                }`}
            >
              XLSX Viewer
            </button>
          </nav>
        </div>

        {/* Active Tab Content */}
        <div className="p-6 w-full">{renderActiveTab()}</div>
      </div>
    </div>
  );
};

export default DataViewerTabs;
