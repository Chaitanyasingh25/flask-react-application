import React, { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";

const Login = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUrl, setLoginUrl] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await axios.get(`${apiUrl}/login/status`);
        if (res.data.status === "logged_in") {
          setIsLoggedIn(true);
          window.location.href = "/dashboard"; // ✅ auto-redirect
        }
      } catch (err) {
        console.error("❌ Error checking login status:", err);
      }
    };

    const fetchLoginUrl = async () => {
      try {
        const res = await axios.get(`${apiUrl}/login/url`);
        setLoginUrl(res.data.login_url);
      } catch (err) {
        console.error("❌ Error fetching login URL:", err);
      }
    };

    checkLoginStatus();
    fetchLoginUrl();
  }, [apiUrl]);

  return (
    <div className="login-box animate-fadeIn">
      {!isLoggedIn && (
        <div className="login-inner animate-slideIn">
          <h2 className="login-heading">🔐 Zerodha Kite Login</h2>
          <p className="login-message">
            Please log in to access trading symbol tools and margin data.
          </p>
          <button
            className="login-button"
            onClick={() => window.location.href = loginUrl}
          >
            Login via Zerodha
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;
