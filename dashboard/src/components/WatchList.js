import React, { useState, useEffect, useContext } from "react";
import GeneralContext from "./GeneralContext";
import { Tooltip, Grow } from "@mui/material";
import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
} from "@mui/icons-material";
import { watchlist as initialWatchlist } from "../data/data";
import { DoughnutChart } from "./DoughnoutChart";

const WatchList = () => {
  // Initialize watchlist with basePrice to compute realistic intraday % changes
  const [stocks, setStocks] = useState(() =>
    initialWatchlist.map((stock) => ({
      ...stock,
      basePrice: stock.price,
    })),
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Simulate live market ticks every 2.5 seconds
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setStocks((prevStocks) =>
        prevStocks.map((stock) => {
          // Small random tick between -0.4% and +0.4%
          const tickDelta = (Math.random() - 0.495) * 0.008;
          const newPrice = Number((stock.price * (1 + tickDelta)).toFixed(2));
          const percentChange = (
            ((newPrice - stock.basePrice) / stock.basePrice) *
            100
          ).toFixed(2);
          const isDown = newPrice < stock.basePrice;

          return {
            ...stock,
            price: newPrice,
            percent: `${percentChange >= 0 ? "+" : ""}${percentChange}%`,
            isDown,
          };
        }),
      );
    }, 2500);

    return () => clearInterval(tickInterval);
  }, []);

  // Filter stocks by search query
  const filteredStocks = stocks.filter((stock) =>
    stock.name.toLowerCase().includes(searchTerm.trim().toLowerCase()),
  );

  // Add a custom ticker to the watchlist (up to 50)
  const handleAddTicker = (e) => {
    if (e) e.preventDefault();
    const symbol = searchTerm.trim().toUpperCase();
    if (!symbol || stocks.length >= 50) return;

    const alreadyExists = stocks.some((s) => s.name === symbol);
    if (alreadyExists) return;

    const randomStartPrice = Number((Math.random() * 2500 + 150).toFixed(2));
    setStocks((prev) => [
      {
        name: symbol,
        price: randomStartPrice,
        basePrice: randomStartPrice,
        percent: "+0.00%",
        isDown: false,
      },
      ...prev,
    ]);
    setSearchTerm("");
  };

  const data = {
    labels: stocks.map((subArray) => subArray.name),
    datasets: [
      {
        label: "Price",
        data: stocks.map((stock) => stock.price),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const exactMatchExists = stocks.some(
    (s) => s.name.toLowerCase() === searchTerm.trim().toLowerCase(),
  );

  return (
    <div className="watchlist-container">
      <form className="search-container" onSubmit={handleAddTicker}>
        <input
          type="text"
          name="search"
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search eg:infy, bse, nifty fut weekly, gold mcx"
          className="search"
        />
        <span className="counts"> {stocks.length} / 50</span>
      </form>

      {/* Quick-add prompt when searching a symbol not yet in watchlist */}
      {searchTerm.trim() !== "" && !exactMatchExists && stocks.length < 50 && (
        <div
          style={{
            padding: "8px 16px",
            backgroundColor: "#f8f9fa",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "13px",
          }}
        >
          <span>
            Add <strong>{searchTerm.trim().toUpperCase()}</strong> to watchlist?
          </span>
          <button
            type="button"
            onClick={handleAddTicker}
            style={{
              backgroundColor: "#4184f3",
              color: "#fff",
              border: "none",
              borderRadius: "3px",
              padding: "4px 10px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            + Add
          </button>
        </div>
      )}

      <ul className="list">
        {filteredStocks.map((stock) => (
          <WatchListItem stock={stock} key={stock.name} />
        ))}
      </ul>

      <DoughnutChart data={data} />
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);

  const handleMouseEnter = () => {
    setShowWatchlistActions(true);
  };

  const handleMouseLeave = () => {
    setShowWatchlistActions(false);
  };

  return (
    <li onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="item">
        <p className={stock.isDown ? "down" : "up"}>{stock.name}</p>
        <div className="itemInfo">
          <span className="percent">{stock.percent}</span>
          {stock.isDown ? (
            <KeyboardArrowDown className="down" />
          ) : (
            <KeyboardArrowUp className="up" />
          )}
          <span className="price">{stock.price.toFixed(2)}</span>
        </div>
      </div>
      {showWatchlistActions && <WatchListActions uid={stock.name} />}
    </li>
  );
};

const WatchListActions = ({ uid }) => {
  const generalContext = useContext(GeneralContext);

  const handleBuyClick = () => {
    generalContext.openBuyWindow(uid);
  };

  return (
    <span className="actions">
      <span>
        <Tooltip
          title="Buy (B)"
          placement="top"
          arrow
          TransitionComponent={Grow}
          onClick={handleBuyClick}
        >
          <button className="buy">Buy</button>
        </Tooltip>
        <Tooltip
          title="Sell (S)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="sell">Sell</button>
        </Tooltip>
        <Tooltip
          title="Analytics (A)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="action">
            <BarChartOutlined className="icon" />
          </button>
        </Tooltip>
        <Tooltip title="More" placement="top" arrow TransitionComponent={Grow}>
          <button className="action">
            <MoreHoriz className="icon" />
          </button>
        </Tooltip>
      </span>
    </span>
  );
};
