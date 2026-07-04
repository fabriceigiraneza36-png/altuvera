// src/pages/auth/UserMessages.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useUserAuth } from "../../context/UserAuthContext";
import DashboardLayout from "../../components/auth/DashboardLayout";
import { connectSocket, getSocket } from "../../utils/socket";
import {
  FiSend, FiRefreshCw, FiMessageSquare,
} from "react-icons/fi";

const css = `
  .msg-root * { box-sizing: border-box; }
  .msg-root { display: flex; flex-direction: column; gap: 1.25rem; animation: msgFade 0.5s ease-out; }

  .msg-hero {
    background: linear-gradient(135deg, #0c4a6e 0%, #075985 50%, #0284c7 100%);
    border-radius: 20px; padding: 1.75rem 2rem; position: relative; overflow: hidden;
  }
  .msg-hero-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.6rem; font-weight: 800; color: #fff; margin: 0 0 4px; z-index: 1; position: relative;
  }
  .msg-hero-sub { color: rgba(255,255,255,0.7); font-size: 0.88rem; margin: 0; position: relative; z-index: 1; }

  /* ── Chat container ── */
  .msg-chat-wrap {
    background: #fff; border-radius: 18px; border: 1.5px solid #e2e8f0;
    box-shadow: 0 2px 10px rgba(0,0,0,0.04); overflow: hidden;
    display: flex; flex-direction: column; height: 520px;
  }
  .msg-chat-header {
    padding: 14px 20px; border-bottom: 1px solid #f1f5f9;
    background: #f8fafc; display: flex; align-items: center; justify-content: space-between;
  }
  .msg-chat-title {
    font-size: 0.9rem; font-weight: 800; color: #0f172a; margin: 0;
    display: flex; align-items: center; gap: 8px;
  }
  .msg-online-dot {
    width: 8px; height: 8px; border-radius: 50%; background: #059669;
    animation: msgPulse 2s infinite;
  }
  .msg-messages {
    flex: 1; overflow-y: auto; padding: 16px 20px;
    display: flex; flex-direction: column; gap: 10px;
    background: #f8fafc;
  }
  .msg-messages::-webkit-scrollbar { width: 4px; }
  .msg-messages::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

  /* ── Bubbles ── */
  .msg-bubble-wrap {
    display: flex; flex-direction: column;
  }
  .msg-bubble-wrap.user { align-items: flex-end; }
  .msg-bubble-wrap.admin { align-items: flex-start; }
  .msg-bubble {
    max-width: 75%; padding: 10px 14px; border-radius: 14px;
    font-size: 0.88rem; line-height: 1.6; word-break: break-word;
  }
  .msg-bubble.user {
    background: linear-gradient(135deg, #059669, #047857);
    color: #fff; border-bottom-right-radius: 4px;
  }
  .msg-bubble.admin {
    background: #fff; color: #0f172a;
    border: 1px solid #e2e8f0; border-bottom-left-radius: 4px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }
  .msg-bubble-meta {
    font-size: 0.68rem; color: #94a3b8; margin-top: 3px; padding: 0 2px;
  }
  .msg-bubble-sender {
    font-size: 0.72rem; font-weight: 700; color: #64748b; margin-bottom: 3px; padding: 0 2px;
  }

  /* ── Input ── */
  .msg-input-wrap {
    padding: 14px 16px; border-top: 1px solid #f1f5f9; background: #fff;
    display: flex; gap: 10px; align-items: flex-end;
  }
  .msg-textarea {
    flex: 1; border: 1.5px solid #e2e8f0; border-radius: 12px;
    padding: 10px 14px; font-size: 0.88rem; font-family: inherit;
    resize: none; outline: none; min-height: 42px; max-height: 120px;
    transition: border-color 0.2s; line-height: 1.5; background: #f8fafc;
  }
  .msg-textarea:focus { border-color: #059669; background: #fff; }
  .msg-send-btn {
    width: 42px; height: 42px; border-radius: 12px; border: none;
    background: linear-gradient(135deg,#059669,#047857);
    color: #fff; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s; flex-shrink: 0;
    box-shadow: 0 3px 10px rgba(5,150,105,0.3);
  }
  .msg-send-btn:hover { transform: scale(1.05); }
  .msg-send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* ── Typing ── */
  .msg-typing {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 14px; font-size: 0.78rem; color: #94a3b8;
  }
  .msg-typing-dots span {
    display: inline-block; width: 6px; height: 6px; border-radius: 50%;
    background: #94a3b8; animation: msgBounce 1.2s infinite;
  }
  .msg-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
  .msg-typing-dots span:nth-child(3) { animation-delay: 0.4s; }

  /* ── Empty ── */
  .msg-empty {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    color: #94a3b8; text-align: center; padding: 32px;
  }
  .msg-empty-icon { font-size: 2.5rem; margin-bottom: 10px; }
  .msg-empty p { margin: 0; font-size: 0.88rem; }

  @keyframes msgFade   { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
  @keyframes msgPulse  { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
  @keyframes msgBounce { 0%,80%,100%{transform:scale(0.9); opacity:0.5;} 40%{transform:scale(1.2); opacity:1;} }
  .msg-spin { animation: msgSpin 1s linear infinite; }
  @keyframes msgSpin   { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
`;

