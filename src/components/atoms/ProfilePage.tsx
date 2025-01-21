// src/components/atoms/ProfilePage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataViewerTabs from "./DataViewerTabs.tsx"; // Adjust the path as necessary

// Define the shape of the user profile object
interface IUserProfile {
  _id: string;
  username: string;
  email: string;
  bio?: string; // Optional bio field
  // Extend with additional properties if needed, e.g. profilePicture, memberSince, etc.
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  // State for the user's profile data, loading status, and error message.
  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Retrieve the API URL from the environment variables.
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
            // Pass the token in the Authorization header
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

  // Handle logout by removing token and redirecting to the login page.
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Navigate to CSV Uploader page
  const goToCsvUploader = () => {
    navigate("/upload-csv");
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
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* Logo / Icon */}
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-900 font-extrabold">
              DH
            </div>
            <h1 className="text-2xl font-bold text-white">Data Hub</h1>
          </div>
          {profile && (
            <div className="flex items-center space-x-4">
              {/* User avatar */}
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
        {/* Data Viewer Section with CSV Uploader button */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h3 className="text-2xl font-semibold text-gray-800">
              Data Viewer
            </h3>
            <button
              onClick={goToCsvUploader}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
            >
              Upload CSV
            </button>
          </div>
          <DataViewerTabs />
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
