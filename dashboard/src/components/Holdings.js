import React, { useState, useEffect } from "react";
import axios from "axios";
import { VerticalGraph } from "./VerticalGraph";

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);

  // 1. Fetch user-specific holdings
  useEffect(() => {
    const backendUrl = "https://full-stack-stock-market-app-dz27.onrender.com";
    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) return;

    axios
      .get(`${backendUrl}/allHoldings?email=${encodeURIComponent(userEmail)}`, {
        withCredentials: true,
      })
      .then((res) => {
        setAllHoldings(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Failed to fetch holdings:", err);
        setAllHoldings([]);
      });
  }, []);

  // 2. Live simulated market price ticks every 3 seconds
  useEffect(() => {
    if (!Array.isArray(allHoldings) || allHoldings.length === 0) return;

    const tickInterval = setInterval(() => {
      setAllHoldings((prevHoldings) =>
        prevHoldings.map((stock) => {
          const deltaPercent = (Math.random() - 0.49) * 0.01; // -0.5% to +0.5%
          const updatedPrice = Number(
            (stock.price * (1 + deltaPercent)).toFixed(2),
          );
          const netChangePercent = (
            ((updatedPrice - stock.avg) / stock.avg) *
            100
          ).toFixed(2);

          return {
            ...stock,
            price: updatedPrice,
            net: `${netChangePercent >= 0 ? "+" : ""}${netChangePercent}%`,
            isLoss: deltaPercent < 0,
          };
        }),
      );
    }, 3000);

    return () => clearInterval(tickInterval);
  }, [allHoldings.length]);

  // Calculate live portfolio summary totals dynamically
  const totalInvestment = allHoldings.reduce(
    (sum, stock) => sum + stock.avg * stock.qty,
    0,
  );
  const currentValue = allHoldings.reduce(
    (sum, stock) => sum + stock.price * stock.qty,
    0,
  );
  const totalPnl = currentValue - totalInvestment;
  const pnlPercentage =
    totalInvestment > 0
      ? ((totalPnl / totalInvestment) * 100).toFixed(2)
      : "0.00";

  const labels = allHoldings.map((stock) => stock.name);
  const data = {
    labels,
    datasets: [
      {
        label: "Stock Price",
        data: allHoldings.map((stock) => stock.price),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <>
      <h3 className="title">Holdings ({allHoldings.length})</h3>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. cost</th>
              <th>LTP</th>
              <th>Cur. val</th>
              <th>P&L</th>
              <th>Net chg.</th>
              <th>Day chg.</th>
            </tr>
          </thead>
          <tbody>
            {allHoldings.length > 0 ? (
              allHoldings.map((stock, index) => {
                const curValue = stock.price * stock.qty;
                const investment = stock.avg * stock.qty;
                const pnl = curValue - investment;
                const isProfit = pnl >= 0;
                const profClass = isProfit ? "profit" : "loss";
                const dayClass = stock.isLoss ? "loss" : "profit";

                return (
                  <tr key={index}>
                    <td>{stock.name}</td>
                    <td>{stock.qty}</td>
                    <td>{stock.avg?.toFixed(2)}</td>
                    <td>{stock.price?.toFixed(2)}</td>
                    <td>{curValue.toFixed(2)}</td>
                    <td className={profClass}>{pnl.toFixed(2)}</td>
                    <td className={profClass}>{stock.net}</td>
                    <td className={dayClass}>{stock.day}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="8"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No holdings yet. Buy a stock from the watchlist to get
                  started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="row">
        <div className="col">
          <h5>{totalInvestment.toFixed(2)}</h5>
          <p>Total investment</p>
        </div>
        <div className="col">
          <h5>{currentValue.toFixed(2)}</h5>
          <p>Current value</p>
        </div>
        <div className="col">
          <h5 className={totalPnl >= 0 ? "profit" : "loss"}>
            {totalPnl.toFixed(2)} ({totalPnl >= 0 ? "+" : ""}
            {pnlPercentage}%)
          </h5>
          <p>P&L</p>
        </div>
      </div>
      {allHoldings.length > 0 && <VerticalGraph data={data} />}
    </>
  );
};

export default Holdings;
