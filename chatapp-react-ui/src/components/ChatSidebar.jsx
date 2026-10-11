import React from "react";
import { Search, SquarePen } from "lucide-react";
import Brand from "./Brand";
import Avatar from "./Avatar";

export default function ChatSidebar({
  contacts,
  activeId,
  onSelect,
  messages,
  search,
  onSearchChange,
  searchRef,
  mobileOpen,
  loading = false,
  onRefresh,
}) {
  const filtered = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <aside className={`chat-sidebar ${mobileOpen ? "chat-sidebar--open" : ""}`}>
      <div className="sidebar-brand-row">
        <Brand compact />
        <button
          className="icon-button sidebar-new-chat"
          type="button"
          aria-label="Refresh users and find a new chat"
          title="Refresh users and find a new chat"
          onClick={() => {
            onRefresh?.();
            searchRef.current?.focus();
          }}
        >
          <SquarePen size={21} strokeWidth={1.8} />
        </button>
      </div>
      <div className="chat-search">
        <Search size={20} strokeWidth={1.9} aria-hidden="true" />
        <input
          ref={searchRef}
          aria-label="Search users"
          type="search"
          placeholder="Search registered users..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <div className="contact-list" aria-label="Registered users">
        {loading && <p className="empty-search">Loading registered users...</p>}
        {!loading && filtered.map((contact) => {
          const history = messages[contact.id] || [];
          const last = history[history.length - 1];
          const preview = last?.text || "Start chatting";
          const previewText = last?.mine ? `You: ${preview}` : preview;
          const time = last?.time || "";
          return (
            <button
              className={`contact-row ${activeId === contact.id ? "contact-row--active" : ""}`}
              key={contact.id}
              type="button"
              onClick={() => onSelect(contact.id)}
              aria-current={activeId === contact.id ? "true" : undefined}
            >
              <Avatar initial={contact.initial} variant={contact.avatar} />
              <span className="contact-content">
                <span className="contact-title-line">
                  <span className="contact-name">{contact.name}</span>
                  <span className="contact-time">{time}</span>
                </span>
                <span className="contact-preview">{previewText}</span>
              </span>
            </button>
          );
        })}
        {!loading && filtered.length === 0 && (
          <p className="empty-search">
            {contacts.length === 0 ? "No other users are registered yet." : "No matching users found."}
          </p>
        )}
      </div>
    </aside>
  );
}
