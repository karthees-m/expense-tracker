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
import LoginPage from "./components/LoginPage/LoginPage"; 
import "./App.css";

const DEFAULT_CATEGORIES = [
  { id: "1", name: "Food & Dining", icon: "Utensils", color: "#4318FF" },
  { id: "2", name: "Transport", icon: "Car", color: "#39B8FF" },
  { id: "3", name: "Shopping", icon: "ShoppingBag", color: "#05CD99" },
  { id: "4", name: "Bills & Utilities", icon: "Zap", color: "#FFB547" },
  { id: "5", name: "Entertainment", icon: "Film", color: "#EE5D50" },
  { id: "6", name: "Lent to Friend", icon: "Users", color: "#868CFF" },
  { id: "7", name: "Others", icon: "Box", color: "#A3AED0" },
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
        .catch((error) => console.error("Error signing in:", error));
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.displayName) {
        setUserName(currentUser.displayName);
      } else if (!currentUser) {
        setExpenses([]); 
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
    if (!user || !user.uid) {
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
        if (error.code !== "permission-denied") {
          console.error("Error fetching expenses: ", error);
        }
      },
    );
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const qCat = query(collection(db, "custom_categories"));
    const unsubscribeCat = onSnapshot(
      qCat,
      (snapshot) => {
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
      },
      (err) => {
        if (err.code !== "permission-denied") console.error(err);
      },
    );
    return () => unsubscribeCat();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login failed:", err);
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
      alert("Error sending email: " + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      setExpenses([]); 
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
      <LoginPage
        handleGoogleLogin={handleGoogleLogin}
        handleEmailLogin={handleEmailLogin}
        email={email}
        setEmail={setEmail}
        emailSent={emailSent}
        setEmailSent={setEmailSent}
        showEmailInput={showEmailInput}
        setShowEmailInput={setShowEmailInput}
      />
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
