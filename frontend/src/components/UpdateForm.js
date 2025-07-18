import React, { useState } from "react";
import axios from "axios";

const UpdateForm = () => {
  const [symbol, setSymbol] = useState("");
  const [lot, setLot] = useState(1);
  const [result, setResult] = useState(null);

  const updateExcel = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/update`, {
        symbol,
        lot: parseFloat(lot)
      });
      setResult(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
    }
  };

  return (
    <div>
      <h2>Update Excel</h2>
      <input
        type="text"
        placeholder="Enter Symbol"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
      />
      <input
        type="number"
        placeholder="Enter Lot"
        value={lot}
        onChange={(e) => setLot(e.target.value)}
      />
      <button onClick={updateExcel}>Update</button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>✅ Updated</h3>
          <p><strong>Symbol:</strong> {symbol}</p>
          <p><strong>Price:</strong> ₹{result.price}</p>
          <p><strong>Lot:</strong> {result.lot}</p>
          <p><strong>Total:</strong> ₹{result.total}</p>
        </div>
      )}
    </div>
  );
};

export default UpdateForm;
