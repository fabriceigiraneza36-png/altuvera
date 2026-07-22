// src/pages/auth/Messages.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "../../components/auth/DashboardLayout";
import { useConversations } from "../../hooks/useConversations";

const fmtTimeShort = (d) =>
  d ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";

export default function Messages() {
  const {
    conversations, messages, activeId, activeConversation,
    unreadCount, loading, loadingMsgs, sending, error,
    openConversation, sendMessage, fetchConversations,
  } = useConversations();

  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiRef = useRef(null);
  const [replyToId, setReplyToId] = useState(null);

  const quickEmojis = ["👍", "❤️", "😂", "🎉", "👏", "😮"];
  const reactionEmojis = ["👍", "❤️", "😂", "🎉"];

  useEffect(() => {
    const handler = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setReplyToId(null);
  }, [activeId]);

  const submit = async () => {
    const text = draft.trim();
    if (!text || !activeId || sending) return;
    const replyTo = replyToId;
    setDraft("");
    setReplyToId(null);
    await sendMessage(activeId, text, replyTo);
  };

  const convTitle = (c) =>
    c.subject ||
    (c.bookingNumber ? `Booking ${c.bookingNumber}` : c.guestName || c.userFullName) ||
    "Conversation";

  const replyMap = useMemo(() => {
    const map = new Map(messages.map((m) => [String(m.id), m]));
    return map;
  }, [messages]);

  const getReactions = (msg) => {
    const r = msg.reactions || {};
    const entries = Object.entries(r).filter(([, ids]) => Array.isArray(ids) && ids.length > 0);
    return entries.length > 0 ? entries : null;
  };

  const toggleReaction = useCallback(async (messageId, emoji) => {
    if (!activeId) return;
    const msg = messages.find((m) => String(m.id) === String(messageId));
    const currentReactions = msg && msg.reactions && msg.reactions[emoji] ? msg.reactions[emoji] : [];
    const isAdd = currentReactions.indexOf("user") === -1;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api"}/messages/conversations/${activeId}/messages/${messageId}/react`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("altuvera_auth_token") || ""}`,
          },
          body: JSON.stringify({ emoji, add: isAdd }),
        }
      );
      if (res.ok) {
        fetchConversations();
      }
    } catch { /* non-fatal */ }
  }, [activeId, messages, fetchConversations]);

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
              <div>
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
                      const reactions = getReactions(m);
                      return (
                        <div key={m.id} style={{
                          alignSelf: mine ? "flex-end" : "flex-start",
                          maxWidth: "78%",
                        }}>
                          <div style={{ display: "flex", flexDirection: "column", maxWidth: "100%" }}>
                            {m.replyToId && (
                              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2, paddingLeft: 10, borderLeft: "2px solid #cbd5e1" }}>
                                {(replyMap.get(String(m.replyToId)) && replyMap.get(String(m.replyToId)).senderName) ? replyMap.get(String(m.replyToId)).senderName : "Unknown"}: {(replyMap.get(String(m.replyToId)) && replyMap.get(String(m.replyToId)).body) ? replyMap.get(String(m.replyToId)).body.slice(0, 60) : ""}
                              </div>
                            )}
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
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                              <span style={{
                                fontSize: 10, color: "#94a3b8", marginTop: 3,
                                display: "block", textAlign: mine ? "right" : "left",
                              }}>
                                {m.senderName || (mine ? "You" : "Altuvera")} · {fmtTimeShort(m.createdAt)}
                              </span>
                              {mine && (
                                <span style={{ fontSize: 10, color: "#94a3b8" }}>
                                  {m.isRead ? "✓✓ Read" : "✓ Sent"}
                                </span>
                              )}
                            </div>
                            {reactions && (
                              <div style={{ display: "flex", gap: 2, marginTop: 2, flexWrap: "wrap" }}>
                                {reactions.map(([emoji, ids]) => (
                                  <span key={emoji} style={{
                                    background: "#f1f5f9", borderRadius: 8, padding: "1px 6px",
                                    fontSize: 12, border: "1px solid #e2e8f0",
                                  }}>{emoji} {ids.length}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: 2, marginTop: 2, flexDirection: mine ? "row-reverse" : "row" }}>
                            {reactionEmojis.map((emoji) => (
                              <button
                                key={emoji}
                                onMouseDown={(e) => { e.preventDefault(); toggleReaction(m.id, emoji); }}
                                style={{
                                  background: "transparent", border: "none", cursor: "pointer",
                                  fontSize: 14, opacity: 0.7, padding: "0 2px",
                                }}
                                title={"React " + emoji}
                              >{emoji}</button>
                            ))}
                            <button
                              onMouseDown={(e) => { e.preventDefault(); setReplyToId(m.id); }}
                              style={{
                                background: "transparent", border: "none", cursor: "pointer",
                                fontSize: 12, opacity: 0.7, padding: "0 4px", color: "#64748b",
                              }}
                              title="Reply"
                            >↩ Reply</button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Composer */}
                <div style={{
                  padding: 12, borderTop: "1px solid #f1f5f9", display: "flex", gap: 8, position: "relative", flexDirection: "column",
                }}>
                  {replyToId && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8,
                      background: "#f8fafc", padding: "6px 10px", borderRadius: 10,
                      border: "1px solid #e2e8f0",
                    }}>
                      <span style={{ fontSize: 11, color: "#64748b", flex: 1 }}>
                        Replying to: {(() => {
                          const r = replyMap.get(String(replyToId));
                          return r ? (r.senderName || "message") + " — " + (r.body || "").slice(0, 50) : "message";
                        })()}
                      </span>
                      <button onClick={() => setReplyToId(null)} style={{
                        background: "transparent", border: "none", color: "#94a3b8",
                        cursor: "pointer", fontSize: 14, padding: "0 4px",
                      }}>✕</button>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ position: "relative", flexShrink: 0 }} ref={emojiRef}>
                      <button
                        onClick={() => setShowEmojiPicker((p) => !p)}
                        style={{
                          padding: "0 12px", borderRadius: 12, border: "1.5px solid #e2e8f0",
                          background: "#fff", color: "#64748b", fontSize: 18, cursor: "pointer",
                        }}
                        title="Emoji"
                      >😊</button>
                      {showEmojiPicker && (
                        <div style={{
                          position: "absolute", bottom: "100%", left: 0, marginBottom: 6,
                          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
                          padding: 8, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 50,
                        }}>
                          {quickEmojis.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => { setDraft((p) => p + emoji); setShowEmojiPicker(false); }}
                              style={{
                                background: "transparent", border: "none", cursor: "pointer",
                                fontSize: 20, padding: 4, borderRadius: 6,
                              }}
                              onMouseEnter={(e) => e.target.style.background = "#f1f5f9"}
                              onMouseLeave={(e) => e.target.style.background = "transparent"}
                            >{emoji}</button>
                          ))}
                        </div>
                      )}
                    </div>
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
                </div>
              </div>
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
