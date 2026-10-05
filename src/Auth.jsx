import { useState } from "react";
import { supabase } from "./lib/supabase";
import "./Auth.css";

export default function Auth() {
  const [mode, setMode] = useState("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const isSignUp = mode === "sign-up";

  function changeMode(nextMode) {
    setMode(nextMode);
    setMessage("");
    setMessageType("");
    setPassword("");
    setConfirmPassword("");
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage("Enter a valid email address.");
      setMessageType("error");
      return;
    }
    if (isSignUp && password.length < 8) {
      setMessage("Your password must be at least 8 characters.");
      setMessageType("error");
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setMessage("Your passwords do not match.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        setMessage(data.session
          ? "Your account is ready. You’re signing in now."
          : "Account created. Check your email to verify your address before signing in.");
        setMessageType("success");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      const isInvalidCredentials = !isSignUp &&
        /invalid login credentials|invalid credentials/i.test(error.message || "");
      setMessage(isInvalidCredentials
        ? "The email or password is incorrect. Please try again."
        : error.message || "We couldn’t complete your request. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-label="Syllabusaurus account">
        <div className="auth-brand-panel">
          <div className="auth-brand">
            <span className="auth-brand-mark" aria-hidden="true">S</span>
            <span>Syllabusaurus</span>
          </div>
          <div className="auth-brand-copy">
            <p className="auth-kicker">YOUR LEARNING, IN FOCUS</p>
            <h1>Make every study session count.</h1>
            <p className="auth-slogan">Syllabus Decoded, Success Delivered.</p>
          </div>
          <div className="auth-brand-footer">
            <span className="auth-status-dot" aria-hidden="true" />
            A clearer path from syllabus to success
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-mobile-brand">
            <span className="auth-brand-mark" aria-hidden="true">S</span>
            <span>Syllabusaurus</span>
          </div>
          <div className="auth-form-heading">
            <p className="auth-kicker">{isSignUp ? "GET STARTED" : "WELCOME BACK"}</p>
            <h2>{isSignUp ? "Create your account" : "Sign in to your account"}</h2>
            <p>{isSignUp
              ? "Set up your account to make learning feel more manageable."
              : "Pick up where you left off and keep moving forward."}</p>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Account access">
            <button
              id="sign-in-tab"
              type="button"
              role="tab"
              aria-selected={!isSignUp}
              aria-controls="auth-form"
              className={!isSignUp ? "is-active" : ""}
              onClick={() => changeMode("sign-in")}
            >
              Sign In
            </button>
            <button
              id="sign-up-tab"
              type="button"
              role="tab"
              aria-selected={isSignUp}
              aria-controls="auth-form"
              className={isSignUp ? "is-active" : ""}
              onClick={() => changeMode("sign-up")}
            >
              Create Account
            </button>
          </div>

          <form
            id="auth-form"
            className="auth-form"
            role="tabpanel"
            aria-labelledby={isSignUp ? "sign-up-tab" : "sign-in-tab"}
            onSubmit={submit}
          >
            <div className="auth-field">
              <label htmlFor="auth-email">Email address</label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                placeholder={isSignUp ? "At least 8 characters" : "Enter your password"}
                minLength={isSignUp ? 8 : undefined}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {isSignUp && (
              <div className="auth-field">
                <label htmlFor="auth-confirm-password">Confirm password</label>
                <input
                  id="auth-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter your password again"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
            )}
            {message && (
              <p className={`auth-message is-${messageType}`} role={messageType === "error" ? "alert" : "status"}>
                {message}
              </p>
            )}
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading
                ? (isSignUp ? "Creating account…" : "Signing in…")
                : (isSignUp ? "Create Account" : "Sign In")}
            </button>
          </form>
          <p className="auth-security-note">
            Your account is secured with Supabase authentication.
          </p>
        </div>
      </section>
    </main>
  );
}
