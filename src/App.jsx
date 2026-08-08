import React, { useState, useEffect } from "react";
import {
  db,
  auth,
  googleProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "./firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import Sidebar from "./components/Sidebar/Sidebar";
import Dashboard from "./pages/Dashboard/Dashboard";
import Transactions from "./pages/Transactions/Transactions";
import Categories from "./pages/Categories/Categories";
import Budgets from "./pages/Budgets/Budgets";
import Settings from "./pages/Settings/Settings";
import ExpenseCalendar from "./pages/Calendar/ExpenseCalendar";
import AddExpenseModal from "./components/AddModal/AddExpenseModal";
import "./App.css";

const DEFAULT_CATEGORIES = [
  { id: "1", name: "Food & Dining", icon: "🍔", color: "#4318FF" },
  { id: "2", name: "Transport", icon: "🚗", color: "#39B8FF" },
  { id: "3", name: "Shopping", icon: "🛍️", color: "#05CD99" },
  { id: "4", name: "Bills & Utilities", icon: "⚡", color: "#FFB547" },
  { id: "5", name: "Entertainment", icon: "🍿", color: "#EE5D50" },
  { id: "6", name: "Lent to Friend", icon: "🤝", color: "#868CFF" },
  { id: "7", name: "Others", icon: "📦", color: "#A3AED0" },
];

const DEFAULT_BUDGETS = {
  "Food & Dining": 10000,
  Transport: 8000,
  Shopping: 7000,
  "Bills & Utilities": 5000,
  Entertainment: 4000,
  "Lent to Friend": 5000,
  Others: 6000,
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [showModal, setShowModal] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  const [selectedTxId, setSelectedTxId] = useState(null);

  const [userName, setUserName] = useState(
    () => localStorage.getItem("et_userName") || "User",
  );
  const [theme, setTheme] = useState(
    () => localStorage.getItem("et_theme") || "light",
  );
  const [monthlyIncome, setMonthlyIncome] = useState(
    () => Number(localStorage.getItem("et_income")) || 50000,
  );
  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem("et_budgets");
    return saved ? JSON.parse(saved) : DEFAULT_BUDGETS;
  });

  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let emailForSignIn = window.localStorage.getItem("emailForSignIn");
      if (!emailForSignIn) {
        emailForSignIn = window.prompt(
          "Please provide your email for confirmation",
        );
      }
      signInWithEmailLink(auth, emailForSignIn, window.location.href)
        .then((result) => {
          window.localStorage.removeItem("emailForSignIn");
          setUser(result.user);
          window.history.replaceState(null, "", window.location.pathname);
        })
        .catch((error) => {
          console.error("Error signing in with email link:", error);
        });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.displayName) {
        setUserName(currentUser.displayName);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("et_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      return;
    }
    const q = query(
      collection(db, "expenses"),
      where("userId", "==", user.uid),
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        data.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });

        setExpenses(data);
      },
      (error) => {
        console.error("Error fetching expenses: ", error);
      },
    );
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const qCat = query(collection(db, "custom_categories"));
    const unsubscribeCat = onSnapshot(qCat, (snapshot) => {
      const customCats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      let combined = [...DEFAULT_CATEGORIES];
      customCats.forEach((c) => {
        const existingIdx = combined.findIndex(
          (item) =>
            item.id === c.id ||
            item.name.toLowerCase() === c.name.toLowerCase(),
        );
        if (existingIdx >= 0) {
          combined[existingIdx] = { ...combined[existingIdx], ...c };
        } else {
          combined.push(c);
        }
      });
      setCategories(combined);
    });
    return () => unsubscribeCat();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login failed:", err);
      alert("Google Login failed. Please try again.");
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      setEmailSent(true);
    } catch (err) {
      console.error(err);
      alert("Error sending email: " + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loadingAuth) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2rem",
          background: "var(--bg-canvas)",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#0b0f19",
          color: "#f8fafc",
          fontFamily: "inherit",
        }}
      >
        <div
          style={{
            background: "#111827",
            padding: "40px 32px",
            borderRadius: "24px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            border: "1px solid #1f2937",
            textAlign: "center",
            maxWidth: "420px",
            width: "90%",
          }}
        >
          {emailSent ? (
            <div>
              <h2 style={{ color: "#fff", marginBottom: "10px" }}>
                Check your email! 📧
              </h2>
              <p
                style={{
                  color: "#9ca3af",
                  marginBottom: "20px",
                  fontSize: "0.9rem",
                }}
              >
                We've sent a sign-in link to <strong>{email}</strong>.
              </p>
              <button
                onClick={() => setEmailSent(false)}
                style={{
                  background: "transparent",
                  color: "#39b8ff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                }}
              >
                Back to Login
              </button>
            </div>
          ) : showEmailInput ? (
            <form
              onSubmit={handleEmailLogin}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <h2
                style={{
                  color: "#fff",
                  marginBottom: "8px",
                  fontSize: "1.5rem",
                  fontWeight: "800",
                }}
              >
                Enter your email
              </h2>
              <p
                style={{
                  color: "#9ca3af",
                  fontSize: "0.85rem",
                  marginBottom: "10px",
                }}
              >
                We'll send a secure sign-in link to your inbox.
              </p>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  background: "#0b0f19",
                  border: "1px solid #374151",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  color: "#ffffff",
                  fontSize: "0.95rem",
                  outline: "none",
                  width: "100%",
                }}
              />
              <button
                type="submit"
                style={{
                  background: "#ffffff",
                  color: "#111827",
                  border: "none",
                  padding: "14px 20px",
                  borderRadius: "12px",
                  fontSize: "0.95rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  width: "100%",
                  transition: "background 0.2s",
                }}
              >
                Send Sign-In Link
              </button>
              <button
                type="button"
                onClick={() => setShowEmailInput(false)}
                style={{
                  background: "transparent",
                  color: "#6b7280",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  marginTop: "5px",
                }}
              >
                Back to options
              </button>
            </form>
          ) : (
            <div>
              <h2
                style={{
                  fontSize: "1.75rem",
                  fontWeight: "800",
                  marginBottom: "8px",
                  color: "#ffffff",
                }}
              >
                ExpenseTracker
              </h2>
              <p
                style={{
                  color: "#9ca3af",
                  marginBottom: "28px",
                  fontSize: "0.9rem",
                }}
              >
                Manage your personal finances securely.
              </p>

              <button
                onClick={handleGoogleLogin}
                style={{
                  background: "#1f2937",
                  color: "#ffffff",
                  border: "1px solid #374151",
                  padding: "14px 20px",
                  borderRadius: "12px",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  transition: "background 0.2s",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.7 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                Continue with Google
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "20px 0",
                  color: "#6b7280",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                <span
                  style={{ flex: 1, height: "1px", background: "#1f2937" }}
                ></span>
                <span style={{ padding: "0 12px" }}>OR</span>
                <span
                  style={{ flex: 1, height: "1px", background: "#1f2937" }}
                ></span>
              </div>

              <button
                onClick={() => setShowEmailInput(true)}
                style={{
                  background: "#ffffff",
                  color: "#111827",
                  border: "none",
                  padding: "14px 20px",
                  borderRadius: "12px",
                  fontSize: "0.95rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  width: "100%",
                  transition: "background 0.2s",
                }}
              >
                Continue with email
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case "Dashboard":
        return (
          <Dashboard
            expenses={expenses}
            setShowModal={setShowModal}
            currency="₹"
            userName={userName}
            setActiveTab={setActiveTab}
            categories={categories}
            monthlyIncome={monthlyIncome}
          />
        );
      case "Transactions":
        return (
          <Transactions
            expenses={expenses}
            setShowModal={setShowModal}
            currency="₹"
            categories={categories}
            selectedTxId={selectedTxId}
            setSelectedTxId={setSelectedTxId}
          />
        );
      case "Categories":
        return (
          <Categories
            expenses={expenses}
            currency="₹"
            categories={categories}
            setCategories={setCategories}
          />
        );
      case "Budgets":
        return (
          <Budgets
            expenses={expenses}
            budgets={budgets}
            setBudgets={setBudgets}
            currency="₹"
            categories={categories}
          />
        );
      case "Calendar":
        return (
          <ExpenseCalendar
            transactions={expenses}
            currency="₹"
            setActiveTab={setActiveTab}
            setSelectedTxId={setSelectedTxId}
          />
        );
      case "Settings":
        return (
          <Settings
            userName={userName}
            setUserName={setUserName}
            theme={theme}
            setTheme={setTheme}
            monthlyIncome={monthlyIncome}
            setMonthlyIncome={setMonthlyIncome}
            expenses={expenses}
            handleLogout={handleLogout}
          />
        );
      default:
        return (
          <Dashboard
            expenses={expenses}
            setShowModal={setShowModal}
            currency="₹"
            userName={userName}
            setActiveTab={setActiveTab}
            categories={categories}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      <main className="main-content">
        <div className="blue-backdrop"></div>
        {renderActivePage()}
      </main>

      {showModal && (
        <AddExpenseModal
          closeModal={() => setShowModal(false)}
          categories={categories}
          user={user}
        />
      )}
    </div>
  );
}
