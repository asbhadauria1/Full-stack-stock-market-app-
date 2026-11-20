import React, { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import TopBar from "./TopBar";

const Home = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get("email");
    const savedEmail = localStorage.getItem("userEmail");

    if (emailFromUrl) {
      localStorage.setItem("userEmail", emailFromUrl);
      setIsAuthorized(true);
    } else if (savedEmail) {
      setIsAuthorized(true);
    } else {
      window.location.assign(
        "https://full-stack-stock-market-app.vercel.app/login",
      );
    }
  }, []);

  if (!isAuthorized) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "20vh",
          fontFamily: "sans-serif",
          color: "#444",
        }}
      >
        Verifying session...
      </div>
    );
  }

  return (
    <>
      <TopBar />
      <Dashboard />
    </>
  );
};

export default Home;
