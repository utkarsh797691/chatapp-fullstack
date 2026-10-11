import React from "react";

export default function Avatar({ initial, variant = "sky", size = "normal" }) {
  return (
    <span className={`avatar avatar--${variant} avatar--${size}`} aria-hidden="true">
      {initial}
    </span>
  );
}
