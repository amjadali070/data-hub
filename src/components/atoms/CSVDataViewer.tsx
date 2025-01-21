import React, { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const CSVDataViewer: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/csv-data?page=${page}&limit=${limit}`
      );
      const result = await response.json();
      setData(result.data || []);
      setFilteredData(result.data || []); // Initialize filtered data
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      console.error("Error fetching CSV data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  const handleFilterChange = (column: string, value: string) => {
    const updatedFilters = { ...filters, [column]: value };
    setFilters(updatedFilters);

    // Apply filters to data
    const newFilteredData = data.filter((item) => {
      return Object.keys(updatedFilters).every((key) => {
        if (!updatedFilters[key]) return true; // Skip if filter is empty
        const cellValue = item.data[key]?.toString().toLowerCase() || "";
        return cellValue.includes(updatedFilters[key].toLowerCase());
      });
    });

    setFilteredData(newFilteredData);
    setPage(1); // Reset to the first page on filter change
  };

  const handleClearFilters = () => {
    setFilters({});
    setFilteredData(data);
    setPage(1); // Reset to the first page
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to the first page on limit change
  };

  const getHeaders = () => {
    if (data.length === 0) return [];
    return Object.keys(data[0].data || {});
  };

  const calculateColumnWidth = (header: string) => {
    const maxLength = Math.max(
      header.length,
      ...filteredData.map((item) => item.data[header]?.toString().length || 0)
    );
    return `${Math.min(Math.max(maxLength * 10, 100), 300)}px`;
  };

  const exportToCSV = () => {
    const headers = getHeaders();
    const exportData = filteredData.map((record) => {
      const row: any = {};
      headers.forEach((header) => {
        row[header] = record.data[header] || "N/A";
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Data");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(dataBlob, "Filtered_Data.xlsx");
  };

  const headers = getHeaders();
  const uniqueValues = (column: string) => {
    return Array.from(new Set(data.map((item) => item.data[column] || "N/A")));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-4 mb-4">
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-200"
        >
          Export Filtered Data to Excel
        </button>
        <button
          onClick={handleClearFilters}
          className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition duration-200"
        >
          Clear Filters
        </button>
      </div>
      <div className="mb-4">
        <label
          htmlFor="rows-per-page"
          className="mr-2 text-gray-700 font-medium"
        >
          Rows per page:
        </label>
        <select
          id="rows-per-page"
          className="px-3 py-2 border border-gray-400 rounded-lg text-sm focus:outline-none focus:ring focus:ring-blue-400"
          value={limit}
          onChange={(e) => handleLimitChange(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={100}>100</option>
          <option value={500}>500</option>
          <option value={1000}>1000</option>
          <option value={5000}>5000</option>
          <option value={10000}>10000</option>
          <option value={data.length}>All</option>
        </select>
      </div>
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gradient-to-r from-blue-100 to-blue-200 border border-gray-300 rounded-lg shadow-md">
            <thead className="bg-blue-300">
              <tr>
                <th
                  className="py-4 px-6 border border-gray-300 text-left font-semibold text-gray-900"
                  style={{ width: "50px" }}
                >
                  #
                </th>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="py-4 px-6 border border-gray-300 text-left font-semibold text-gray-900"
                    style={{ width: calculateColumnWidth(header) }}
                  >
                    {header}
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder={`Search ${header}`}
                        className="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm focus:outline-none focus:ring focus:ring-blue-400"
                        value={filters[header] || ""}
                        onChange={(e) =>
                          handleFilterChange(header, e.target.value)
                        }
                      />
                      <select
                        className="w-full mt-2 px-3 py-2 border border-gray-400 rounded-lg text-sm focus:outline-none focus:ring focus:ring-blue-400"
                        onChange={(e) =>
                          handleFilterChange(header, e.target.value)
                        }
                        value={filters[header] || ""}
                      >
                        <option value="">All</option>
                        {uniqueValues(header).map((value, i) => (
                          <option key={i} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData
                .slice((page - 1) * limit, page * limit)
                .map((record, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-100 transition duration-200`}
                  >
                    <td
                      className="py-3 px-6 border border-gray-300 text-gray-700"
                      style={{ width: "50px" }}
                    >
                      {index + 1}
                    </td>
                    {headers.map((header, headerIndex) => (
                      <td
                        key={headerIndex}
                        className="py-3 px-6 border border-gray-300 text-gray-600"
                        style={{ width: calculateColumnWidth(header) }}
                      >
                        {record.data[header] || "N/A"}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-200 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-800 font-medium">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CSVDataViewer;
