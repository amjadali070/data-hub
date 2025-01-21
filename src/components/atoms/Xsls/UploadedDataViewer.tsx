import React, { useEffect, useState } from "react";

interface UploadedData {
  _id: string;
  data: { [key: string]: any }; // Represents a row of data
  createdAt: string;
  updatedAt: string;
}

const UploadedDataViewer: React.FC = () => {
  const [uploadedData, setUploadedData] = useState<UploadedData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchUploadedData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/uploaded-data`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Error fetching uploaded data.");
        }

        setUploadedData(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUploadedData();
  }, [API_URL]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Uploaded Data</h2>
      {uploadedData.length > 0 ? (
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              {Object.keys(uploadedData[0].data).map((key) => (
                <th
                  key={key}
                  className="px-4 py-2 border-b text-left text-sm font-medium text-gray-600"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {uploadedData.map((record) => (
              <tr key={record._id}>
                {Object.values(record.data).map((value, index) => (
                  <td
                    key={index}
                    className="px-4 py-2 border-b text-sm text-gray-700"
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No data available.</div>
      )}
    </div>
  );
};

export default UploadedDataViewer;
