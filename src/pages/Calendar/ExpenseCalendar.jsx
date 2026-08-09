import React, { useState } from "react";
import * as Icons from "lucide-react";
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

  const formatDateString = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

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
        <div className="calendar-header">
          <button
            className="cal-nav-btn"
            onClick={prevMonth}
            style={{ display: "flex", alignItems: "center", gap: "4px" }}
          >
            <Icons.ChevronLeft size={16} /> Prev
          </button>
          <h3>
            {monthNames[month]} {year}
          </h3>
          <button
            className="cal-nav-btn"
            onClick={nextMonth}
            style={{ display: "flex", alignItems: "center", gap: "4px" }}
          >
            Next <Icons.ChevronRight size={16} />
          </button>
        </div>

        <div className="calendar-weekdays">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

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
                className={`calendar-day ${isToday ? "today" : ""} ${expense > 0 ? "has-expense" : ""}`}
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
                <Icons.X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {dayTransactions.length > 0 ? (
                <div className="day-tx-list">
                  {dayTransactions.map((tx, idx) => (
                    <div
                      key={tx.id || idx}
                      className="day-tx-item"
                      onClick={() => {
                        setSelectedTxId(tx.id);
                        setActiveTab("Transactions");
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="tx-info-left">
                        <span className="tx-cat">
                          {tx.category || "General"}
                        </span>
                        <span className="tx-desc">
                          {tx.title || "No description"}
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
                          {tx.paymentMode || "UPI"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="no-tx-text"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <Icons.Smile size={32} color="#94a3b8" />
                  <p>No expenses recorded on this date.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
