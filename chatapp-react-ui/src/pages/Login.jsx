import React, { useState } from "react";
import { loginUser } from "../services/api";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, LockKeyhole } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  //  useEffect(() => {
  //   getBackendStatus()
  //     .then((data) => {
  //       console.log("Backend Response:", data);
  //     })
  //     .catch((error) => {
  //       console.error("API Error:", error);
  //     });
  // }, []);
async function handleSubmit(event) {
  event.preventDefault();

  if (!email.trim() || !password.trim()) {
    setError("Please enter your email and password.");
    return;
  }

  try {
    setLoading(true);
    setError("");

    const data = await loginUser({
      email: email.trim(),
      password: password,
      remember: remember,
    });

    // Save authenticated user in React state
    onLogin(data.user);

    // Navigate to protected Chat page
    navigate("/chat", { replace: true });

  } catch (error) {
    setError(error.message);

  } finally {
    setLoading(false);
  }
}

  return (
    <AuthLayout mode="login">
      <section className="auth-content">
        <header className="auth-heading">
          <h1>Welcome Back</h1>
          <p>Login to your account</p>
        </header>

        {location.state?.registered && (
          <div className="form-success" role="status">Account created successfully. Please log in.</div>
        )}
        {error && <div className="form-error" role="alert">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <FormField
            icon={Mail}
            type="email"
            name="email"
            placeholder="Email address"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
          />
          <FormField
            icon={LockKeyhole}
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
          />

          <div className="form-extras">
            <label className="remember-me">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span>Remember me</span>
            </label>
            <button type="button" className="text-link" onClick={() => setError("Password reset will be connected when we build the Django backend.")}>Forgot password?</button>
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="auth-footer">Don't have an account? <Link to="/register">Sign up</Link></p>
      </section>
    </AuthLayout>
  );
}
