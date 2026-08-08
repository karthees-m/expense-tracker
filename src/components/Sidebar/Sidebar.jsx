import React, { useState, useEffect } from "react";
import { auth } from "../../firebase";
import "./Sidebar.css";

export default function Sidebar({ activeTab, setActiveTab, handleLogout }) {
  const user = auth.currentUser;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // 👈 Logout confirm popup state

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setCollapsed(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: "📊" },
    { name: "Transactions", icon: "💸" },
    { name: "Categories", icon: "🏷️" },
    { name: "Budgets", icon: "🎯" },
    { name: "Calendar", icon: "📅" },
    { name: "Settings", icon: "⚙️" },
  ];

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    setMobileOpen(false);
  };

  return (
    <>
      {!mobileOpen && (
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileOpen(true)}
          title="Open Menu"
        >
          ☰
        </button>
      )}

      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}
      <aside
        className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}
      >
        <div className="sidebar-header">
          <h2 className="sidebar-title">ExpenseTracker</h2>

          <button
            className="menu-toggle-btn desktop-toggle"
            onClick={() => setCollapsed(!collapsed)}
            title="Toggle Menu"
          >
            ☰
          </button>

          <button
            className="menu-toggle-btn mobile-close-btn"
            onClick={() => setMobileOpen(false)}
            title="Close Menu"
          >
            ✕
          </button>
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li
              key={item.name}
              className={`sidebar-item ${activeTab === item.name ? "active" : ""}`}
              onClick={() => handleTabClick(item.name)}
              title={collapsed && window.innerWidth > 768 ? item.name : ""}
            >
              <span className="item-icon">{item.icon}</span>
              <span className="item-text">{item.name}</span>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          {user && (
            <div className="user-profile-box">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="user-avatar"
                />
              ) : (
                <div className="user-avatar-placeholder">👤</div>
              )}
              <div className="user-info">
                <h4 className="user-name">{user.displayName || "User"}</h4>
                <p className="user-email">{user.email || ""}</p>
              </div>
            </div>
          )}
          <button
            className="sidebar-logout-btn"
            onClick={() => setShowLogoutConfirm(true)} 
            title="Logout"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ minWidth: "20px" }}
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </aside>

      {showLogoutConfirm && (
        <div
          className="calendar-modal-overlay"
          style={{ zIndex: 99999 }} 
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="calendar-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "360px", textAlign: "center" }}
          >
            <div
              className="modal-header"
              style={{
                justifyContent: "center",
                borderBottom: "none",
                paddingBottom: "0",
              }}
            >
              <h3 style={{ fontSize: "18px", fontWeight: "700" }}>
                ⚠️ Confirm Logout
              </h3>
            </div>
            <div className="modal-body" style={{ padding: "10px 0 20px 0" }}>
              <p
                style={{
                  color: "var(--text-muted, #94a3b8)",
                  fontSize: "14px",
                  margin: "0",
                }}
              >
                Are you sure you want to log out from ExpenseTracker?
              </p>
            </div>
            <div
              style={{ display: "flex", gap: "12px", justifyContent: "center" }}
            >
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "inherit",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                  flex: 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  flex: 1,
                }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
