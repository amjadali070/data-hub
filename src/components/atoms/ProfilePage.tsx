import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CSVDataViewer from "./CSVDataViewer.tsx"; // Import CSV viewer component

import CSVUploader from "./CSVUploader.tsx"; // Import CSV uploader component
import XLSXUploader from "./Xsls/XLSXUploader.tsx";
import UploadedDataViewer from "./Xsls/UploadedDataViewer.tsx";

interface IUserProfile {
  _id: string;
  username: string;
  email: string;
  bio?: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [showCSVViewer, setShowCSVViewer] = useState<boolean>(false);
  const [showXLSXViewer, setShowXLSXViewer] = useState<boolean>(false);
  const [showCSVUploader, setShowCSVUploader] = useState<boolean>(false);
  const [showXLSXUploader, setShowXLSXUploader] = useState<boolean>(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch profile.");
          setLoading(false);
          return;
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching the profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [API_URL]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl font-semibold text-gray-700">
          Loading profile...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl font-semibold text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-900 font-extrabold">
              DH
            </div>
            <h1 className="text-2xl font-bold text-white">Data Hub</h1>
          </div>
          {profile && (
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                <span className="text-lg text-gray-800 uppercase">
                  {profile.username.charAt(0)}
                </span>
              </div>
              <span className="text-white font-medium">{profile.username}</span>
              <button
                onClick={handleLogout}
                className="border border-red-400 text-red-400 hover:bg-red-400 hover:text-white transition duration-200 py-1 px-3 rounded"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Data Viewer Section */}
        <div className="bg-white rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-2xl font-semibold text-gray-800">
              Data Viewer
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCSVUploader(!showCSVUploader)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
              >
                {showCSVUploader ? "Hide CSV Uploader" : "Upload CSV"}
              </button>
              <button
                onClick={() => setShowXLSXUploader(!showXLSXUploader)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
              >
                {showXLSXUploader ? "Hide XLSX Uploader" : "Upload XLSX"}
              </button>
              <button
                onClick={() => setShowCSVViewer(!showCSVViewer)}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
              >
                {showCSVViewer ? "Hide CSV Viewer" : "View CSV Data"}
              </button>
              <button
                onClick={() => setShowXLSXViewer(!showXLSXViewer)}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
              >
                {showXLSXViewer ? "Hide XLSX Viewer" : "View XLSX Data"}
              </button>
            </div>
          </div>
          {showCSVUploader && <CSVUploader />}
          {showXLSXUploader && <XLSXUploader />}
          {showCSVViewer && <CSVDataViewer />}
          {showXLSXViewer && <UploadedDataViewer />}
        </div>
      </main>

      <footer className="bg-gray-200 py-4">
        <div className="container mx-auto text-center text-gray-600">
          &copy; {new Date().getFullYear()} Data Hub. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default ProfilePage;
