import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Menu = () => {
  const [selectedMenu, setSelectedMenu] = useState(0);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("USERID");

  useEffect(() => {
    // 1. Check if email was just passed from the login redirect (?email=...)
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get("email");

    if (emailFromUrl) {
      localStorage.setItem("userEmail", emailFromUrl);
      setUserEmail(emailFromUrl);
      // Clean the ?email=... query string from the address bar
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // 2. Otherwise read from dashboard's localStorage on page reload
      const savedEmail = localStorage.getItem("userEmail");
      if (savedEmail) {
        setUserEmail(savedEmail);
      }
    }
  }, []);

  const handleMenuClick = (index) => {
    setSelectedMenu(index);
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = (e) => {
    e.stopPropagation();
    localStorage.removeItem("userEmail");
    window.location.assign(
      "https://full-stack-stock-market-app.vercel.app/login",
    );
  };

  // Generate first 2 letters of the email in uppercase for the avatar circle
  const avatarInitials =
    userEmail && userEmail !== "USERID"
      ? userEmail.slice(0, 2).toUpperCase()
      : "ZU";

  const menuClass = "menu";
  const activeMenuClass = "menu selected";

  return (
    <div className="menu-container">
      <img src="logo.png" alt="Logo" style={{ width: "50px" }} />
      <div className="menus">
        <ul>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/"
              onClick={() => handleMenuClick(0)}
            >
              <p className={selectedMenu === 0 ? activeMenuClass : menuClass}>
                Dashboard
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/orders"
              onClick={() => handleMenuClick(1)}
            >
              <p className={selectedMenu === 1 ? activeMenuClass : menuClass}>
                Orders
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/holdings"
              onClick={() => handleMenuClick(2)}
            >
              <p className={selectedMenu === 2 ? activeMenuClass : menuClass}>
                Holdings
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/positions"
              onClick={() => handleMenuClick(3)}
            >
              <p className={selectedMenu === 3 ? activeMenuClass : menuClass}>
                Positions
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="funds"
              onClick={() => handleMenuClick(4)}
            >
              <p className={selectedMenu === 4 ? activeMenuClass : menuClass}>
                Funds
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/apps"
              onClick={() => handleMenuClick(6)}
            >
              <p className={selectedMenu === 6 ? activeMenuClass : menuClass}>
                Apps
              </p>
            </Link>
          </li>
        </ul>
        <hr />

        {/* Profile section with Logout dropdown */}
        <div
          className="profile"
          onClick={handleProfileClick}
          style={{ position: "relative", cursor: "pointer" }}
        >
          <div className="avatar">{avatarInitials}</div>
          <p className="username">{userEmail}</p>

          {isProfileDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "42px",
                right: "0",
                backgroundColor: "#ffffff",
                border: "1px solid #e0e0e0",
                borderRadius: "4px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
                padding: "6px 0",
                minWidth: "130px",
                zIndex: 1000,
              }}
            >
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "8px 16px",
                  border: "none",
                  background: "transparent",
                  color: "#df514c",
                  fontWeight: "500",
                  fontSize: "13px",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;