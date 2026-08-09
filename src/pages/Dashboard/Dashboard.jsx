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
import * as Icons from "lucide-react";
import "./Dashboard.css";

const renderIcon = (iconName, size = 20) => {
  const IconCmp = Icons[iconName] || Icons.Tag;
  return <IconCmp size={size} />;
};

const CustomPieTooltip = ({ active, payload, currency }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-pie-tooltip">
        <div className="tooltip-cat">
          <span className="dot" style={{ backgroundColor: data.color }}></span>
          {data.name}
        </div>
        <div className="tooltip-val">
          {currency}
          {Number(data.value).toLocaleString("en-IN", {
            minimumFractionDigits: 0,
          })}
        </div>
      </div>
    );
  }
  return null;
};

export default function Dashboard({
  expenses,
  setShowModal,
  currency,
  userName,
  setActiveTab,
  categories,
  monthlyIncome = 50000,
  user,
}) {
  const [timeRangeOverview, setTimeRangeOverview] = useState("30D");
  const [showOverviewDropdown, setShowOverviewDropdown] = useState(false);
  const [timeRangeCategory, setTimeRangeCategory] = useState("30D");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const todayStr = new Date().toISOString().split("T")[0];
  const todayExpenses = expenses.filter((e) => e.date === todayStr);
  const todayTotal = todayExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const filteredCategoryExpenses = expenses.filter((item) => {
    if (!item.date) return false;
    const diffDays = (new Date() - new Date(item.date)) / (1000 * 60 * 60 * 24);
    if (timeRangeCategory === "7D") return diffDays >= 0 && diffDays <= 7;
    if (timeRangeCategory === "30D") return diffDays >= 0 && diffDays <= 30;
    if (timeRangeCategory === "3M") return diffDays >= 0 && diffDays <= 90;
    if (timeRangeCategory === "1Y") return diffDays >= 0 && diffDays <= 365;
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
      return {
        name: cat.name,
        value: val,
        percent:
          totalCategoryExpense > 0
            ? ((val / totalCategoryExpense) * 100).toFixed(1)
            : 0,
        color: cat.color || "#4318FF",
      };
    })
    .filter((c) => c.value > 0);

  const filteredOverviewExpenses = expenses.filter((item) => {
    if (!item.date) return false;
    const diffDays = (new Date() - new Date(item.date)) / (1000 * 60 * 60 * 24);
    if (timeRangeOverview === "7D") return diffDays >= 0 && diffDays <= 7;
    if (timeRangeOverview === "30D") return diffDays >= 0 && diffDays <= 30;
    if (timeRangeOverview === "3M") return diffDays >= 0 && diffDays <= 90;
    if (timeRangeOverview === "1Y") return diffDays >= 0 && diffDays <= 365;
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
      icon: found ? found.icon : "Tag",
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
      <div className="top-nav">
        <div className="app-header-left">
          <p className="greeting-sub">Good Morning,</p>
          <h2 className="greeting-title">{userName}</h2>
        </div>
        <div className="app-header-right">
          <button
            className="btn-primary-add"
            onClick={() => {
              if (!user) {
                setActiveTab("Login");
              } else {
                setShowModal(true);
              }
            }}
          >
            <Icons.Plus size={20} /> Add Expense
          </button>
        </div>
      </div>

      <div className="top-cards-grid">
        <div className="summary-card compact">
          <div className="card-top-row-compact">
            <span className="card-label">Total Expense</span>
            <Icons.CreditCard size={18} color="#4318FF" />
          </div>
          <h3 className="card-val">
            {currency}
            {totalExpense.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
          </h3>
        </div>

        <div className="summary-card compact">
          <div className="card-top-row-compact">
            <span className="card-label">Today</span>
            <Icons.Clock size={18} color="#39B8FF" />
          </div>
          <h3 className="card-val">
            {currency}
            {todayTotal.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
          </h3>
        </div>

        <div className="summary-card compact">
          <div className="card-top-row-compact">
            <span className="card-label">This Month</span>
            <Icons.Calendar size={18} color="#05CD99" />
          </div>
          <h3 className="card-val">
            {currency}
            {totalExpense.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
          </h3>
        </div>

        <div className="summary-card compact">
          <div className="card-top-row-compact">
            <span className="card-label">Transactions</span>
            <Icons.Activity size={18} color="#FFB547" />
          </div>
          <h3 className="card-val">{expenses.length}</h3>
        </div>
      </div>

      <div className="middle-charts-grid">
        <div className="content-card">
          <div className="card-heading-bar-chart">
            <div className="chart-header-left">
              <p className="chart-sub-label-top">EXPENSE OVERVIEW</p>
              <div className="chart-val-row">
                <h3>
                  {totalExpense.toLocaleString("en-IN", {
                    minimumFractionDigits: 0,
                  })}
                </h3>
                <span className="trend-up">
                  <Icons.Triangle fill="currentColor" size={14} />
                </span>
              </div>
            </div>

            <div className="chart-filter-dropdown-container">
              <button
                className="chart-filter-trigger"
                onClick={() => setShowOverviewDropdown(!showOverviewDropdown)}
              >
                <span>{timeRangeLabels[timeRangeOverview]}</span>
                <Icons.ChevronDown size={14} className="arrow" />
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
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border-light)"
                />
                <XAxis
                  dataKey="date"
                  stroke="var(--text-muted)"
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  fontSize={11}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  tickLine={false}
                  axisLine={false}
                  width={65}
                  fontSize={11}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-card)",
                    borderRadius: "12px",
                    border: "1px solid var(--border-light)",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                    color: "var(--text-dark)",
                    padding: "10px 14px",
                  }}
                  itemStyle={{ color: "#a855f7", fontWeight: "700" }}
                  formatter={(value) => [
                    `${currency} ${value.toFixed(0)}`,
                    "Amount",
                  ]}
                />
                <Area
                  type="linear"
                  dataKey="amount"
                  stroke="#a855f7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#purpleArea)"
                  dot={{
                    r: 5,
                    fill: "#a855f7",
                    stroke: "#fff",
                    strokeWidth: 1.5,
                  }}
                  activeDot={{
                    r: 7,
                    fill: "#a855f7",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="content-card">
          <div className="card-heading-bar" style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "700" }}>
              Categories
            </h3>
            <div className="chart-filter-dropdown-container">
              <button
                className="chart-filter-trigger"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <span>{timeRangeLabels[timeRangeCategory]}</span>
                <Icons.ChevronDown size={14} className="arrow" />
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
              <div className="donut-center-info">
                <h4>
                  {currency}
                  {totalCategoryExpense > 9999
                    ? (totalCategoryExpense / 1000).toFixed(0) + "k"
                    : totalCategoryExpense.toFixed(0)}
                </h4>
                <p>Total</p>
              </div>

              <ResponsiveContainer width={170} height={170}>
                <PieChart>
                  <Pie
                    data={categoryTotals}
                    innerRadius={55}
                    outerRadius={78}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="var(--bg-card)"
                    strokeWidth={3}
                  >
                    {categoryTotals.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                        style={{
                          filter: "drop-shadow(0px 4px 8px rgba(0,0,0,0.15))",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<CustomPieTooltip currency={currency} />}
                    cursor={{ fill: "transparent" }}
                    offset={30}
                    isAnimationActive={true}
                  />
                </PieChart>
              </ResponsiveContainer>
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
                    </strong>{" "}
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
              See All
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
                      {renderIcon(details.icon, 20)}
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
                    {item.amount.toFixed(0)}
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
              <h3>Today Breakdown</h3>
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
                      {renderIcon(details.icon, 20)}
                    </div>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.category}</p>
                    </div>
                  </div>
                  <div className="tx-price">
                    {currency}
                    {item.amount.toFixed(0)}
                  </div>
                </div>
              );
            })}
            {todayExpenses.length === 0 && (
              <p className="empty-txt">No expenses spent today.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
