import React, { useState, useEffect } from "react";
import axios from "axios";

const Login = () => {
  const [loginUrl, setLoginUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000"; // fallback

  useEffect(() => {
    const fetchLoginUrl = async () => {
      try {
        const url = `${apiUrl}/login/url`;
        console.log("Fetching login URL from:", url); // for debugging
        const res = await axios.get(url);
        setLoginUrl(res.data.login_url);
      } catch (err) {
        console.error("❌ Error fetching login URL:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoginUrl();
  }, [apiUrl]);

  const handleTokenSubmit = async () => {
    if (!token) {
      alert("Please enter the request token.");
      return;
    }

    try {
      const res = await axios.post(`${apiUrl}/login`, {
        request_token: token
      });
      alert(res.data.message || "Login successful!");
    } catch (err) {
      console.error("❌ Login failed:", err);
      alert("Login failed. Please check the token.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login to Zerodha</h2>
      {loading ? (
        <p>Loading login link...</p>
      ) : loginUrl ? (
        <a href={loginUrl} target="_blank" rel="noopener noreferrer">
          <button>Login via Zerodha</button>
        </a>
      ) : (
        <p style={{ color: "red" }}>Unable to fetch login URL.</p>
      )}

      <br /><br />

      <label htmlFor="token">Paste <code>request_token</code> here:</label><br />
      <input
        id="token"
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        style={{ width: "300px", padding: "5px" }}
      />
      <br /><br />
      <button onClick={handleTokenSubmit}>Submit Token</button>
    </div>
  );
};

export default Login;
