import React, { useState, useEffect, useRef } from "react";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import * as Icons from "lucide-react";
import "./AddExpenseModal.css";

const renderIcon = (iconName, size = 18) => {
  const IconCmp = Icons[iconName] || Icons.Tag;
  return <IconCmp size={size} />;
};

export default function AddExpenseModal({ closeModal, categories, user }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseType, setExpenseType] = useState("Expense");
  const [category, setCategory] = useState(
    categories[0]?.name || "Food & Dining",
  );
  const [friendName, setFriendName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMode, setPaymentMode] = useState(() => {
    return localStorage.getItem("et_default_payment") || "UPI";
  });
  const [loading, setLoading] = useState(false);

  const [openCatDropdown, setOpenCatDropdown] = useState(false);
  const [openPayDropdown, setOpenPayDropdown] = useState(false);

  const catRef = useRef(null);
  const payRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (catRef.current && !catRef.current.contains(event.target)) {
        setOpenCatDropdown(false);
      }
      if (payRef.current && !payRef.current.contains(event.target)) {
        setOpenPayDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const paymentOptions = [
    { value: "UPI", label: "UPI / GPay", icon: "Smartphone" },
    { value: "Card", label: "Credit / Debit Card", icon: "CreditCard" },
    { value: "Cash", label: "Cash", icon: "Banknote" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.uid) {
      alert("Please login first to save expenses!");
      return;
    }
    if (!title.trim() || !amount) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "expenses"), {
        title: title.trim(),
        amount: parseFloat(amount),
        category: expenseType === "Friend" ? "Lent to Friend" : category,
        expenseType,
        friendName: expenseType === "Friend" ? friendName.trim() : "",
        date,
        paymentMode,
        userId: user.uid,
        createdAt: new Date(),
      });
      closeModal();
    } catch (err) {
      console.error("Error saving expense: ", err);
      alert("Error saving expense: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c.name === category);
  const selectedPaymentObj = paymentOptions.find(
    (p) => p.value === paymentMode,
  );

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Add New Expense</h3>
            <p>Record your spending details</p>
          </div>
          <button className="btn-close" onClick={closeModal} type="button">
            <Icons.X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="amount-hero-box">
            <span className="currency-symbol">₹</span>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="amount-hero-input"
              required
            />
          </div>

          <div className="segmented-control">
            <button
              type="button"
              className={`segment-btn ${expenseType === "Expense" ? "active" : ""}`}
              onClick={() => setExpenseType("Expense")}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  justifyContent: "center",
                }}
              >
                <Icons.User size={16} /> Regular
              </div>
            </button>
            <button
              type="button"
              className={`segment-btn ${expenseType === "Friend" ? "active" : ""}`}
              onClick={() => setExpenseType("Friend")}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  justifyContent: "center",
                }}
              >
                <Icons.Users size={16} /> Lent to Friend
              </div>
            </button>
          </div>

          <div className="input-group">
            <label>Expense Title</label>
            <input
              type="text"
              placeholder="e.g., Grocery, Petrol, Lunch"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {expenseType === "Friend" ? (
            <div className="input-group">
              <label>Friend's Name</label>
              <input
                type="text"
                placeholder="Enter friend's name"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                className="form-input"
                required
              />
            </div>
          ) : (
            <div
              className="input-group modal-custom-dropdown-wrapper"
              ref={catRef}
            >
              <label>Category</label>
              <div
                className="modal-custom-dropdown-trigger"
                onClick={() => setOpenCatDropdown(!openCatDropdown)}
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {selectedCategoryObj
                    ? renderIcon(selectedCategoryObj.icon)
                    : renderIcon("Tag")}
                  {selectedCategoryObj
                    ? selectedCategoryObj.name
                    : "Select Category"}
                </span>
                <Icons.ChevronDown size={16} className="modal-dropdown-arrow" />
              </div>
              {openCatDropdown && (
                <div className="modal-custom-dropdown-options">
                  {categories.map((cat) => (
                    <div
                      key={cat.id || cat.name}
                      className={`modal-custom-dropdown-option ${category === cat.name ? "selected" : ""}`}
                      onClick={() => {
                        setCategory(cat.name);
                        setOpenCatDropdown(false);
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center" }}>
                        {renderIcon(cat.icon)}
                      </span>{" "}
                      {cat.name}
                    </div>
                  ))}
                </div>
              )}
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
            <div
              className="input-group modal-custom-dropdown-wrapper"
              ref={payRef}
            >
              <label>Payment Mode</label>
              <div
                className="modal-custom-dropdown-trigger"
                onClick={() => setOpenPayDropdown(!openPayDropdown)}
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {selectedPaymentObj
                    ? renderIcon(selectedPaymentObj.icon)
                    : renderIcon("Smartphone")}
                  {selectedPaymentObj
                    ? selectedPaymentObj.label
                    : "Select Mode"}
                </span>
                <Icons.ChevronDown size={16} className="modal-dropdown-arrow" />
              </div>
              {openPayDropdown && (
                <div className="modal-custom-dropdown-options">
                  {paymentOptions.map((opt) => (
                    <div
                      key={opt.value}
                      className={`modal-custom-dropdown-option ${paymentMode === opt.value ? "selected" : ""}`}
                      onClick={() => {
                        setPaymentMode(opt.value);
                        setOpenPayDropdown(false);
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center" }}>
                        {renderIcon(opt.icon)}
                      </span>{" "}
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={closeModal}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                justifyContent: "center",
              }}
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <Icons.Check size={18} /> Save Expense
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
