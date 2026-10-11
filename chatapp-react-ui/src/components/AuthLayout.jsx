import React from "react";
import Brand from "./Brand";

export default function AuthLayout({ children, mode }) {
  return (
    <main className={`auth-page auth-page--${mode}`}>
      <div className="auth-card">
        <Brand />
        {children}
      </div>
      <div className="auth-background-glow auth-background-glow--left" aria-hidden="true" />
      <div className="auth-background-glow auth-background-glow--right" aria-hidden="true" />
    </main>
  );
}
