import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";

const TYPE_META = {
  booking_created:["📅","#059669"], booking_updated:["✏️","#0ea5e9"], booking_confirmed:["✅","#16a34a"],
  checklist_request:["📋","#059669"], checklist_ready:["✅","#16a34a"], warning:["⚠️","#f59e0b"],
  alert:["🚨","#dc2626"], system:["⚙️","#64748b"], general:["💬","#059669"],
};

export default function GlobalUserNotifications() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead } = useNotifications();
  const [visible, setVisible] = useState(null);
  const [seen, setSeen] = useState(() => {
    try { return new Set(JSON.parse(sessionStorage.getItem("altuvera:global-notifications") || "[]")); } catch { return new Set(); }
  });

  useEffect(() => {
    const fresh = notifications.find(n => !n.is_read && !seen.has(String(n.id)));
    if (!fresh) return;
    setVisible(fresh);
    const next = new Set(seen);
    next.add(String(fresh.id));
    setSeen(next);
    try { sessionStorage.setItem("altuvera:global-notifications", JSON.stringify([...next].slice(-100))); } catch {}
  }, [notifications]); // eslint-disable-line react-hooks/exhaustive-deps

  const meta = useMemo(() => TYPE_META[visible?.type] || TYPE_META.general, [visible]);

  const openNotification = () => {
    if (!visible) return;
    markRead(visible.id);
    setVisible(null);
    const cid = visible.conversation_id || visible.conversationId || visible.metadata?.conversationId || visible.metadata?.conversation_id;
    if (cid) { navigate(`/messages?conversationId=${encodeURIComponent(cid)}`); return; }
    if (visible.action_url) {
      if (visible.action_url.startsWith("/")) navigate(visible.action_url);
      else window.location.href = visible.action_url;
      return;
    }
    navigate("/notifications");
  };

  if (!visible) return null;
  return (
    <div style={{position:"fixed",right:16,bottom:16,zIndex:9999,width:"min(390px,calc(100vw - 32px))"}}>
      <div style={{background:"#fff",border:"1px solid #dbe5df",borderLeft:`4px solid ${meta[1]}`,borderRadius:16,boxShadow:"0 18px 50px rgba(15,23,42,.18)",overflow:"hidden"}}>
        <button onClick={openNotification} style={{display:"block",width:"100%",border:0,background:"transparent",textAlign:"left",padding:"15px 16px",cursor:"pointer"}}>
          <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            <span style={{width:40,height:40,borderRadius:12,background:`${meta[1]}15`,display:"grid",placeItems:"center",fontSize:20,flexShrink:0}}>{meta[0]}</span>
            <span style={{minWidth:0,flex:1}}>
              <strong style={{display:"block",color:"#0f172a",fontSize:14}}>{visible.title || "New notification"}</strong>
              <span style={{display:"block",marginTop:4,color:"#475569",fontSize:13,lineHeight:1.45}}>{visible.message}</span>
              <span style={{display:"block",marginTop:8,color:meta[1],fontWeight:800,fontSize:12}}>
                {visible.conversation_id || visible.conversationId ? "Open conversation →" : visible.action_url ? (visible.action_label || "View details") + " →" : "Open notifications →"}
              </span>
            </span>
            <span aria-hidden="true" style={{color:"#94a3b8",fontSize:18,lineHeight:1}}>×</span>
          </div>
        </button>
        {unreadCount > 1 && <div style={{padding:"0 16px 10px",color:"#94a3b8",fontSize:11}}>{unreadCount} unread notifications</div>}
      </div>
    </div>
  );
}
