# Expense Tracker App : <a href = "https://expense-tracker-sites.vercel.app/">Link </a> 👈

A modern, secure, and responsive web application built to track daily expenses and income, powered by React, Vite, and Firebase.

## ✨ Features

- **Secure Authentication:** Support for Google Sign-In and Email/Password authentication via Firebase Auth.
- **Expense & Income Management:** Easily add, categorize, view, and delete transaction records.
- **Real-time Database:** Fast, secure, and persistent data storage using Firebase Firestore.
- **Responsive UI:** Clean and modern user interface optimized for both mobile and desktop viewports.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, JavaScript, CSS / Tailwind CSS
- **Backend & Database:** Firebase Authentication & Cloud Firestore
- **Deployment:** Netlify

## 🚀 Getting Started (Local Development)

To run this project locally on your machine, follow these simple steps:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/karthees-m/expense-tracker.git](https://github.com/karthees-m/expense-tracker.git)
   cd expense-tracker

   Install dependencies:
   npm install


2. **Create a .env file:**


   ```bash
     VITE_FIREBASE_API_KEY=your_api_key_here
     VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
     VITE_FIREBASE_PROJECT_ID=your_project_id_here
     VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
     VITE_FIREBASE_APP_ID=your_app_id_here

3. **Run the development server:**
    ```bash
      npm run dev
