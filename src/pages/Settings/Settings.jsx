import React, { useState } from "react";
import { updateProfile } from "firebase/auth";
import { auth } from "../../firebase";
import "./Settings.css";

export default function Settings({
  userName,
  setUserName,
  theme,
  setTheme,
  monthlyIncome,
  setMonthlyIncome,
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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!tempName.trim()) return;

    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
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

      <div className="settings-grid-layout">
        {/* Card 1: User Profile & Target */}
        <div className="settings-card">
          <div className="card-header-icon">
            <span className="icon-wrap">👤</span>
            <div>
              <h3>User Profile & Income Target</h3>
              <p>Change your display name and monthly income goal</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="settings-form">
            <div className="setting-group">
              <label>Your Display Name</label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Enter your name"
                className="setting-input"
                required
              />
            </div>

            <div className="setting-group">
              <label>Monthly Income / Savings Target (₹)</label>
              <input
                type="number"
                value={tempIncome}
                onChange={(e) => setTempIncome(e.target.value)}
                placeholder="e.g. 50000"
                className="setting-input"
              />
              <span className="helper-txt">
                Used to track monthly savings potential
              </span>
            </div>

            <div className="form-action-row">
              {savedStatus && (
                <span className="success-txt">✓ Preferences Saved!</span>
              )}
              <button type="submit" className="btn-save-settings">
                Save Profile
              </button>
            </div>
          </form>
        </div>

        <div className="settings-card">
          <div className="card-header-icon">
            <span className="icon-wrap">🎨</span>
            <div>
              <h3>Appearance & Theme</h3>
              <p>Switch between Light Mode and Dark Mode</p>
            </div>
          </div>

          <div className="theme-toggle-row">
            <div
              className={`theme-box ${theme === "light" ? "active" : ""}`}
              onClick={() => setTheme("light")}
            >
              <div
                className="theme-preview"
                style={{
                  borderRadius: "8px",
                  overflow: "hidden",
                  marginBottom: "12px",
                  border: "1px solid #d1d5db",
                }}
              >
                <div style={{ height: "25px", background: "#1447e6" }}></div>
                <div style={{ height: "45px", background: "#f4f7fe" }}></div>
              </div>
              <div className="theme-label">
                <span>☀️ Light Theme</span>
                <p>Clean Royal Blue & White</p>
              </div>
            </div>

            <div
              className={`theme-box ${theme === "dark" ? "active" : ""}`}
              onClick={() => setTheme("dark")}
            >
              <div
                className="theme-preview"
                style={{
                  borderRadius: "8px",
                  overflow: "hidden",
                  marginBottom: "12px",
                  border: "1px solid #334155",
                }}
              >
                <div style={{ height: "25px", background: "#1e293b" }}></div>
                <div style={{ height: "45px", background: "#0b1120" }}></div>
              </div>
              <div className="theme-label">
                <span>🌙 Dark Theme</span>
                <p>Elite Slate & Midnight Blue</p>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-card full-span">
          <div className="card-header-icon">
            <span className="icon-wrap">⚡</span>
            <div>
              <h3>Smart Preferences & Budget Alerts</h3>
              <p>
                Configure default transaction behaviors and budget thresholds
              </p>
            </div>
          </div>

          <div className="preferences-list">
            <div className="pref-row">
              <div className="pref-info">
                <h4>Default Payment Method</h4>
                <p>
                  Auto-select this payment mode whenever you open the Add
                  Expense modal
                </p>
              </div>
              <select
                value={defaultPayment}
                onChange={(e) => {
                  setDefaultPayment(e.target.value);
                  localStorage.setItem("et_default_payment", e.target.value);
                }}
                className="pref-select"
              >
                <option value="UPI">📱 UPI / GPay</option>
                <option value="Card">💳 Credit / Debit Card</option>
                <option value="Cash">💵 Cash</option>
                <option value="NetBanking">🏦 Net Banking</option>
              </select>
            </div>

            <div className="pref-row">
              <div className="pref-info">
                <h4>80% Budget Warning Indicators</h4>
                <p>
                  Show visual warning color badges when any category spends over
                  80% of its budget
                </p>
              </div>
              <label className="toggle-switch">
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
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
