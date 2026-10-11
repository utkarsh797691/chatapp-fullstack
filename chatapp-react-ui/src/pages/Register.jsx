import { registerUser } from "../services/api";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, LockKeyhole, UserRound } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function changeField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
  }

  async function handleSubmit(event) {
  event.preventDefault();

  if (form.password !== form.confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  if (form.password.length < 8) {
    setError("Password must have at least 8 characters.");
    return;
  }

  try {
    setLoading(true);
    setError("");

    const data = await registerUser(form);

    console.log("Registration Response:", data);

    navigate("/login", {
      state: { registered: true },
      replace: true,
    });

  } catch (error) {
    setError(error.message);

  } finally {
    setLoading(false);
  }
}

  return (
    <AuthLayout mode="register">
      <section className="auth-content">
        <header className="auth-heading auth-heading--register">
          <h1>Create an Account</h1>
          <p>Join us and start chatting</p>
        </header>
        {error && <div className="form-error" role="alert">{error}</div>}

        <form className="auth-form auth-form--register" onSubmit={handleSubmit}>
          <FormField icon={UserRound} name="fullName" placeholder="Full Name" autoComplete="name" value={form.fullName} onChange={changeField} />
          <FormField icon={Mail} type="email" name="email" placeholder="Email address" autoComplete="email" value={form.email} onChange={changeField} />
          <FormField icon={LockKeyhole} type="password" name="password" placeholder="Password" autoComplete="new-password" minLength={8} value={form.password} onChange={changeField} />
          <FormField icon={LockKeyhole} type="password" name="confirmPassword" placeholder="Confirm Password" autoComplete="new-password" minLength={8} value={form.confirmPassword} onChange={changeField} />
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login">Login</Link></p>
      </section>
    </AuthLayout>
  );
}
