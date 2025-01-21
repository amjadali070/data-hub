import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";

const XlsxTableViewer: React.FC = () => {
  // State to store the uploaded file, parsed table data, and any error message.
  const [file, setFile] = useState<File | null>(null);
  const [tableData, setTableData] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);
  // State to store filter values for each column (keyed by column header)
  const [filters, setFilters] = useState<{ [key: string]: string }>({});

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = event.target.files?.[0] ?? null;
    if (selectedFile) {
      console.log("Selected XLSX file:", selectedFile);
      setFile(selectedFile);
      // Clear previously loaded data and filters
      setTableData([]);
      setFilters({});
    }
  };

  // Parse the XLSX file and extract data
  const handleViewData = async () => {
    if (!file) {
      setError("Please select an XLSX file first.");
      return;
    }

    try {
      // Read the file as an array buffer
      const arrayBuffer = await file.arrayBuffer();
      // Parse the workbook
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      // Select the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      // Convert the sheet to JSON (array of arrays).
      // The option { header: 1 } returns an array of arrays, with the first row as header.
      const jsonData: string[][] = XLSX.utils.sheet_to_json<string[]>(
        worksheet,
        {
          header: 1,
          blankrows: false,
        }
      );
      console.log("Parsed XLSX data:", jsonData);

      if (!jsonData || jsonData.length === 0) {
        setError("The XLSX file appears to be empty.");
        return;
      }

      // Take the first 100 rows (or fewer if available)
      const first100Rows = jsonData.slice(0, 100);
      setTableData(first100Rows);
    } catch (e: any) {
      console.error("Error reading XLSX file:", e);
      setError(`Error reading XLSX file: ${e.message}`);
    }
  };

  // Determine table columns from the first row
  const columns: string[] = tableData.length > 0 ? tableData[0] : [];

  // Compute distinct options for each column based on the data rows (skip header row)
  const columnOptions = useMemo(() => {
    const options: { [key: string]: string[] } = {};
    if (tableData.length > 1) {
      columns.forEach((col, colIndex) => {
        const distinctValues = new Set<string>();
        tableData.slice(1).forEach((row) => {
          if (row[colIndex] !== undefined && row[colIndex] !== null) {
            distinctValues.add(row[colIndex]);
          }
        });
        // Sort the options alphabetically
        options[col] = Array.from(distinctValues).sort();
      });
    }
    return options;
  }, [tableData, columns]);

  // Handle filter changes for both input and select elements
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    column: string
  ) => {
    setFilters({
      ...filters,
      [column]: e.target.value,
    });
  };

  // Apply filters to the table data (case-insensitive substring match)
  const filteredData = useMemo(() => {
    if (Object.keys(filters).length > 0) {
      return tableData.filter((row, rowIndex) => {
        // Always include the header row
        if (rowIndex === 0) return true;
        return columns.every((col, colIndex) => {
          const filterValue = filters[col]?.toLowerCase() || "";
          const cellValue = row[colIndex]?.toString().toLowerCase() || "";
          return filterValue === "" || cellValue.includes(filterValue);
        });
      });
    }
    return tableData;
  }, [filters, tableData, columns]);

  // Handle exporting filtered data to XLSX
  const handleExport = () => {
    if (filteredData.length === 0) {
      setError("No data to export.");
      return;
    }

    // Convert filtered data back to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FilteredData");

    // Generate buffer and trigger download
    const wbout = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "filtered_data.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    // Outer container with a colorful gradient background and responsive padding.
    <div className="min-h-screen bg-gradient-to-r from-emerald-100 to-indigo-100 p-6">
      {/* Main content container with a clean border, rounded corners, and a subtle shadow */}
      <div className="max-w-7xl mx-auto bg-white border border-gray-200 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-8">
          XLSX Table Viewer
        </h1>

        <div className="flex flex-col items-center mb-8 space-y-4">
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="w-full max-w-md px-4 py-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {file && (
            <div className="flex space-x-4">
              <button
                onClick={handleViewData}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded transition duration-200"
              >
                View Data
              </button>
              {filteredData.length > 0 && (
                <button
                  onClick={handleExport}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded transition duration-200"
                >
                  Export Filtered Data
                </button>
              )}
            </div>
          )}

          {error && <p className="mt-4 text-red-600 font-medium">{error}</p>}
        </div>

        {tableData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                {/* Header row with column names */}
                <tr className="bg-indigo-50">
                  {columns.map((header, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 text-left font-medium text-indigo-800 border border-indigo-200 whitespace-normal break-words"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
                {/* Second header row with filter inputs */}
                <tr className="bg-indigo-100">
                  {columns.map((header, idx) => {
                    const options = columnOptions[header] || [];
                    // Use a select dropdown if there are 5 or fewer distinct values.
                    const useSelect = options.length > 0 && options.length <= 5;
                    return (
                      <th
                        key={idx}
                        className="px-4 py-2 border border-indigo-200"
                      >
                        {useSelect ? (
                          <select
                            value={filters[header] || ""}
                            onChange={(e) => handleFilterChange(e, header)}
                            className="w-full px-2 py-1 border border-indigo-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          >
                            <option value="">All</option>
                            {options.map((opt, optionIdx) => (
                              <option key={optionIdx} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder={`Filter ${header}`}
                            value={filters[header] || ""}
                            onChange={(e) => handleFilterChange(e, header)}
                            className="w-full px-2 py-1 border border-indigo-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          />
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredData.slice(1).map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-gray-100">
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="px-4 py-2 border border-gray-200 text-gray-700 whitespace-normal break-words"
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
      </div>
    </div>
  );
};

export default XlsxTableViewer;
