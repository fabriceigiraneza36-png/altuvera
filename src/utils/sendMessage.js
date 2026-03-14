// src/utils/sendMessage.js
// Centralized utility for sending messages (contact, subscribe, etc.) to backend

export async function sendMessage({ type, data }) {
  // type: 'contact', 'subscribe', 'feedback', etc.
  // data: { name, email, subject, message, ... }
  try {
    const res = await fetch('/api/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...data }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return await res.json();
  } catch (err) {
    return { error: err.message || 'Network error' };
  }
}
