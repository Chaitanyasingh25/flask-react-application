import React, { useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [data, setData] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const handleSearch = async () => {
    if (!query) return;
    try {
      const res = await axios.get(`${apiUrl}/search?query=${query}`);
      setResults(res.data.results);
    } catch (err) {
      console.error("❌ Error fetching search results:", err);
    }
  };

  const handleSelect = async (symbol) => {
    setSelectedSymbol(symbol);
    try {
      const res = await axios.post(`${apiUrl}/get_price_margin`, {
        symbol: symbol
      });
      setData(res.data);
    } catch (err) {
      console.error("❌ Error fetching price/margin:", err);
    }
  };

  return (
    <div>
      <h2>🔎 Search for Trading Symbol</h2>
      <input
        type="text"
        placeholder="Type something like GOLD"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: "10px", width: "300px", marginRight: "10px" }}
      />
      <button onClick={handleSearch}>Search</button>

      {results.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Results:</h3>
          <ul>
            {results.map((item, idx) => (
              <li key={idx}>
                <button onClick={() => handleSelect(item.tradingsymbol)}>
                  {item.tradingsymbol} ({item.exchange})
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data && (
        <div style={{ marginTop: "30px", padding: "20px", border: "1px solid #ccc" }}>
          <h3>📊 Data for: {selectedSymbol}</h3>
          <p><strong>Price:</strong> ₹{data.price}</p>
          <p><strong>Margin:</strong> ₹{data.margin}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
