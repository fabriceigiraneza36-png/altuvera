import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";

const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const socketUrl = import.meta.env.VITE_SOCKET_URL;
  if (socketUrl) return socketUrl.replace(/\/?$/, "");
  return apiUrl.replace(/\/api\/?$/, "");
};

const CHAT_SESSION_KEY = "altuvera_chat_session_id";
const AUTH_TOKEN_KEY = "altuvera_auth_token";

export const useChatSocket = () => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(
    () => window.localStorage.getItem(CHAT_SESSION_KEY) || "",
  );
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  const socketUrl = useMemo(() => getSocketUrl(), []);

  useEffect(() => {
    const socket = io(socketUrl, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      auth: {
        token: window.localStorage.getItem(AUTH_TOKEN_KEY) || undefined,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setError(null);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      setError(err?.message || "Unable to connect to chat");
    });

    socket.on("chat:session", (payload) => {
      if (payload?.sessionId) {
        setSessionId(payload.sessionId);
        window.localStorage.setItem(CHAT_SESSION_KEY, payload.sessionId);
      }
      if (Array.isArray(payload?.messages)) {
        setMessages(payload.messages);
      }
    });

    socket.on("chat:message", (message) => {
      if (message) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [socketUrl]);

  const connect = useCallback(() => {
    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect();
    }
  }, []);

  const registerChat = useCallback(
    ({ name, email } = {}) => {
      return new Promise((resolve, reject) => {
        if (!socketRef.current) {
          reject(new Error("Chat socket is not initialized"));
          return;
        }

        setLoading(true);
        socketRef.current.emit(
          "chat:register",
          {
            sessionId,
            name: name || "",
            email: email || "",
          },
          (response) => {
            setLoading(false);
            if (response?.success) {
              if (response.sessionId) {
                setSessionId(response.sessionId);
                window.localStorage.setItem(CHAT_SESSION_KEY, response.sessionId);
              }
              if (Array.isArray(response.messages)) {
                setMessages(response.messages);
              }
              resolve(response);
            } else {
              setError(response?.error || "Unable to register chat");
              reject(new Error(response?.error || "Unable to register chat"));
            }
          },
        );
      });
    },
    [sessionId],
  );

  const sendMessage = useCallback(
    ({ body, name, email, metadata } = {}) => {
      return new Promise((resolve, reject) => {
        if (!socketRef.current) {
          reject(new Error("Chat socket is not initialized"));
          return;
        }

        socketRef.current.emit(
          "chat:message",
          {
            sessionId,
            body,
            name,
            email,
            metadata,
          },
          (response) => {
            if (response?.success) {
              resolve(response);
            } else {
              setError(response?.error || "Failed to send chat message");
              reject(new Error(response?.error || "Failed to send chat message"));
            }
          },
        );
      });
    },
    [sessionId],
  );

  return {
    connected,
    connect,
    registerChat,
    sendMessage,
    sessionId,
    messages,
    error,
    loading,
  };
};
