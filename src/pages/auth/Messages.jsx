// src/pages/auth/Messages.jsx
import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "../../components/auth/DashboardLayout";
import { useConversations } from "../../hooks/useConversations";

const fmtTime = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

export default function Messages() {
  const {
    conversations, messages, activeId, activeConversation,
    unreadCount, loading, loadingMsgs, sending, error,
    openConversation, sendMessage, fetchConversations,
  } = useConversations();

  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const submit = async () => {
    const text = draft.trim();
    if (!text || !activeId || sending) return;
    setDraft("");
    await sendMessage(activeId, text);
  };

  const convTitle = (c) =>
    c.subject ||
    (c.bookingNumber ? `Booking ${c.bookingNumber}` : c.guestName) ||
    "Conversation";

  return (
    <>
      <Helmet><title>Messages | Altuvera</title></Helmet>

      <DashboardLayout title="Messages" subtitle="Chat with the Altuvera team about your bookings.">
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(240px, 320px) 1fr",
          gap: 16,
          height: "calc(100vh - 260px)",
          minHeight: 460,
        }}>
          {/* Conversation list */}
          <div style={{
            background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16,
            overflowY: "auto", display: "flex", flexDirection: "column",
          }}>
            <div style={{
              padding: "14px 16px", borderBottom: "1px solid #f1f5f9",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Conversations</h3>
              {unreadCount > 0 && (
                <span style={{
                  background: "#059669", color: "#fff", borderRadius: 999,
                  fontSize: 11, fontWeight: 700, padding: "1px 8px",
                }}>{unreadCount}</span>
              )}
            </div>

            {loading && conversations.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>Loading…</div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                No conversations yet. Submit a booking and we'll start one!
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openConversation(c.id)}
                  style={{
                    textAlign: "left", border: "none", cursor: "pointer",
                    padding: "12px 16px", background: c.id === activeId ? "#ecfdf5" : "#fff",
                    borderBottom: "1px solid #f1f5f9", borderLeft: c.id === activeId ? "3px solid #059669" : "3px solid transparent",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>
                      {convTitle(c)}
                    </span>
                    {c.unreadUser > 0 && (
                      <span style={{
                        background: "#ef4444", color: "#fff", borderRadius: 999,
                        fontSize: 10, fontWeight: 800, minWidth: 18, height: 18,
                        display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px",
                      }}>{c.unreadUser}</span>
                    )}
                  </div>
                  <p style={{
                    margin: "4px 0 0", fontSize: 12, color: "#64748b",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {c.lastMessage || "No messages yet"}
                  </p>
                </button>
              ))
            )}
          </div>

          {/* Chat window */}
          <div style={{
            background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16,
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            {!activeConversation ? (
              <div style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                color: "#94a3b8", textAlign: "center", padding: 24,
              }}>
                <div>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🗨️</div>
                  Select a conversation to start chatting with our team.
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{
                  padding: "14px 18px", borderBottom: "1px solid #f1f5f9",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "linear-gradient(135deg,#059669,#34d399)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 700,
                  }}>
                    {(activeConversation.guestName || "A").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>
                      {convTitle(activeConversation)}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                      {activeConversation.status === "closed" ? "Closed" : "Active"} · Altuvera Team
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div ref={scrollRef} style={{
                  flex: 1, overflowY: "auto", padding: 16,
                  display: "flex", flexDirection: "column", gap: 10,
                  background: "#f8fafc",
                }}>
                  {loadingMsgs && messages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#94a3b8" }}>Loading…</div>
                  ) : messages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#94a3b8" }}>
                      No messages yet — say hello! 👋
                    </div>
                  ) : (
                    messages.map((m) => {
                      const mine = m.senderType !== "admin";
                      return (
                        <div key={m.id} style={{
                          alignSelf: mine ? "flex-end" : "flex-start",
                          maxWidth: "78%",
                        }}>
                          <div style={{
                            padding: "10px 14px", borderRadius: 16,
                            background: mine ? "#059669" : "#fff",
                            color: mine ? "#fff" : "#0f172a",
                            border: mine ? "none" : "1px solid #e2e8f0",
                            fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap",
                            borderBottomRightRadius: mine ? 4 : 16,
                            borderBottomLeftRadius: mine ? 16 : 4,
                          }}>
                            {m.body}
                          </div>
                          <span style={{
                            fontSize: 10, color: "#94a3b8", marginTop: 3,
                            display: "block", textAlign: mine ? "right" : "left",
                          }}>
                            {m.senderName || (mine ? "You" : "Altuvera")} · {fmtTime(m.createdAt)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Composer */}
                <div style={{
                  padding: 12, borderTop: "1px solid #f1f5f9", display: "flex", gap: 8,
                }}>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault(); submit();
                      }
                    }}
                    rows={1}
                    placeholder="Type your message…"
                    style={{
                      flex: 1, resize: "none", fontSize: 14, padding: "10px 12px",
                      borderRadius: 12, border: "1.5px solid #e2e8f0", outline: "none",
                      fontFamily: "inherit", maxHeight: 120,
                    }}
                  />
                  <button
                    onClick={submit}
                    disabled={!draft.trim() || sending}
                    style={{
                      padding: "0 20px", borderRadius: 12, border: "none",
                      background: "#059669", color: "#fff", fontWeight: 700, fontSize: 14,
                      cursor: draft.trim() && !sending ? "pointer" : "not-allowed",
                      opacity: draft.trim() && !sending ? 1 : 0.5,
                    }}
                  >
                    {sending ? "…" : "Send"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {error && (
          <p style={{ color: "#dc2626", fontSize: 13, marginTop: 10 }}>{error}</p>
        )}

        <button
          onClick={fetchConversations}
          style={{
            marginTop: 10, fontSize: 13, color: "#059669", background: "transparent",
            border: "none", cursor: "pointer", fontWeight: 600,
          }}
        >
          ↻ Refresh
        </button>
      </DashboardLayout>
    </>
  );
}
