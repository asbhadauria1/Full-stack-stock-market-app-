import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Orders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const backendUrl =
      "https://full-stack-stock-market-app-dz27.onrender.com";

    axios
      .get(`${backendUrl}/allOrders`, { withCredentials: true })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setAllOrders(res.data);
        } else {
          setAllOrders([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch orders:", err);
        setAllOrders([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="orders">
        <p style={{ textAlign: "center", padding: "20px" }}>
          Loading orders...
        </p>
      </div>
    );
  }

  return (
    <div className="orders">
      {allOrders.length > 0 ? (
        <>
          <h3 className="title">Orders ({allOrders.length})</h3>
          <div className="order-table">
            <table>
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th>Qty.</th>
                  <th>Price</th>
                  <th>Mode</th>
                </tr>
              </thead>
              <tbody>
                {allOrders.map((order, index) => (
                  <tr key={order._id || index}>
                    <td>{order.name}</td>
                    <td>{order.qty}</td>
                    <td>{Number(order.price).toFixed(2)}</td>
                    <td
                      className={order.mode === "BUY" ? "profit" : "loss"}
                      style={{ fontWeight: "600" }}
                    >
                      {order.mode}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="no-orders">
          <p>You haven't placed any orders today</p>
          <Link to={"/"} className="btn">
            Get started
          </Link>
        </div>
      )}
    </div>
  );
};

export default Orders;