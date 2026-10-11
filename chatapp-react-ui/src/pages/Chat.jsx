import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, LogOut, MoreVertical, Paperclip, Phone, Send, Smile, Video, X } from "lucide-react";
import Avatar from "../components/Avatar";
import ChatSidebar from "../components/ChatSidebar";
import MessageBubble from "../components/MessageBubble";
import { getUsers, startConversation, getMessages, sendMessage } from "../services/api";

const avatarColors = ["sky", "mint", "teal", "blue", "green", "indigo"];

function asContact(apiUser) {
  return {
    id: apiUser.id,
    name: apiUser.name || `User ${apiUser.id}`,
    initial: (apiUser.name || "U").charAt(0).toUpperCase(),
    avatar: avatarColors[apiUser.id % avatarColors.length],
    lastSeen: "", // Online presence isn't available from DRF yet.
  };
}

function asBubble(apiMessage, loggedInUserId) {
  return {
    id: apiMessage.id,
    text: apiMessage.text,
    mine: Number(apiMessage.sender) === Number(loggedInUserId),
    time: new Date(apiMessage.created_at).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    }),
    attachment: false,
  };
}

export default function Chat({ user, onLogout }) {
  const [contacts, setContacts] = useState([]);
  const [messagesByUser, setMessagesByUser] = useState({});
  const [activeId, setActiveId] = useState(null); // Selected registered user's ID
  const [conversationId, setConversationId] = useState(null); // Real database conversation ID
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [notice, setNotice] = useState("");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const chatEndRef = useRef(null);
  const searchRef = useRef(null);
  const selectionRequestRef = useRef(0);

  const contact = contacts.find((entry) => entry.id === activeId) || null;
  const currentMessages = activeId === null ? [] : (messagesByUser[activeId] || []);

  // STEP 1: Load REAL registered users from Django instead of seedContacts.
  const refreshUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const data = await getUsers();
      setContacts(data.users.map(asContact));
      setNotice("");
    } catch (error) {
      setNotice(`Cannot load registered users: ${error.message}`);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeId, currentMessages.length]);

  // STEP 2: Clicking a real user creates/finds a conversation and loads history.
  async function selectContact(userId) {
    const thisSelection = ++selectionRequestRef.current;
    setActiveId(userId);
    setConversationId(null);
    setMobileChatOpen(true);
    setShowEmoji(false);
    setShowMenu(false);
    setNotice("");
    setLoadingMessages(true);

    try {
      const { conversation } = await startConversation(userId);
      if (thisSelection !== selectionRequestRef.current) return;
      setConversationId(conversation.id);

      const data = await getMessages(conversation.id);
      if (thisSelection !== selectionRequestRef.current) return;
      setMessagesByUser((previous) => ({
        ...previous,
        [userId]: data.messages.map((message) => asBubble(message, user.id)),
      }));
    } catch (error) {
      if (thisSelection === selectionRequestRef.current) {
        setNotice(`Could not open chat: ${error.message}`);
      }
    } finally {
      if (thisSelection === selectionRequestRef.current) {
        setLoadingMessages(false);
      }
    }
  }

  // STEP 3: Refresh the selected conversation every 4 seconds (simple polling).
  useEffect(() => {
    if (!conversationId || activeId === null) return;
    let active = true;

    const timer = setInterval(async () => {
      try {
        const data = await getMessages(conversationId);
        if (!active) return;
        setMessagesByUser((previous) => ({
          ...previous,
          [activeId]: data.messages.map((message) => asBubble(message, user.id)),
        }));
      } catch {
        // Keep displaying the previous messages if a background refresh fails.
      }
    }, 4000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [conversationId, activeId, user.id]);

  // STEP 4: Send a real message using Django, then display its saved response.
  async function handleSend(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !conversationId || sending || activeId === null) return;

    const toUserId = activeId;
    const toConversationId = conversationId;
    setSending(true);
    try {
      const data = await sendMessage(toConversationId, text);
      setMessagesByUser((previous) => ({
        ...previous,
        [toUserId]: [
          ...(previous[toUserId] || []).filter((item) => item.id !== data.message.id),
          asBubble(data.message, user.id),
        ],
      }));
      setDraft("");
      setShowEmoji(false);
      setNotice("");
    } catch (error) {
      setNotice(`Message could not be sent: ${error.message}`);
    } finally {
      setSending(false);
    }
  }

  function showComingSoon(feature) {
    setNotice(`${feature} is not implemented in the backend yet.`);
    setShowMenu(false);
  }

  return (
    <main className="chat-page">
      <div className="chat-app">
        <ChatSidebar
          contacts={contacts}
          activeId={activeId}
          onSelect={selectContact}
          messages={messagesByUser}
          search={search}
          onSearchChange={setSearch}
          searchRef={searchRef}
          mobileOpen={!mobileChatOpen}
          loading={loadingUsers}
          onRefresh={refreshUsers}
        />

        <section
          className={`chat-main ${mobileChatOpen ? "chat-main--open" : ""}`}
          aria-label={contact ? `Conversation with ${contact.name}` : "Chat window"}
        >
          {contact ? (
            <>
              <header className="chat-header">
                <button className="icon-button mobile-back" type="button" aria-label="Back to contacts" onClick={() => setMobileChatOpen(false)}><ArrowLeft size={22} /></button>
                <Avatar initial={contact.initial} variant={contact.avatar} size="header" />
                <div className="chat-header__person">
                  <h1>{contact.name}</h1>
                  <span className="offline-text">Registered user</span>
                </div>
                <div className="chat-header__actions">
                  <button className="icon-button" aria-label="Voice call" title="Voice call" type="button" onClick={() => showComingSoon("Voice calls")}><Phone size={21} /></button>
                  <button className="icon-button" aria-label="Video call" title="Video call" type="button" onClick={() => showComingSoon("Video calls")}><Video size={22} /></button>
                  <div className="header-menu-holder">
                    <button className="icon-button" aria-label="More options" aria-expanded={showMenu} title="More options" type="button" onClick={() => setShowMenu((value) => !value)}><MoreVertical size={22} /></button>
                    {showMenu && (
                      <div className="header-menu">
                        <div className="header-menu__account">Signed in as <strong>{user?.name || "User"}</strong></div>
                        <button type="button" onClick={onLogout}><LogOut size={17} /> Logout</button>
                      </div>
                    )}
                  </div>
                </div>
              </header>

              {notice && <div className="chat-notice" role="status"><span>{notice}</span><button type="button" aria-label="Dismiss notice" onClick={() => setNotice("")}><X size={16} /></button></div>}

              <div className="chat-messages">
                <div className="date-chip">Messages</div>
                <div className="message-stack">
                  {currentMessages.map((message) => <MessageBubble message={message} key={message.id} />)}
                  {loadingMessages && <p className="empty-conversation">Loading messages...</p>}
                  {!loadingMessages && currentMessages.length === 0 && <p className="empty-conversation">Say hello to {contact.name}!</p>}
                  <div ref={chatEndRef} />
                </div>
              </div>

              <form className="chat-composer" onSubmit={handleSend}>
                {showEmoji && (
                  <div className="emoji-picker" role="group" aria-label="Choose emoji">
                    {["😀", "😊", "❤️", "👍", "🎉", "🚀"].map((emoji) => (
                      <button type="button" key={emoji} onClick={() => { setDraft((current) => `${current}${emoji}`); setShowEmoji(false); }}>{emoji}</button>
                    ))}
                  </div>
                )}
                <div className="composer-input-wrap">
                  <button className="icon-button" type="button" title="Attach file (coming later)" aria-label="Attach a file" onClick={() => showComingSoon("File attachments")}><Paperclip size={20} /></button>
                  <input type="text" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={conversationId ? "Type a message..." : "Opening conversation..."} aria-label="Type a message" maxLength={2000} disabled={!conversationId || sending} />
                  <button className="icon-button" type="button" title="Choose emoji" aria-expanded={showEmoji} aria-label="Choose emoji" onClick={() => setShowEmoji((value) => !value)}><Smile size={22} /></button>
                </div>
                <button className="send-button" type="submit" aria-label="Send message" title="Send message" disabled={!draft.trim() || !conversationId || sending}><Send size={21} fill="white" strokeWidth={1.7} /></button>
              </form>
            </>
          ) : (
            <div style={{ margin: "auto", padding: 24, textAlign: "center" }}>
              <h1 style={{ fontSize: 22 }}>Welcome to ChatApp</h1>
              <p className="empty-conversation">Choose a registered user from the sidebar to start chatting.</p>
              {notice && <p role="alert" className="form-error">{notice}</p>}
              <button type="button" className="text-link" onClick={onLogout}>Logout</button>
            </div>
          )}
        </section>
      </div>
      <p className="demo-caption">Connected to Django DRF + PostgreSQL · New messages checked every 4 seconds</p>
    </main>
  );
}
