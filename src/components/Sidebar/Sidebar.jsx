import React, { useState, useEffect } from "react";
import { auth } from "../../firebase";
import * as Icons from "lucide-react";
import "./Sidebar.css";

export default function Sidebar({ activeTab, setActiveTab, handleLogout }) {
  const user = auth.currentUser;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) setCollapsed(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: "LayoutDashboard" },
    { name: "Transactions", icon: "ArrowRightLeft" },
    { name: "Categories", icon: "Tags" },
    { name: "Budgets", icon: "Target" },
    { name: "Calendar", icon: "CalendarDays" },
    { name: "Settings", icon: "Settings" },
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
          <Icons.Menu size={24} />
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
            title={collapsed ? "Expand Menu" : "Collapse Menu"}
          >
            {collapsed ? (
              <Icons.Menu size={20} />
            ) : (
              <Icons.ChevronLeft size={22} />
            )}
          </button>
          <button
            className="menu-toggle-btn mobile-close-btn"
            onClick={() => setMobileOpen(false)}
            title="Close Menu"
          >
            <Icons.X size={20} />
          </button>
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const IconCmp = Icons[item.icon];
            return (
              <li
                key={item.name}
                className={`sidebar-item ${activeTab === item.name ? "active" : ""}`}
                onClick={() => handleTabClick(item.name)}
                title={collapsed && window.innerWidth > 768 ? item.name : ""}
              >
                <span
                  className="item-icon"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <IconCmp size={20} />
                </span>
                <span className="item-text">{item.name}</span>
              </li>
            );
          })}
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
                <div className="user-avatar-placeholder">
                  <Icons.User size={20} />
                </div>
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
            <Icons.LogOut size={20} />
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
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Icons.AlertTriangle color="#ffb547" size={24} /> Confirm Logout
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
