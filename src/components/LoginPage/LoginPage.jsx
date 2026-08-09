import React from "react";
import * as Icons from "lucide-react";
import "./LoginPage.css";

export default function LoginPage({
  handleGoogleLogin,
  handleEmailLogin,
  email,
  setEmail,
  emailSent,
  showEmailInput,
  setShowEmailInput,
}) {
  return (
    <div className="login-page">
      {/* Background Bubble Elements */}
      <div className="bubble bubble-1"></div>
      <div className="bubble bubble-2"></div>
      <div className="bubble bubble-3"></div>

      <div className="login-card">
        {/* LEFT SIDE: Brand & Auth Options */}
        <div className="login-form-side">
          <div className="login-form-inner">
            <div className="brand-header">
              <div className="logo-circle">
                <Icons.Wallet size={22} color="#4318FF" />
              </div>
              <span>ExpenseTracker</span>
            </div>

            <div className="auth-container">
              {emailSent ? (
                <div className="auth-step-msg">
                  <Icons.MailCheck size={40} color="#05cd99" />
                  <h3>Check your inbox!</h3>
                  <p>
                    Magic link sent to <b>{email}</b>. Click to log in securely.
                  </p>
                  <button
                    onClick={() => setEmailSent(false)}
                    className="btn-back"
                  >
                    Back to Login
                  </button>
                </div>
              ) : showEmailInput ? (
                <form onSubmit={handleEmailLogin} className="auth-form">
                  <h3>Continue with Email</h3>
                  <p>Enter your email to receive a sign-in link.</p>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-primary">
                    Send Magic Link
                  </button>
                  <button
                    type="button"
                    className="btn-back"
                    onClick={() => setShowEmailInput(false)}
                  >
                    Back to options
                  </button>
                </form>
              ) : (
                <div className="auth-options">
                  <h2>Sign in to your account</h2>
                  <p>Choose your preferred method below.</p>

                  <button onClick={handleGoogleLogin} className="btn-google">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                      alt="Google"
                      width="18"
                    />
                    Continue with Google
                  </button>

                  <div className="divider">
                    <span>OR</span>
                  </div>

                  <button
                    onClick={() => setShowEmailInput(true)}
                    className="btn-secondary"
                  >
                    <Icons.Mail size={18} /> Continue with Email
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Visual Guidance */}
        <div className="login-visual-side">
          <div className="visual-content">
            <div className="visual-header-row">
              <div className="floating-icon-box">
                <Icons.Zap size={20} color="white" />
              </div>
              <h2>How to get started?</h2>
            </div>
            <div className="guide-steps">
              <div className="step-row">
                <span className="step-num">1</span>
                <p>Select your preferred sign-in method.</p>
              </div>
              <div className="step-row">
                <span className="step-num">2</span>
                <p>Verify your email or account quickly.</p>
              </div>
              <div className="step-row">
                <span className="step-num">3</span>
                <p>Start tracking expenses in seconds!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