function formatTime(d) {
  if (!d) return "";
  const dt = new Date(d);
  const now = new Date();
  const diff = now - dt;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function UserMessages() {
  const { user } = useUserAuth();
  const [messages,  setMessages]  = useState([]);
  const [text,      setText]      = useState("");
  const [sending,   setSending]   = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const [isTyping,  setIsTyping]  = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [convId,    setConvId]    = useState(null);
  const [connected, setConnected] = useState(false);

  const bottomRef  = useRef(null);
  const socketRef  = useRef(null);
  const typingRef  = useRef(null);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Connect socket
  useEffect(() => {
    if (!user) return;
    let socket;
    try {
      socket = connectSocket();
      socketRef.current = socket;
    } catch { return; }

    const sid = `user-${user.id || user.email}-${Date.now()}`;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("msg:register", {
        sessionId: sid,
        name:  user.fullName || user.name || "Guest",
        email: user.email,
      }, (res) => {
        if (res?.success) {
          setSessionId(res.sessionId || sid);
          setConvId(res.conversationId);
          setAdminOnline(res.adminOnline || false);
          setMessages(res.messages || []);
        }
      });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("msg:message", (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setIsTyping(false);
    });

    socket.on("msg:session", (data) => {
      setAdminOnline(data.adminOnline || false);
      setMessages(data.messages || []);
      setSessionId(data.sessionId);
      setConvId(data.conversationId);
    });

    socket.on("msg:typing", (data) => {
      if (data.senderType === "admin") setIsTyping(data.isTyping);
    });

    socket.on("msg:admin-online", ({ online }) => setAdminOnline(online));

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("msg:message");
      socket.off("msg:session");
      socket.off("msg:typing");
      socket.off("msg:admin-online");
    };
  }, [user]);

  const handleSend = useCallback(() => {
    const body = text.trim();
    if (!body || !socketRef.current) return;
    setSending(true);

    socketRef.current.emit(
      "msg:send",
      {
        body,
        sessionId,
        name:  user?.fullName || user?.name || "Guest",
        email: user?.email,
      },
      (res) => {
        setSending(false);
        if (res?.success) {
          setText("");
        }
      },
    );

    // Optimistic
    setMessages((prev) => [
      ...prev,
      {
        id:         `opt-${Date.now()}`,
        senderType: "user",
        senderName: user?.fullName || "You",
        body,
        createdAt:  new Date().toISOString(),
      },
    ]);
    setText("");
    setSending(false);
  }, [text, sessionId, user]);

  const handleTyping = useCallback((e) => {
    setText(e.target.value);
    if (!socketRef.current || !convId) return;
    socketRef.current.emit("msg:typing", {
      conversationId: convId,
      isTyping: true,
      senderName: user?.fullName || "Guest",
    });
    if (typingRef.current) clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => {
      socketRef.current?.emit("msg:typing", {
        conversationId: convId,
        isTyping: false,
      });
    }, 1500);
  }, [convId, user]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <Helmet>
        <title>Messages | Altuvera</title>
      </Helmet>
      <DashboardLayout
        title="Messages"
        subtitle="Chat directly with the Altuvera support team."
      >
        <style>{css}</style>
        <div className="msg-root">

          <div className="msg-hero">
            <div style={{ fontSize: "2rem", marginBottom: 8, position: "relative", zIndex: 1 }}>💬</div>
            <h1 className="msg-hero-title">Live Support Chat</h1>
            <p className="msg-hero-sub">
              Our team is here to help you plan the perfect adventure
            </p>
          </div>

          {/* Chat Window */}
          <div className="msg-chat-wrap">
            <div className="msg-chat-header">
              <h3 className="msg-chat-title">
                <FiMessageSquare size={15} color="#0284c7" />
                Altuvera Support
                {adminOnline && <div className="msg-online-dot" />}
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  fontSize: "0.75rem", fontWeight: 700,
                  color: adminOnline ? "#059669" : "#94a3b8",
                }}>
                  {adminOnline ? "🟢 Online" : "⚫ Offline"}
                </span>
                <span style={{
                  fontSize: "0.72rem", color: connected ? "#059669" : "#dc2626",
                  fontWeight: 700,
                }}>
                  {connected ? "Connected" : "Reconnecting…"}
                </span>
              </div>
            </div>

            <div className="msg-messages">
              {messages.length === 0 ? (
                <div className="msg-empty">
                  <div className="msg-empty-icon">💬</div>
                  <p>Start a conversation with our team.<br />
                  We typically reply within minutes.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`msg-bubble-wrap ${msg.senderType === "user" ? "user" : "admin"}`}
                  >
                    {msg.senderType !== "user" && (
                      <div className="msg-bubble-sender">
                        {msg.senderName || "Altuvera Team"}
                      </div>
                    )}
                    <div className={`msg-bubble ${msg.senderType === "user" ? "user" : "admin"}`}>
                      {msg.body}
                    </div>
                    <div className="msg-bubble-meta">
                      {formatTime(msg.createdAt)}
                    </div>
                  </div>
                ))
              )}
              {isTyping && (
                <div className="msg-typing">
                  <span>Support is typing</span>
                  <div className="msg-typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="msg-input-wrap">
              <textarea
                className="msg-textarea"
                placeholder="Type your message… (Enter to send)"
                value={text}
                onChange={handleTyping}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={!connected}
              />
              <button
                className="msg-send-btn"
                onClick={handleSend}
                disabled={!text.trim() || sending || !connected}
                title="Send message"
              >
                {sending
                  ? <FiRefreshCw size={16} className="msg-spin" />
                  : <FiSend size={16} />
                }
              </button>
            </div>
          </div>

          {/* Info */}
          <div style={{
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: 14, padding: "14px 18px",
            fontSize: "0.85rem", color: "#166534", fontWeight: 600,
          }}>
            💡 You can also{" "}
            <a href="/contact" style={{ color: "#059669" }}>send us a contact form</a>
            {" "}or email us directly for non-urgent inquiries.
          </div>

        </div>
      </DashboardLayout>
    </>
  );
}