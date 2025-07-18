import React, { useEffect, useState } from "react";
import axios from "axios";
import "../App.css"; // Add this if you're keeping CSS separate

const Login = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUrl, setLoginUrl] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await axios.get(`${apiUrl}/login/status`);
        setIsLoggedIn(res.data.status === "logged_in");
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
    <div className="login-container">
      {isLoggedIn ? (
        <p className="login-success">✅ You are logged in.</p>
      ) : (
        <>
          <h2 className="login-heading">🔐 Kite Login</h2>
          <p className="login-message">Please login via Zerodha to continue:</p>
          <a href={loginUrl}>
            <button className="login-button">Login via Zerodha</button>
          </a>
        </>
      )}
    </div>
  );
};

export default Login;
