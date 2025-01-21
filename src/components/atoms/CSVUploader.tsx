import React, { useState } from "react";

const CSVUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Retrieve the API URL from the environment variables.
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setSuccess("");
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("csvFile", file);

    try {
      const response = await fetch(`${API_URL}/api/import-csv`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Error uploading CSV file.");
      } else {
        setSuccess(data.message || "CSV file uploaded successfully.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while uploading the CSV file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Import CSV Data</h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto"
      >
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Select CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-2 bg-green-100 text-green-600 rounded">
            {success}
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload CSV"}
        </button>
      </form>
    </div>
  );
};

export default CSVUploader;
