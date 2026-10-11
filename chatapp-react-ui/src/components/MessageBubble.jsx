import React from "react";
import { CheckCheck, Paperclip } from "lucide-react";

export default function MessageBubble({ message }) {
  return (
    <div className={`message-row ${message.mine ? "message-row--mine" : ""}`}>
      <div className={`message-bubble ${message.mine ? "message-bubble--mine" : ""}`}>
        {message.attachment ? (
          <div className="attachment-label"><Paperclip size={16} /><span>{message.text}</span></div>
        ) : <p>{message.text}</p>}
        <span className="message-meta">
          {message.time}
          {message.mine && <CheckCheck size={16} className="read-check" aria-label="Sent" />}
        </span>
      </div>
    </div>
  );
}
