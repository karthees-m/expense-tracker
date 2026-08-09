import React, { useState } from "react";
import * as Icons from "lucide-react";
import "./Budgets.css";

const renderIcon = (iconName, size = 24) => {
  const IconCmp = Icons[iconName] || Icons.Tag;
  return <IconCmp size={size} />;
};

export default function Budgets({
  expenses,
  budgets,
  setBudgets,
  currency,
  categories,
}) {
  const [localBudgets, setLocalBudgets] = useState(budgets);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleInputChange = (category, val) => {
    setLocalBudgets((prev) => ({
      ...prev,
      [category]: Math.max(0, Number(val)),
    }));
  };

  const handleSaveAll = () => {
    setBudgets(localBudgets);
    localStorage.setItem("et_budgets", JSON.stringify(localBudgets));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="page-wrapper">
      <div className="top-nav">
        <div className="top-nav-left">
          <h2>Budget Management</h2>
          <p>Set spending ceilings and prevent budget overruns</p>
        </div>
        <div className="top-nav-right">
          {savedSuccess && (
            <span
              className="save-badge-pill"
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Icons.CheckCircle2 size={16} /> Saved Successfully!
            </span>
          )}
          <button
            className="btn-save-budget-global"
            onClick={handleSaveAll}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Icons.Save size={18} /> Save All Budgets
          </button>
        </div>
      </div>

      <div className="budgets-container">
        {categories.map((cat) => {
          const categoryName = cat.name;
          const limit = localBudgets[categoryName] || 5000;
          const spent = expenses
            .filter((e) => e.category === categoryName)
            .reduce((a, b) => a + b.amount, 0);
          const percent = limit > 0 ? ((spent / limit) * 100).toFixed(0) : 0;
          let statusClass = "safe";
          if (percent > 80 && percent <= 100) statusClass = "warning";
          if (percent > 100) statusClass = "danger";

          return (
            <div className="budget-card" key={categoryName}>
              <div className="budget-top">
                <div className="budget-title-area">
                  <span className="budget-emoji" style={{ color: cat.color }}>
                    {renderIcon(cat.icon)}
                  </span>
                  <div>
                    <h3>{categoryName}</h3>
                    <p className="budget-sub">
                      Spent {currency}
                      {spent.toLocaleString()} of {currency}
                      {limit.toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className={`status-pill ${statusClass}`}>
                  {percent > 100
                    ? `Over by ${percent - 100}%`
                    : `${percent}% used`}
                </span>
              </div>
              <div className="budget-progress-track">
                <div
                  className={`budget-progress-fill ${statusClass}`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                ></div>
              </div>
              <div className="budget-edit-row">
                <label>Monthly Limit ({currency}):</label>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) =>
                    handleInputChange(categoryName, e.target.value)
                  }
                  className="budget-input"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
