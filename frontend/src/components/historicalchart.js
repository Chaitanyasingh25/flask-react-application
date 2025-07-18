import React, { useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip } from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

const HistoricalChart = () => {
  const [symbol, setSymbol] = useState("");
  const [exchange, setExchange] = useState("NSE");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [ohlcData, setOhlcData] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const fetchData = async () => {
    try {
      const res = await axios.post(`${apiUrl}/historical`, {
        exchange,
        tradingsymbol: symbol,
        from_date: fromDate,
        to_date: toDate,
        interval: "day"
      });
      setOhlcData(res.data);
    } catch (err) {
      console.error("Error fetching historical data", err);
    }
  };

  const chartData = {
    labels: ohlcData.map((d) => d.date.split("T")[0]),
    datasets: [
      {
        label: `${exchange}:${symbol} Close Price`,
        data: ohlcData.map((d) => d.close),
        fill: false,
        borderColor: "blue",
        tension: 0.1,
      },
    ],
  };

  return (
    <div style={{ marginTop: "40px" }}>
      <h2>📈 Historical OHLC Viewer</h2>
      <div>
        <label>Exchange: </label>
        <select value={exchange} onChange={(e) => setExchange(e.target.value)}>
          <option value="NSE">NSE</option>
          <option value="BSE">BSE</option>
          <option value="MCX">MCX</option>
        </select>
        <br />
        <label>Symbol: </label>
        <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="e.g., RELIANCE" />
        <br />
        <label>From Date: </label>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <br />
        <label>To Date: </label>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <br />
        <button onClick={fetchData}>Fetch Data</button>
      </div>

      {ohlcData.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <Line data={chartData} />
        </div>
      )}
    </div>
  );
};

export default HistoricalChart;
