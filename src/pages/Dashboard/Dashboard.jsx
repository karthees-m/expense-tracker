import React, { useState } from "react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "./Dashboard.css";

export default function Dashboard({
  expenses,
  setShowModal,
  currency,
  userName,
  setActiveTab,
  categories,
  monthlyIncome = 50000,
}) {
  const [timeRangeOverview, setTimeRangeOverview] = useState("30D");
  const [showOverviewDropdown, setShowOverviewDropdown] = useState(false);

  const [timeRangeCategory, setTimeRangeCategory] = useState("30D");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayExpenses = expenses.filter((e) => e.date === todayStr);
  const todayTotal = todayExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const todayDisplayDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const catColors = {
    "Food & Dining": "#4318FF",
    Transport: "#39B8FF",
    Shopping: "#05CD99",
    "Bills & Utilities": "#FFB547",
    Entertainment: "#EE5D50",
    "Lent to Friend": "#868CFF",
    Others: "#A3AED0",
  };

  const filteredCategoryExpenses = expenses.filter((item) => {
    if (!item.date) return false;
    const itemDate = new Date(item.date);
    const today = new Date();
    const diffTime = today - itemDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (timeRangeCategory === "7D") return diffDays >= 0 && diffDays <= 7;
    if (timeRangeCategory === "30D") return diffDays >= 0 && diffDays <= 30;
    if (timeRangeCategory === "3M") return diffDays >= 0 && diffDays <= 90;
    if (timeRangeCategory === "1Y") return diffDays >= 0 && diffDays <= 365;
    if (timeRangeCategory === "All") return true;
    return true;
  });

  const totalCategoryExpense = filteredCategoryExpenses.reduce(
    (acc, curr) => acc + curr.amount,
    0,
  );

  const categoryTotals = categories
    .map((cat) => {
      const val = filteredCategoryExpenses
        .filter((e) => e.category === cat.name)
        .reduce((a, b) => a + b.amount, 0);
      const pct =
        totalCategoryExpense > 0
          ? ((val / totalCategoryExpense) * 100).toFixed(1)
          : 0;
      return {
        name: cat.name,
        value: val,
        percent: pct,
        color: cat.color || catColors[cat.name] || "#4318FF",
      };
    })
    .filter((c) => c.value > 0);

  const filteredOverviewExpenses = expenses.filter((item) => {
    if (!item.date) return false;
    const itemDate = new Date(item.date);
    const today = new Date();
    const diffTime = today - itemDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (timeRangeOverview === "7D") return diffDays >= 0 && diffDays <= 7;
    if (timeRangeOverview === "30D") return diffDays >= 0 && diffDays <= 30;
    if (timeRangeOverview === "3M") return diffDays >= 0 && diffDays <= 90;
    if (timeRangeOverview === "1Y") return diffDays >= 0 && diffDays <= 365;
    if (timeRangeOverview === "All") return true;
    return true;
  });

  const trendMap = filteredOverviewExpenses.reduce((acc, curr) => {
    const d = curr.date.substring(5);
    acc[d] = (acc[d] || 0) + curr.amount;
    return acc;
  }, {});

  const trendData = Object.keys(trendMap)
    .map((k) => ({ date: k, amount: trendMap[k] }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const getCatDetails = (catName) => {
    const found = categories.find((c) => c.name === catName);
    return {
      icon: found ? found.icon : "🏷️",
      color: found ? found.color : "#4318FF",
    };
  };

  const timeRangeLabels = {
    "7D": "Last 7 Days",
    "30D": "Last 30 Days",
    "3M": "Last 3 Months",
    "1Y": "Last 1 Year",
    All: "All Time",
  };

  return (
    <div className="page-wrapper">
      {/* Top Header */}
      <div className="top-nav">
        <div className="top-nav-left">
          <h2>Welcome back, {userName}! 👋</h2>
          <p>Track your expenses and manage your money better</p>
        </div>
        <div className="top-nav-right">
          <div className="date-pill">📅 {todayDisplayDate}</div>
          <button
            className="btn-primary-add"
            onClick={() => setShowModal(true)}
          >
            + Add Expense
          </button>
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="top-cards-grid">
        <div className="summary-card">
          <div className="card-top-row">
            <div className="stat-icon-circle blue">💳</div>
            <div>
              <p className="card-label">Total Expense</p>
              <h3 className="card-val">
                {currency}{" "}
                {totalExpense.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </h3>
            </div>
          </div>
          <div className="trend-row red">↓ 5.7% from last month</div>
        </div>

        <div className="summary-card">
          <div className="card-top-row">
            <div className="stat-icon-circle cyan">⏱</div>
            <div>
              <p className="card-label">Today Expense</p>
              <h3 className="card-val">
                {currency}{" "}
                {todayTotal.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </h3>
            </div>
          </div>
          <div className="trend-row green">↑ 12.4% from yesterday</div>
        </div>

        <div className="summary-card">
          <div className="card-top-row">
            <div className="stat-icon-circle green">📊</div>
            <div>
              <p className="card-label">This Month Expense</p>
              <h3 className="card-val">
                {currency}{" "}
                {totalExpense.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </h3>
            </div>
          </div>
          <div className="trend-row red">↓ 5.7% from last month</div>
        </div>
      </div>

      <div className="middle-charts-grid">
        {/* 1. Expense Overview Chart */}
        <div className="content-card">
          <div className="card-heading-bar">
            <div>
              <h3>Expense Overview</h3>
              <p className="chart-sub-label">Spending trajectory</p>
            </div>
            <div className="chart-filter-dropdown-container">
              <button
                className="chart-filter-trigger"
                onClick={() => setShowOverviewDropdown(!showOverviewDropdown)}
              >
                <span>{timeRangeLabels[timeRangeOverview]}</span>
                <span className="arrow">▾</span>
              </button>
              {showOverviewDropdown && (
                <div className="chart-filter-menu">
                  {Object.keys(timeRangeLabels).map((key) => (
                    <div
                      key={key}
                      className={`chart-filter-option ${timeRangeOverview === key ? "active" : ""}`}
                      onClick={() => {
                        setTimeRangeOverview(key);
                        setShowOverviewDropdown(false);
                      }}
                    >
                      {timeRangeLabels[key]}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="chart-responsive-box">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4318FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4318FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(163, 174, 208, 0.15)"
                />
                <XAxis
                  dataKey="date"
                  stroke="#a3aed0"
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                  fontSize={11}
                />
                <YAxis
                  stroke="#a3aed0"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-card, #1e293b)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.25)",
                    color: "var(--text-dark, #fff)",
                    padding: "10px 14px",
                  }}
                  itemStyle={{ color: "#4318FF", fontWeight: "700" }}
                  formatter={(value) => [
                    `${currency} ${value.toFixed(2)}`,
                    "Amount",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#4318FF"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#areaGrad)"
                  activeDot={{
                    r: 6,
                    fill: "#4318FF",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="content-card">
          <div className="card-heading-bar">
            <div>
              <h3>Expenses by Category</h3>
              <p className="chart-sub-label">Distribution share</p>
            </div>
            <div className="chart-filter-dropdown-container">
              <button
                className="chart-filter-trigger"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <span>{timeRangeLabels[timeRangeCategory]}</span>
                <span className="arrow">▾</span>
              </button>
              {showCategoryDropdown && (
                <div className="chart-filter-menu">
                  {Object.keys(timeRangeLabels).map((key) => (
                    <div
                      key={key}
                      className={`chart-filter-option ${timeRangeCategory === key ? "active" : ""}`}
                      onClick={() => {
                        setTimeRangeCategory(key);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      {timeRangeLabels[key]}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="donut-layout">
            <div className="donut-chart-box">
              <ResponsiveContainer width={150} height={150}>
                <PieChart>
                  <Pie
                    data={categoryTotals}
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryTotals.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                        style={{
                          filter: "drop-shadow(0px 3px 6px rgba(0,0,0,0.1))",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-card, #1e293b)",
                      borderRadius: "10px",
                      border: "none",
                      color: "#fff",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                    }}
                    formatter={(value) => [`${currency} ${value.toFixed(2)}`]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center-info">
                <h4>
                  {currency}
                  {totalCategoryExpense > 9999
                    ? (totalCategoryExpense / 1000).toFixed(0) + "k"
                    : totalCategoryExpense.toFixed(0)}
                </h4>
                <p>Total Spent</p>
              </div>
            </div>

            <div className="category-legend-list">
              {categoryTotals.slice(0, 4).map((cat) => (
                <div className="legend-row" key={cat.name}>
                  <div className="legend-name">
                    <span
                      className="dot"
                      style={{ background: cat.color }}
                    ></span>
                    <span>{cat.name}</span>
                  </div>
                  <div className="legend-val">
                    <strong>
                      {currency}
                      {cat.value.toFixed(0)}
                    </strong>
                    <span>({cat.percent}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-three-grid">
        <div className="content-card">
          <div className="card-heading-bar">
            <h3>Recent Transactions</h3>
            <button
              className="view-all-link"
              onClick={() => setActiveTab("Transactions")}
            >
              View All
            </button>
          </div>
          <div className="compact-tx-list">
            {expenses.slice(0, 4).map((item) => {
              const details = getCatDetails(item.category);
              return (
                <div className="compact-tx-item" key={item.id}>
                  <div className="tx-lead">
                    <div
                      className="tx-dot-icon-avatar"
                      style={{
                        background: `${details.color}20`,
                        color: details.color,
                      }}
                    >
                      {details.icon}
                    </div>
                    <div>
                      <h4>{item.title}</h4>
                      <p>
                        {item.category} • {item.date}
                      </p>
                    </div>
                  </div>
                  <div className="tx-price">
                    - {currency}
                    {item.amount.toFixed(2)}
                  </div>
                </div>
              );
            })}
            {expenses.length === 0 && (
              <p className="empty-txt">No expenses logged yet.</p>
            )}
          </div>
        </div>

        <div className="content-card">
          <div className="card-heading-bar">
            <div>
              <h3>Today Expense Breakdown</h3>
              <p className="sub-price">
                {currency} {todayTotal.toFixed(2)} Total
              </p>
            </div>
          </div>
          <div className="compact-tx-list">
            {todayExpenses.slice(0, 4).map((item) => {
              const details = getCatDetails(item.category);
              return (
                <div className="compact-tx-item" key={item.id}>
                  <div className="tx-lead">
                    <div
                      className="tx-dot-icon-avatar"
                      style={{
                        background: `${details.color}20`,
                        color: details.color,
                      }}
                    >
                      {details.icon}
                    </div>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.category}</p>
                    </div>
                  </div>
                  <div className="tx-price">
                    {currency}
                    {item.amount.toFixed(2)}
                  </div>
                </div>
              );
            })}
            {todayExpenses.length === 0 && (
              <p className="empty-txt">No expenses spent today.</p>
            )}
          </div>
        </div>

        <div className="content-card">
          <div className="card-heading-bar">
            <h3>{timeRangeLabels[timeRangeCategory]} Expenses by Category</h3>
          </div>
          <div className="progress-bars-column">
            {categoryTotals.map((cat) => (
              <div className="cat-bar-item" key={cat.name}>
                <div className="bar-labels">
                  <span>{cat.name}</span>
                  <strong>
                    {currency}
                    {cat.value.toFixed(2)} ({cat.percent}%)
                  </strong>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${cat.percent}%`, background: cat.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
