import React, { useState, useMemo } from "react";

interface DataRecord {
  [key: string]: any;
}

const JsonTableViewer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [tableData, setTableData] = useState<DataRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  // State to store filter values keyed by column name
  const [filters, setFilters] = useState<{ [key: string]: string }>({});

  // Handle file input changes
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = event.target.files?.[0] ?? null;
    if (selectedFile) {
      console.log("Selected file:", selectedFile);
      setFile(selectedFile);
      // Clear any previously loaded data and filters
      setTableData([]);
      setFilters({});
    }
  };

  // Trigger JSON parsing and display data
  const handleViewData = async () => {
    if (!file) {
      setError("Please select a JSON file first.");
      return;
    }

    try {
      // Read the file content as text
      const fileText = await file.text();
      console.log("File text content:", fileText);

      if (!fileText.trim()) {
        setError("The JSON file is empty or contains only whitespace.");
        return;
      }

      // Parse the JSON text
      const parsed = JSON.parse(fileText);

      // Wrap single objects in an array if necessary
      let records: DataRecord[];
      if (Array.isArray(parsed)) {
        records = parsed;
      } else if (typeof parsed === "object" && parsed !== null) {
        records = [parsed];
      } else {
        setError(
          "Invalid JSON format. Expected an object or an array of objects."
        );
        return;
      }

      if (records.length === 0) {
        setError("The JSON file appears to be empty.");
        return;
      }

      // Optionally limit the displayed rows (for example, first 100 records)
      const first100Records = records.slice(0, 100);
      setTableData(first100Records);
    } catch (e: any) {
      console.error("Error reading or parsing JSON file:", e);
      setError(`Error reading or parsing JSON file: ${e.message}`);
    }
  };

  // Determine table columns from the keys of the first record
  const columns: string[] =
    tableData.length > 0 ? Object.keys(tableData[0]) : [];

  // Update filter value for a given column
  const handleFilterChange = (column: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  // Apply filters (case-insensitive substring match)
  const filteredData = useMemo(() => {
    if (tableData.length === 0) return [];
    return tableData.filter((record) => {
      return columns.every((col) => {
        const filterValue = filters[col]?.toLowerCase() || "";
        const cellValue =
          record[col] !== undefined && record[col] !== null
            ? String(record[col]).toLowerCase()
            : "";
        return filterValue === "" || cellValue.includes(filterValue);
      });
    });
  }, [tableData, filters, columns]);

  return (
    // Outer container with a colorful gradient background and balanced padding
    <div className="min-h-screen bg-gradient-to-r from-emerald-100 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto bg-white border border-gray-200 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-8">
          JSON Table Viewer
        </h1>

        <div className="flex flex-col items-center mb-8">
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="mb-4 w-full max-w-md px-4 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-400"
          />

          {file && (
            <button
              onClick={handleViewData}
              className="bg-slate-700 hover:bg-slate-800 text-white font-semibold px-6 py-2 rounded transition duration-200"
            >
              View Data
            </button>
          )}

          {error && <p className="mt-4 text-red-600 font-medium">{error}</p>}
        </div>

        {filteredData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                {/* Header row with column names */}
                <tr className="bg-slate-200">
                  {columns.map((col, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 text-left font-medium text-slate-700 border border-slate-300 whitespace-normal break-words"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
                {/* Second header row with filter inputs */}
                <tr className="bg-slate-100">
                  {columns.map((col, idx) => (
                    <th key={idx} className="px-4 py-2 border border-slate-300">
                      <input
                        type="text"
                        placeholder={`Filter ${col}`}
                        value={filters[col] || ""}
                        onChange={(e) =>
                          handleFilterChange(col, e.target.value)
                        }
                        className="w-full px-2 py-1 border border-slate-400 rounded focus:outline-none focus:ring-1 focus:ring-slate-500"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((record, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-slate-50">
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className="px-4 py-2 border border-slate-300 text-slate-800 whitespace-normal break-words"
                      >
                        {typeof record[col] === "object"
                          ? JSON.stringify(record[col])
                          : record[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length === 0 && (
              <p className="mt-4 text-slate-600">No matching records found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JsonTableViewer;
