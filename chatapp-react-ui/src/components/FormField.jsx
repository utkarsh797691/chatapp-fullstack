import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function FormField({ icon: Icon, type = "text", value, onChange, placeholder, autoComplete, name, required = true, minLength, maxLength }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  return (
    <label className="form-field">
      <Icon size={20} strokeWidth={1.9} aria-hidden="true" />
      <input
        type={isPassword && showPassword ? "text" : type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
      />
      {isPassword && (
        <button
          className="field-toggle"
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((visible) => !visible)}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </label>
  );
}
