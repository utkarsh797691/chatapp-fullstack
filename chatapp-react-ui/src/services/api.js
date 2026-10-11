const API_BASE_URL = "/api";

// Read a cookie by name
function getCookie(name) {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  return cookie
    ? decodeURIComponent(cookie.split("=").slice(1).join("="))
    : null;
}

// Ask Django to provide a CSRF cookie
async function ensureCsrfCookie() {
  const response = await fetch(`${API_BASE_URL}/csrf/`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error("Could not obtain CSRF cookie.");
  }
}

// Common function for all API requests
async function apiRequest(path, options = {}) {
  const method = options.method || "GET";
  const body = options.body;

  const headers = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  // Add CSRF header for unsafe HTTP methods
  if (!["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase())) {
    await ensureCsrfCookie();

    const token = getCookie("csrftoken");

    if (!token) {
      throw new Error("CSRF cookie missing. Check Vite proxy.");
    }

    headers["X-CSRFToken"] = token;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    credentials: "same-origin",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data.detail ||
      data.message ||
      Object.values(data).flat().join(" ") ||
      `HTTP Error ${response.status}`;

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

// Phase 1: Backend health check
export function getBackendStatus() {
  return apiRequest("/health/");
}

// Phase 2: Registration
export function registerUser(formData) {
  return apiRequest("/register/", {
    method: "POST",
    body: formData,
  });
}

// Phase 3: Login
export function loginUser(credentials) {
  return apiRequest("/login/", {
    method: "POST",
    body: credentials,
  });
}

// Phase 3: Current user
export function getCurrentUser() {
  return apiRequest("/me/");
}

// Phase 3: Logout
export function logoutUser() {
  return apiRequest("/logout/", {
    method: "POST",
  });
}
// Get available users
export function getUsers() {
  return apiRequest("/users/");
}

// Get logged-in user's conversations
export function getConversations() {
  return apiRequest("/conversations/");
}

// Create or find a conversation
export function startConversation(receiverId) {
  return apiRequest("/conversations/", {
    method: "POST",
    body: {
      receiver_id: receiverId,
    },
  });
}

// Read conversation messages
export function getMessages(conversationId) {
  return apiRequest(
    `/conversations/${conversationId}/messages/`
  );
}

// Send message
export function sendMessage(conversationId, text) {
  return apiRequest(
    `/conversations/${conversationId}/messages/`,
    {
      method: "POST",
      body: { text },
    }
  );
}