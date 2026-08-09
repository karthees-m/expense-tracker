import React, { useState, useEffect, useRef } from "react";
import { db } from "../../firebase";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import * as Icons from "lucide-react";
import "./Transactions.css";

const renderIcon = (iconName, size = 16) => {
  const IconCmp = Icons[iconName] || Icons.Tag;
  return <IconCmp size={size} />;
};

const EditTransactionModal = ({ tx, onClose, onSave, categories }) => {
  const [title, setTitle] = useState(tx.title);
  const [amount, setAmount] = useState(tx.amount);
  const [expenseType, setExpenseType] = useState(
    tx.expenseType ||
      (tx.category === "Lent to Friend" ? "Friend" : "Personal"),
  );
  const [category, setCategory] = useState(tx.category);
  const [friendName, setFriendName] = useState(tx.friendName || "");
  const [date, setDate] = useState(tx.date);
  const [paymentMode, setPaymentMode] = useState(tx.paymentMode || "UPI");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(tx.id, {
      title,
      amount: parseFloat(amount),
      category: expenseType === "Friend" ? "Lent to Friend" : category,
      expenseType,
      friendName: expenseType === "Friend" ? friendName : "",
      date,
      paymentMode,
    });
    setLoading(false);
  };

  return (
    <div className="tx-modal-backdrop" onClick={onClose}>
      <div className="tx-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="tx-modal-header">
          <div>
            <h3>Edit Transaction</h3>
            <p>Update your expense details below</p>
          </div>
          <button className="btn-close" onClick={onClose}>
            <Icons.X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="tx-modal-form">
          <div className="amount-hero-box">
            <span className="currency-symbol">₹</span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="amount-hero-input"
              required
            />
          </div>
          <div className="segmented-control">
            <button
              type="button"
              className={`segment-btn ${expenseType === "Personal" ? "active" : ""}`}
              onClick={() => setExpenseType("Personal")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                justifyContent: "center",
              }}
            >
              <Icons.User size={16} /> Personal
            </button>
            <button
              type="button"
              className={`segment-btn ${expenseType === "Friend" ? "active" : ""}`}
              onClick={() => setExpenseType("Friend")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                justifyContent: "center",
              }}
            >
              <Icons.Users size={16} /> Friend
            </button>
          </div>
          <div className="input-group">
            <label>Description / Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>
          {expenseType === "Friend" && (
            <div className="input-group slide-in">
              <label>Friend's Name</label>
              <input
                type="text"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                className="form-input highlight"
                required
              />
            </div>
          )}
          {expenseType === "Personal" && (
            <div className="input-group">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-input form-select"
              >
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="two-cols">
            <div className="input-group">
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="input-group">
              <label>Payment Method</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="form-input form-select"
              >
                <option value="UPI">UPI / GPay</option>
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
                <option value="NetBanking">Net Banking</option>
              </select>
            </div>
          </div>
          <div className="tx-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              {loading ? (
                "Updating..."
              ) : (
                <>
                  <Icons.Check size={18} /> Update
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Transactions({
  expenses,
  setShowModal,
  currency,
  categories,
  selectedTxId,
  setSelectedTxId,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [sortBy, setSortBy] = useState("date-desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  const [openCatDropdown, setOpenCatDropdown] = useState(false);
  const [openTypeDropdown, setOpenTypeDropdown] = useState(false);
  const [openSortDropdown, setOpenSortDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const catRef = useRef(null);
  const typeRef = useRef(null);
  const sortRef = useRef(null);
  const rowRefs = useRef({});

  const todayDisplayDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setShowExportMenu(false);
      if (catRef.current && !catRef.current.contains(event.target))
        setOpenCatDropdown(false);
      if (typeRef.current && !typeRef.current.contains(event.target))
        setOpenTypeDropdown(false);
      if (sortRef.current && !sortRef.current.contains(event.target))
        setOpenSortDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedTxId && rowRefs.current[selectedTxId]) {
      rowRefs.current[selectedTxId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      const timer = setTimeout(() => {
        if (setSelectedTxId) setSelectedTxId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [selectedTxId, setSelectedTxId]);

  const filtered = expenses
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.friendName &&
          item.friendName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCat =
        selectedCategory === "All" || item.category === selectedCategory;
      let matchesType = true;
      if (selectedType === "Personal")
        matchesType = item.category !== "Lent to Friend";
      if (selectedType === "Friend")
        matchesType = item.category === "Lent to Friend";
      let matchesDate = true;
      if (startDate) matchesDate = matchesDate && item.date >= startDate;
      if (endDate) matchesDate = matchesDate && item.date <= endDate;
      return matchesSearch && matchesCat && matchesType && matchesDate;
    })
    .sort((a, b) => {
      if (sortBy === "amount-desc") return b.amount - a.amount;
      if (sortBy === "amount-asc") return a.amount - b.amount;
      if (sortBy === "date-asc") return new Date(a.date) - new Date(b.date);
      return new Date(b.date) - new Date(a.date);
    });

  const totalFiltered = filtered.reduce((acc, curr) => acc + curr.amount, 0);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteDoc(doc(db, "expenses", id));
      } catch (err) {
        console.error("Error deleting:", err);
      }
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      await updateDoc(doc(db, "expenses", id), updatedData);
      setEditingTx(null);
    } catch (err) {
      alert("Failed to update transaction.");
    }
  };

  const sortLabels = {
    "date-desc": { label: "Newest First", icon: "CalendarDays" },
    "date-asc": { label: "Oldest First", icon: "CalendarClock" },
    "amount-desc": { label: "High to Low", icon: "ArrowDownUp" },
    "amount-asc": { label: "Low to High", icon: "ArrowUpDown" },
  };

  return (
    <div className="page-wrapper printable-area">
      <div className="top-nav no-print">
        <div className="top-nav-left">
          <h2>Transactions & Statement</h2>
          <p>Full audit trail of all recorded expenses</p>
        </div>
        <div className="top-nav-right">
          <div className="top-actions-row">
            <div
              className="date-pill"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Icons.Calendar size={16} /> {todayDisplayDate}
            </div>
            <div className="export-dropdown-container" ref={dropdownRef}>
              <button
                className="btn-export-main"
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                <Icons.Download size={18} /> Export{" "}
                <Icons.ChevronDown size={14} />
              </button>
              {showExportMenu && (
                <div className="export-dropdown-menu">
                  <button
                    onClick={() => window.print()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Icons.FileText size={16} /> Print / Save PDF
                  </button>
                </div>
              )}
            </div>
          </div>
          <button
            className="btn-primary-add"
            onClick={() => setShowModal(true)}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Icons.Plus size={18} /> Add Expense
          </button>
        </div>
      </div>

      <div className="tx-summary-compact">
        <div className="summary-box">
          <span>Total</span>
          <h3>
            {currency}{" "}
            {totalFiltered.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </h3>
        </div>
        <div className="summary-box">
          <span>Shown</span>
          <h3>{filtered.length}</h3>
        </div>
        <div className="summary-box">
          <span>All Time</span>
          <h3>{expenses.length}</h3>
        </div>
      </div>

      <div className="tx-filter-card no-print">
        <div className="filter-grid">
          <div className="filter-item search-grow">
            <label>Search Title / Friend</label>
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-item custom-dropdown-wrapper" ref={catRef}>
            <label>Category</label>
            <div
              className="custom-dropdown-trigger"
              onClick={() => setOpenCatDropdown(!openCatDropdown)}
            >
              <span
                className="truncate-text"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {selectedCategory === "All" ? (
                  <>
                    <Icons.List size={16} /> All Categories
                  </>
                ) : (
                  <>
                    {renderIcon(
                      categories.find((c) => c.name === selectedCategory)?.icon,
                    )}{" "}
                    {selectedCategory}
                  </>
                )}
              </span>
              <Icons.ChevronDown size={14} className="dropdown-arrow" />
            </div>
            {openCatDropdown && (
              <div className="custom-dropdown-options">
                <div
                  className={`custom-dropdown-option ${selectedCategory === "All" ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedCategory("All");
                    setOpenCatDropdown(false);
                  }}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Icons.List size={16} /> All Categories
                </div>
                {categories.map((c) => (
                  <div
                    key={c.name}
                    className={`custom-dropdown-option ${selectedCategory === c.name ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedCategory(c.name);
                      setOpenCatDropdown(false);
                    }}
                  >
                    {renderIcon(c.icon)} {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="filter-item custom-dropdown-wrapper" ref={typeRef}>
            <label>Type</label>
            <div
              className="custom-dropdown-trigger"
              onClick={() => setOpenTypeDropdown(!openTypeDropdown)}
            >
              <span
                className="truncate-text"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {selectedType === "All" ? (
                  <>
                    <Icons.Layers size={16} /> All Types
                  </>
                ) : selectedType === "Personal" ? (
                  <>
                    <Icons.User size={16} /> Personal
                  </>
                ) : (
                  <>
                    <Icons.Users size={16} /> Friend
                  </>
                )}
              </span>
              <Icons.ChevronDown size={14} className="dropdown-arrow" />
            </div>
            {openTypeDropdown && (
              <div className="custom-dropdown-options">
                <div
                  className={`custom-dropdown-option ${selectedType === "All" ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedType("All");
                    setOpenTypeDropdown(false);
                  }}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Icons.Layers size={16} /> All Types
                </div>
                <div
                  className={`custom-dropdown-option ${selectedType === "Personal" ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedType("Personal");
                    setOpenTypeDropdown(false);
                  }}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Icons.User size={16} /> Personal Only
                </div>
                <div
                  className={`custom-dropdown-option ${selectedType === "Friend" ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedType("Friend");
                    setOpenTypeDropdown(false);
                  }}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Icons.Users size={16} /> Lent to Friends
                </div>
              </div>
            )}
          </div>

          <div className="filter-item custom-dropdown-wrapper" ref={sortRef}>
            <label>Sort By</label>
            <div
              className="custom-dropdown-trigger"
              onClick={() => setOpenSortDropdown(!openSortDropdown)}
            >
              <span
                className="truncate-text"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {renderIcon(sortLabels[sortBy].icon)} {sortLabels[sortBy].label}
              </span>
              <Icons.ChevronDown size={14} className="dropdown-arrow" />
            </div>
            {openSortDropdown && (
              <div className="custom-dropdown-options">
                {Object.keys(sortLabels).map((key) => (
                  <div
                    key={key}
                    className={`custom-dropdown-option ${sortBy === key ? "selected" : ""}`}
                    onClick={() => {
                      setSortBy(key);
                      setOpenSortDropdown(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {renderIcon(sortLabels[key].icon)} {sortLabels[key].label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="filter-item">
            <label>From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="filter-item">
            <label>To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="print-report-header only-print">
        <div className="print-header-top">
          <div className="brand-print">
            <h2>💳 ExpenseTracker Financial Statement</h2>
            <p>Official Audit & Transaction Summary</p>
          </div>
          <div className="print-meta-box">
            <p>
              <strong>Statement Date:</strong> {todayDisplayDate}
            </p>
            <p>
              <strong>Generated At:</strong> {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="print-summary-banner">
          <div className="print-banner-col">
            <span>TOTAL EXPENDITURE</span>
            <h3>
              {currency}{" "}
              {totalFiltered.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </h3>
          </div>
          <div className="print-banner-col">
            <span>RECORDS COUNT</span>
            <h3>{filtered.length} Items</h3>
          </div>
          <div className="print-banner-col">
            <span>SORT ORDER</span>
            <h3>{sortBy.replace("-", " ").toUpperCase()}</h3>
          </div>
        </div>
      </div>

      <div className="tx-table-container">
        <table className="tx-table">
          <thead>
            <tr>
              <th className="col-date">Date</th>
              <th className="col-desc">Description</th>
              <th className="col-cat">Category</th>
              <th className="col-pay">Payment</th>
              <th className="col-type">Type / Friend</th>
              <th className="col-amount">Amount</th>
              <th className="col-action no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const catObj = categories.find((c) => c.name === item.category);
              const isHighlighted = item.id === selectedTxId;
              return (
                <tr
                  key={item.id}
                  ref={(el) => (rowRefs.current[item.id] = el)}
                  className={`transaction-row ${isHighlighted ? "highlighted" : ""}`}
                >
                  <td className="col-date date-cell">{item.date}</td>
                  <td className="col-desc desc-cell">
                    <strong>{item.title}</strong>
                  </td>
                  <td className="col-cat">
                    <span
                      className="cat-tag"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {renderIcon(catObj ? catObj.icon : "Tag")} {item.category}
                    </span>
                  </td>
                  <td className="col-pay">
                    <span className="pay-tag">{item.paymentMode || "UPI"}</span>
                  </td>
                  <td className="col-type">
                    {item.category === "Lent to Friend" ? (
                      <span
                        className="friend-badge"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Icons.Users size={14} /> {item.friendName || "Friend"}
                      </span>
                    ) : (
                      <span
                        className="personal-badge"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <Icons.User size={14} /> Personal
                      </span>
                    )}
                  </td>
                  <td className="col-amount amount-cell">
                    - {currency}
                    {item.amount.toFixed(2)}
                  </td>
                  <td className="col-action no-print">
                    <div className="action-btns">
                      <button
                        className="btn-edit"
                        onClick={() => setEditingTx(item)}
                        title="Edit Record"
                      >
                        <Icons.Edit2 size={16} />
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(item.id)}
                        title="Delete Record"
                      >
                        <Icons.Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="print-footer only-print">
        <p>
          This is a computer-generated audit statement from ExpenseTracker •
          Verified Records.
        </p>
      </div>

      {editingTx && (
        <EditTransactionModal
          tx={editingTx}
          categories={categories}
          onClose={() => setEditingTx(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}
