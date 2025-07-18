import React, { useState, useEffect } from "react";
import axios from "axios";

const Login = () => {
  const [loginUrl, setLoginUrl] = useState("");

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/login/url`)
      .then(res => setLoginUrl(res.data.login_url))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Login to Zerodha</h2>
      <a href={loginUrl} target="_blank" rel="noreferrer">
        <button>Login via Zerodha</button>
      </a>
      <br /><br />
      <label>Paste request_token here:</label><br />
      <input id="token" />
      <button onClick={async () => {
        const token = document.getElementById('token').value;
        try {
          const res = await axios.post(`${process.env.REACT_APP_API_URL}/login`, {
            request_token: token
          });
          alert(res.data.message || "Login successful");
        } catch (err) {
          alert("Login failed");
        }
      }}>
        Submit Token
      </button>
    </div>
  );
};

export default Login;
