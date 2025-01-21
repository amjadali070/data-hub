import React, { useState, useMemo } from "react";
import Papa from "papaparse";

const CsvTableViewer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [tableData, setTableData] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);
  // State to store filter values keyed by column header
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

  // Trigger CSV parsing and display data using File.text()
  const handleViewData = async () => {
    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }

    try {
      // Read the file content as text
      const fileText = await file.text();
      console.log("File text content:", fileText);

      if (!fileText.trim()) {
        setError("The CSV file is empty or contains only whitespace.");
        return;
      }

      // Parse the CSV text
      Papa.parse(fileText, {
        header: false, // Treat every line as a row
        skipEmptyLines: true,
        complete: (results) => {
          console.log("Parsed data:", results.data);
          if (!results?.data) {
            setError("No data was parsed from the file.");
            return;
          }
          if (Array.isArray(results.data)) {
            const data = results.data as string[][];
            if (data.length === 0) {
              setError("The CSV file appears to be empty.");
              return;
            }
            // Get the first 10 rows (or fewer if available)
            const first10Rows = data.slice(0, 10);
            setTableData(first10Rows);
          } else {
            setError("Parsed data is not in the expected format.");
          }
        },
        error: (err) => {
          console.error("Error parsing CSV file:", err);
          setError(`Error parsing CSV file: ${err.message}`);
        },
      });
    } catch (err: any) {
      console.error("Error reading file:", err);
      setError(`Error reading file: ${err.message}`);
    }
  };

  // Compute the table columns from the first row (header row)
  const columns: string[] = tableData.length > 0 ? tableData[0] : [];

  // Handle changes in filter input fields
  const handleFilterChange = (column: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  // Reset all filter values
  const resetFilters = () => {
    setFilters({});
  };

  // Apply filters (case-insensitive substring match)
  const filteredData = useMemo(() => {
    if (tableData.length === 0) return [];
    const header = tableData[0];

    // Return the original data if no filters have been applied
    if (Object.keys(filters).length === 0) return tableData;

    return tableData.filter((row, rowIndex) => {
      // Always keep the header row
      if (rowIndex === 0) return true;
      return row.every((cell, cellIndex) => {
        const colName = header[cellIndex];
        const filterValue = filters[colName]?.toLowerCase() || "";
        return filterValue === "" || cell.toLowerCase().includes(filterValue);
      });
    });
  }, [tableData, filters]);

  return (
    // Outer container with a colorful gradient background and balanced padding
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto bg-white border border-gray-200 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-8">
          CSV Table Viewer
        </h1>

        <div className="flex flex-col items-center mb-8">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="mb-4 w-full max-w-md px-4 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {file && (
            <button
              onClick={handleViewData}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded transition duration-200"
            >
              View Data
            </button>
          )}

          {error && <p className="mt-4 text-red-600 font-medium">{error}</p>}
        </div>

        {tableData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                {/* First header row with column names */}
                <tr className="bg-blue-100">
                  {columns.map((header, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 text-left font-medium text-blue-900 border border-blue-200 whitespace-normal break-words"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
                {/* Second header row with filter input fields */}
                <tr className="bg-blue-50">
                  {columns.map((header, idx) => (
                    <th key={idx} className="px-4 py-2 border border-blue-200">
                      <input
                        type="text"
                        placeholder={`Filter ${header}`}
                        value={filters[header] || ""}
                        onChange={(e) =>
                          handleFilterChange(header, e.target.value)
                        }
                        className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(1).map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-blue-50">
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="px-4 py-2 text-gray-800 border border-blue-200 whitespace-normal break-words"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length === 1 && (
              <p className="mt-4 text-gray-600">No matching records found.</p>
            )}
          </div>
        )}

        {/* Show Reset Filters button if any filter has been applied */}
        {Object.keys(filters).length > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded transition duration-200"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CsvTableViewer;
