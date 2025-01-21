import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./components/atoms/LoginPage.tsx";
import RegisterPage from "./components/atoms/RegisterPage.tsx";
import ProfilePage from "./components/atoms/ProfilePage.tsx";
import CSVUploader from "./components/atoms/CSVUploader.tsx";
// Optionally, you might have a ProfilePage for protected content
// import ProfilePage from "./components/atoms/ProfilePage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<LoginPage />} />
        {/* Example protected route */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/upload-csv" element={<CSVUploader />} />
      </Routes>
    </Router>
  );
};

export default App;
