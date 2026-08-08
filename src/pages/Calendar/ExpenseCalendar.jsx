import React, { useState } from "react";
import "./ExpenseCalendar.css";

export default function ExpenseCalendar({
  transactions,
  currency = "₹",
  setActiveTab,
  setSelectedTxId,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayTransactions, setDayTransactions] = useState([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const formatDateString = (y, m, d) => {
    const mm = String(m + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  };

  const getDayExpense = (day) => {
    const dateStr = formatDateString(year, month, day);
    return transactions
      .filter((t) => t.date === dateStr || t.date?.startsWith(dateStr))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  };

  const handleDayClick = (day) => {
    const dateStr = formatDateString(year, month, day);
    const filtered = transactions.filter(
      (t) => t.date === dateStr || t.date?.startsWith(dateStr),
    );

    setSelectedDate(dateStr);
    setDayTransactions(filtered);
  };

  const handleTransactionClick = (txId) => {
    if (setSelectedTxId) {
      setSelectedTxId(txId);
    }
    if (setActiveTab) {
      setActiveTab("Transactions");
    }
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="page-wrapper">
      <div className="top-nav">
        <div className="top-nav-left">
          <h2>Expense Calendar</h2>
          <p>Click on any date to view detailed spending for that day</p>
        </div>
      </div>

      <div className="calendar-card">
        {/* Calendar Header */}
        <div className="calendar-header">
          <button className="cal-nav-btn" onClick={prevMonth}>
            &lt; Prev
          </button>
          <h3>
            {monthNames[month]} {year}
          </h3>
          <button className="cal-nav-btn" onClick={nextMonth}>
            Next &gt;
          </button>
        </div>

        {/* Week Days */}
        <div className="calendar-weekdays">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days Grid */}
        <div className="calendar-grid">
          {Array.from({ length: firstDayIndex }).map((_, index) => (
            <div key={`empty-${index}`} className="calendar-day empty"></div>
          ))}

          {Array.from({ length: totalDays }).map((_, index) => {
            const day = index + 1;
            const expense = getDayExpense(day);
            const isToday =
              day === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            return (
              <div
                key={day}
                className={`calendar-day ${isToday ? "today" : ""} ${
                  expense > 0 ? "has-expense" : ""
                }`}
                onClick={() => handleDayClick(day)}
                style={{ cursor: "pointer" }}
              >
                <span className="day-number">{day}</span>
                {expense > 0 ? (
                  <span className="day-expense">
                    {currency}
                    {expense.toLocaleString()}
                  </span>
                ) : (
                  <span className="no-expense">-</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div
          className="calendar-modal-overlay"
          onClick={() => setSelectedDate(null)}
        >
          <div
            className="calendar-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Transactions on {selectedDate}</h3>
              <button
                className="close-modal-btn"
                onClick={() => setSelectedDate(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {dayTransactions.length > 0 ? (
                <div className="day-tx-list">
                  {dayTransactions.map((tx, idx) => (
                    <div
                      key={tx.id || idx}
                      className="day-tx-item"
                      onClick={() => handleTransactionClick(tx.id)}
                      style={{
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      title="Click to view and highlight in Transactions"
                    >
                      <div className="tx-info-left">
                        <span className="tx-cat">
                          {tx.category || "General"}
                        </span>
                        <span className="tx-desc">
                          {tx.description || tx.title || "No description"}
                        </span>
                      </div>
                      <div className="tx-info-right">
                        <span
                          className="tx-amt"
                          style={{
                            color: tx.type === "income" ? "#10b981" : "#ef4444",
                          }}
                        >
                          {tx.type === "income" ? "+" : "-"}
                          {currency}
                          {Number(tx.amount).toLocaleString()}
                        </span>
                        <span className="tx-payment">
                          {tx.paymentMethod || "UPI"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-tx-text">
                  No expenses recorded on this date. 🎉
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
