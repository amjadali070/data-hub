import React, { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import {
  Download,
  FilterX,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  SortAsc,
  SortDesc,
  Filter,
} from "lucide-react";

interface DataRecord {
  data: {
    [key: string]: string | number;
  };
}

type SortDirection = "asc" | "desc";

interface SortConfig {
  key: string | null;
  direction: SortDirection;
}

const CSVDataViewer: React.FC = () => {
  const [data, setData] = useState<DataRecord[]>([]);
  const [filteredData, setFilteredData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });
  const [activeFilters, setActiveFilters] = useState<number>(0);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const fetchData = async () => {
    setLoading(true);
    try {
      const limitQuery = limit === 0 ? "" : `&limit=${limit}`;
      const response = await fetch(
        `${API_URL}/api/csv-data?page=${page}${limitQuery}`
      );
      const result = await response.json();
      setData(result.data || []);
      setFilteredData(result.data || []);
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

  useEffect(() => {
    setActiveFilters(
      Object.values(filters).filter((value) => value !== "").length
    );
  }, [filters]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (openDropdown && !target.closest(".dropdown-menu")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  const handleFilterChange = (column: string, value: string) => {
    const updatedFilters = { ...filters, [column]: value };
    setFilters(updatedFilters);

    const newFilteredData = data.filter((item) => {
      return Object.keys(updatedFilters).every((key) => {
        if (!updatedFilters[key]) return true;
        const cellValue = String(item.data[key] || "").toLowerCase();
        return cellValue.includes(updatedFilters[key].toLowerCase());
      });
    });

    setFilteredData(newFilteredData);
  };

  const handleSort = (key: string) => {
    let direction: SortDirection = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedData = [...filteredData].sort((a, b) => {
      const aValue = String(a.data[key] || "").toLowerCase();
      const bValue = String(b.data[key] || "").toLowerCase();

      if (direction === "asc") {
        return aValue.localeCompare(bValue);
      }
      return bValue.localeCompare(aValue);
    });

    setFilteredData(sortedData);
  };

  const handleClearFilters = () => {
    setFilters({});
    setFilteredData(data);
    setSortConfig({ key: null, direction: "asc" });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleLimitChange = (newLimit: string) => {
    const parsedLimit = Number(newLimit);
    if (parsedLimit === 0) {
      // Fetch all records if "All" is selected
      setLimit(0);
      setPage(1);
    } else {
      setLimit(parsedLimit);
      setPage(1);
    }
  };

  const getHeaders = (): string[] => {
    if (data.length === 0) return [];
    return Object.keys(data[0].data || {});
  };

  const uniqueValues = (column: string): (string | number)[] => {
    return Array.from(new Set(data.map((item) => item.data[column] || "N/A")));
  };

  const exportToCSV = () => {
    const headers = getHeaders();
    const exportData = filteredData.map((record) => {
      const row: { [key: string]: string | number } = {};
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

  return (
    <div className="w-full max-w-[95vw] mx-auto bg-white rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">CSV Data Viewer</h2>
          <div className="flex items-center gap-2">
            {activeFilters > 0 && (
              <span className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">
                {activeFilters} active filter{activeFilters !== 1 ? "s" : ""}
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FilterX className="h-4 w-4" />
              Clear Filters
            </button>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export to Excel
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Rows per page:
            </span>
            <select
              value={limit}
              onChange={(e) => handleLimitChange(e.target.value)}
              className="w-24 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[10, 50, 100, 500, 1000, 5000, 10000, "All"].map(
                (value, index) => (
                  <option key={index} value={value === "All" ? 0 : value}>
                    {value === 0 ? "All" : value}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="relative overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="w-16 px-4 py-3 text-center font-medium">
                    S.No
                  </th>
                  {headers.map((header, index) => (
                    <th key={index} className="min-w-[150px] px-4 py-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{header}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSort(header)}
                              className="p-1 hover:bg-gray-200 rounded-md"
                            >
                              {sortConfig.key === header ? (
                                sortConfig.direction === "asc" ? (
                                  <SortAsc className="h-4 w-4" />
                                ) : (
                                  <SortDesc className="h-4 w-4" />
                                )
                              ) : (
                                <SortAsc className="h-4 w-4 opacity-50" />
                              )}
                            </button>
                            <div className="relative dropdown-menu">
                              <button
                                onClick={() =>
                                  setOpenDropdown(
                                    openDropdown === header ? null : header
                                  )
                                }
                                className="p-1 hover:bg-gray-200 rounded-md"
                              >
                                <Filter className="h-4 w-4" />
                              </button>
                              {openDropdown === header && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 z-10">
                                  <div className="p-2">
                                    <input
                                      type="text"
                                      placeholder={`Filter ${header}...`}
                                      value={filters[header] || ""}
                                      onChange={(e) =>
                                        handleFilterChange(
                                          header,
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 mb-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <div className="max-h-48 overflow-y-auto">
                                      {uniqueValues(header).map((value, i) => (
                                        <button
                                          key={i}
                                          onClick={() => {
                                            handleFilterChange(
                                              header,
                                              String(value)
                                            );
                                            setOpenDropdown(null);
                                          }}
                                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md"
                                        >
                                          {value}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((record, index) => (
                  <tr
                    key={index}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-center">{index + 1}</td>
                    {headers.map((header, headerIndex) => (
                      <td key={headerIndex} className="px-4 py-3">
                        {record.data[header] || "N/A"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CSVDataViewer;
