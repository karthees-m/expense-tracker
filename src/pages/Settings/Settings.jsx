import React, { useState, useEffect, useRef } from "react";
import { updateProfile } from "firebase/auth";
import { auth } from "../../firebase";
import * as Icons from "lucide-react";
import "./Settings.css";

export default function Settings({
  userName,
  setUserName,
  theme,
  setTheme,
  monthlyIncome,
  setMonthlyIncome,
  handleLogout,
}) {
  const [tempName, setTempName] = useState(userName);
  const [tempIncome, setTempIncome] = useState(monthlyIncome);
  const [defaultPayment, setDefaultPayment] = useState(() => {
    return localStorage.getItem("et_default_payment") || "UPI";
  });
  const [budgetAlertEnabled, setBudgetAlertEnabled] = useState(() => {
    return localStorage.getItem("et_budget_alert") === "true";
  });
  const [savedStatus, setSavedStatus] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); 

  const [openPayDropdown, setOpenPayDropdown] = useState(false);
  const payRef = useRef(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    function handleClickOutside(event) {
      if (payRef.current && !payRef.current.contains(event.target)) {
        setOpenPayDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const paymentOptions = [
    { value: "UPI", label: "📱 UPI / GPay" },
    { value: "Card", label: "💳 Credit / Debit Card" },
    { value: "Cash", label: "💵 Cash" },
    { value: "NetBanking", label: "🏦 Net Banking" },
  ];

  const selectedPaymentObj = paymentOptions.find(
    (p) => p.value === defaultPayment,
  );

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!tempName.trim()) return;

    try {
      if (currentUser) {
        await updateProfile(currentUser, {
          displayName: tempName.trim(),
        });
      }

      setUserName(tempName.trim());
      setMonthlyIncome(Number(tempIncome));

      localStorage.setItem("et_userName", tempName.trim());
      localStorage.setItem("et_income", tempIncome.toString());
      localStorage.setItem("et_default_payment", defaultPayment);
      localStorage.setItem("et_budget_alert", budgetAlertEnabled.toString());

      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 2500);
    } catch (error) {
      console.error("Error updating profile: ", error);
      alert("Failed to update name in Firebase!");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="top-nav no-print">
        <div className="top-nav-left">
          <h2>Application Settings</h2>
          <p>Customize your profile, appearance, and financial preferences</p>
        </div>
      </div>

      <div className="settings-container-modern">
        <div className="settings-profile-banner">
          <div className="settings-avatar-ring">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Avatar"
                className="settings-avatar-img"
              />
            ) : (
              <div className="settings-avatar-placeholder">
                <Icons.User size={32} />
              </div>
            )}
          </div>
          <div className="settings-banner-info">
            <h3>{userName}</h3>
            <p>{currentUser?.email || "No email linked"}</p>
          </div>
        </div>

        <div className="settings-grid-modern">
          <div className="settings-card-modern">
            <div className="settings-card-header">
              <div className="settings-icon-box blue">
                <Icons.UserCog size={20} />
              </div>
              <div>
                <h4>Profile & Income Goal</h4>
                <p>Update your display name and target</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="settings-form-modern">
              <div className="setting-field">
                <label>Display Name</label>
                <div className="input-icon-wrap">
                  <Icons.User size={18} className="field-icon" />
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              <div className="setting-field">
                <label>Monthly Income Target (₹)</label>
                <div className="input-icon-wrap">
                  <Icons.IndianRupee size={18} className="field-icon" />
                  <input
                    type="number"
                    value={tempIncome}
                    onChange={(e) => setTempIncome(e.target.value)}
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>

              <div className="settings-action-row">
                {savedStatus && (
                  <span className="success-badge">
                    <Icons.Check size={14} /> Saved!
                  </span>
                )}
                <button type="submit" className="btn-save-modern">
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          <div className="settings-card-modern">
            <div className="settings-card-header">
              <div className="settings-icon-box purple">
                <Icons.Palette size={20} />
              </div>
              <div>
                <h4>Appearance & Theme</h4>
                <p>Choose your preferred interface look</p>
              </div>
            </div>

            <div className="theme-options-grid">
              <div
                className={`theme-option-card ${theme === "light" ? "active" : ""}`}
                onClick={() => setTheme("light")}
              >
                <div className="theme-preview-box light-preview">
                  <div className="bar"></div>
                  <div className="content"></div>
                </div>
                <div className="theme-option-info">
                  <span className="theme-name">
                    <Icons.Sun size={16} /> Light Mode
                  </span>
                  <p>Clean & Bright</p>
                </div>
              </div>

              <div
                className={`theme-option-card ${theme === "dark" ? "active" : ""}`}
                onClick={() => setTheme("dark")}
              >
                <div className="theme-preview-box dark-preview">
                  <div className="bar"></div>
                  <div className="content"></div>
                </div>
                <div className="theme-option-info">
                  <span className="theme-name">
                    <Icons.Moon size={16} /> Dark Mode
                  </span>
                  <p>Sleek & Midnight</p>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-card-modern full-width">
            <div className="settings-card-header">
              <div className="settings-icon-box orange">
                <Icons.Sliders size={20} />
              </div>
              <div>
                <h4>Smart Preferences</h4>
                <p>Configure default behaviors and alerts</p>
              </div>
            </div>

            <div className="preferences-stack">
              <div className="pref-item-row">
                <div className="pref-meta">
                  <h5>Default Payment Method</h5>
                  <p>Auto-select this payment mode when opening Add Expense</p>
                </div>

                <div className="custom-setting-dropdown-wrapper" ref={payRef}>
                  <div
                    className="custom-setting-dropdown-trigger"
                    onClick={() => setOpenPayDropdown(!openPayDropdown)}
                  >
                    <span>
                      {selectedPaymentObj
                        ? selectedPaymentObj.label
                        : "Select Mode"}
                    </span>
                    <Icons.ChevronDown
                      size={16}
                      className={`arrow-icon ${openPayDropdown ? "open" : ""}`}
                    />
                  </div>

                  {openPayDropdown && (
                    <div className="custom-setting-dropdown-options">
                      {paymentOptions.map((opt) => (
                        <div
                          key={opt.value}
                          className={`custom-setting-dropdown-option ${defaultPayment === opt.value ? "selected" : ""}`}
                          onClick={() => {
                            setDefaultPayment(opt.value);
                            localStorage.setItem(
                              "et_default_payment",
                              opt.value,
                            );
                            setOpenPayDropdown(false);
                          }}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pref-item-row">
                <div className="pref-meta">
                  <h5>80% Budget Warning Indicators</h5>
                  <p>Show visual warnings when categories exceed 80% limit</p>
                </div>
                <label className="toggle-switch-modern">
                  <input
                    type="checkbox"
                    checked={budgetAlertEnabled}
                    onChange={(e) => {
                      setBudgetAlertEnabled(e.target.checked);
                      localStorage.setItem(
                        "et_budget_alert",
                        e.target.checked.toString(),
                      );
                    }}
                  />
                  <span className="slider-modern"></span>
                </label>
              </div>

              {/* Logout button triggers confirmation popup */}
              <div className="pref-item-row danger-zone">
                <div className="pref-meta">
                  <h5 style={{ color: "var(--red)" }}>Session Account</h5>
                  <p>Securely sign out of your account on this device</p>
                </div>
                <button
                  className="btn-logout-modern"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  <Icons.LogOut size={16} /> Logout Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}
