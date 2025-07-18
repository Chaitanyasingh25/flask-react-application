import React, { useState } from 'react';
import axios from 'axios';

const UpdateForm = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [data, setData] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const handleSearch = async () => {
    if (!query) return;
    try {
      const res = await axios.get(`${apiUrl}/search-symbols?query=${query}`);
      setResults(res.data); // ✅ Fixed: your backend returns a list, not {results}
    } catch (err) {
      console.error("❌ Error fetching search results:", err);
    }
  };

  const handleSelect = async (item) => {
    setSelectedSymbol(item.tradingsymbol);
    try {
      const res = await axios.post(`${apiUrl}/get-symbol-data`, {
        exchange: item.exchange,
        tradingsymbol: item.tradingsymbol
      });
      setData(res.data);
    } catch (err) {
      console.error("❌ Error fetching price/margin:", err);
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
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
          <ul style={{ listStyle: "none", padding: 0 }}>
            {results.map((item, idx) => (
              <li key={idx} style={{ marginBottom: "10px" }}>
                <button
                  onClick={() => handleSelect(item)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "5px",
                    border: "1px solid #888",
                    backgroundColor: "#f0f0f0",
                    cursor: "pointer"
                  }}
                >
                  {item.tradingsymbol} ({item.exchange})
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data && (
        <div style={{ marginTop: "30px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px", background: "#fafafa" }}>
          <h3>📊 Data for: {selectedSymbol}</h3>
          <p><strong>Price:</strong> ₹{data.price}</p>
          <p><strong>Margin:</strong> ₹{data.margin || "N/A"}</p>
        </div>
      )}
    </div>
  );
};

export default UpdateForm;
