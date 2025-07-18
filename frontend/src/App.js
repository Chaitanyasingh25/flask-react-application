import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import UpdateForm from './components/UpdateForm';
import HistoricalChart from './components/historicalchart';
import axios from 'axios';
import './App.css';  // <-- include the updated CSS

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await axios.get(`${apiUrl}/login/status`);
        setIsLoggedIn(res.data.status === "logged_in");
      } catch (e) {
        console.error("Login status check failed:", e);
      }
    };
    checkLogin();
  }, [apiUrl]);

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="title">📊 Live Market Data Checker</h1>
        <p className="subtitle">
          Enter a trading symbol like <code>MCX:GOLDM25OCTFUT</code> to view live price and margin.
        </p>
      </header>

      <section className="section card animate-fadeIn">
        <h2 className="section-title">🔐</h2>
        <Login />
      </section>

      {isLoggedIn ? (
        <>
          <section className="section card animate-slideIn">
            <h2 className="section-title">📥 Symbol Price & Margin</h2>
            <UpdateForm />
          </section>

          <section className="section card animate-fadeIn" style={{ animationDelay: "0.2s" }}>
            <h2 className="section-title">📈 Historical OHLC Chart</h2>
            <HistoricalChart />
          </section>
        </>
      ) : (
        <p className="login-reminder">🔒 Please login first to access the data.</p>
      )}
    </div>
  );
}

export default App;
