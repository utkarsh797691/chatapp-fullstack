import React from "react";

/** Reusable brand mark shared by both forms and the chat sidebar. */
export default function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? "brand--compact" : ""}`}>
      <div className="brand__symbol" aria-hidden="true">
        <span className="brand__bubble brand__bubble--front" />
        <span className="brand__bubble brand__bubble--back" />
      </div>
      <div className="brand__copy">
        <div className="brand__name">Chat<span>App</span></div>
        {!compact && <p className="brand__tagline">Connect. Chat. Stay Together.</p>}
      </div>
    </div>
  );
}
