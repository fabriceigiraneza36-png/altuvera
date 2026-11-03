import {
  AlertTriangle,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  Globe2,
  MapPinned,
  MessageCircle,
  Newspaper,
  Package,
  PartyPopper,
  Pencil,
  Settings,
  ShieldCheck,
  Siren,
  Trash2,
  Wallet,
  XCircle,
} from "lucide-react";

const META = {
  booking_created: { icon: CalendarDays, color: "#07845b", label: "Booking received", category: "booking" },
  booking_request: { icon: CalendarDays, color: "#07845b", label: "Booking request", category: "booking" },
  booking_updated: { icon: Pencil, color: "#0b83b6", label: "Booking updated", category: "booking" },
  booking_confirmed: { icon: CheckCircle2, color: "#16834a", label: "Booking confirmed", category: "booking" },
  booking_cancelled: { icon: XCircle, color: "#c2414b", label: "Booking cancelled", category: "booking" },
  booking_deleted: { icon: Trash2, color: "#7c3aed", label: "Booking removed", category: "booking" },
  booking_reminder: { icon: CalendarDays, color: "#07845b", label: "Booking reminder", category: "booking" },
  payment_confirmed: { icon: CreditCard, color: "#16834a", label: "Payment confirmed", category: "booking" },
  payment_request: { icon: Wallet, color: "#b7791f", label: "Payment update", category: "booking" },
  payment_failed: { icon: AlertTriangle, color: "#c2414b", label: "Payment needs attention", category: "booking" },
  new_destination: { icon: MapPinned, color: "#0b83b6", label: "New destination", category: "updates" },
  new_country: { icon: Globe2, color: "#0b83b6", label: "Country spotlight", category: "updates" },
  new_post: { icon: FileText, color: "#7c3aed", label: "New story", category: "updates" },
  new_package: { icon: Package, color: "#b7791f", label: "New safari package", category: "updates" },
  checklist_request: { icon: ClipboardList, color: "#07845b", label: "Trip checklist", category: "booking" },
  checklist_ready: { icon: CheckCircle2, color: "#16834a", label: "Checklist ready", category: "booking" },
  promotion: { icon: PartyPopper, color: "#be477c", label: "Special offer", category: "updates" },
  newsletter: { icon: Newspaper, color: "#07845b", label: "Altuvera update", category: "updates" },
  warning: { icon: AlertTriangle, color: "#b7791f", label: "Important notice", category: "system" },
  alert: { icon: Siren, color: "#c2414b", label: "Urgent alert", category: "system" },
  system: { icon: Settings, color: "#64748b", label: "Account update", category: "system" },
  login_success: { icon: ShieldCheck, color: "#16834a", label: "Security update", category: "system" },
  user_login_success: { icon: ShieldCheck, color: "#16834a", label: "Security update", category: "system" },
  message_received: { icon: MessageCircle, color: "#07845b", label: "New message", category: "message" },
  message_new: { icon: MessageCircle, color: "#07845b", label: "New message", category: "message" },
  group_message: { icon: MessageCircle, color: "#0b83b6", label: "Group message", category: "message" },
  admin_reply: { icon: MessageCircle, color: "#07845b", label: "Reply from Altuvera", category: "message" },
  general: { icon: BellRing, color: "#07845b", label: "Altuvera update", category: "system" },
};

export const parseNotificationMetadata = (notification) => {
  let value = notification?.metadata ?? notification?.metadata_json ?? {};
  if (typeof value === "string") {
    try { value = JSON.parse(value); } catch { value = {}; }
  }
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
};

const normalizeType = (value) => String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");

export const getNotificationPresentation = (notification = {}) => {
  const type = normalizeType(notification.type);
  const category = normalizeType(notification.category);
  const title = String(notification.title || "").toLowerCase();
  const metadata = parseNotificationMetadata(notification);
  const isGroup = Boolean(
    notification.group_id || notification.groupId ||
    metadata.groupId || metadata.group_id ||
    normalizeType(notification.conversation_type || notification.conversationType) === "group" ||
    type.includes("group")
  );
  const isMessage = category === "message" || type.includes("message") ||
    type.includes("reply") || Boolean(
      notification.conversation_id || notification.conversationId ||
      metadata.conversationId || metadata.conversation_id
    );
  let meta = META[type];

  if (!meta && isMessage) {
    meta = isGroup
      ? { ...META.group_message }
      : { ...META.message_received };
  }
  if (!meta && (type.startsWith("booking") || category === "booking")) {
    meta = META.booking_updated;
  }
  if (!meta && type.startsWith("payment")) meta = META.payment_request;
  if (!meta && type.startsWith("checklist")) meta = META.checklist_request;
  if (!meta && (title.includes("destination") || title.includes("safari"))) meta = META.new_destination;
  if (!meta && title.includes("package")) meta = META.new_package;
  if (!meta && (type.includes("security") || type.includes("login"))) meta = META.login_success;

  const resolved = meta || META.general;
  return {
    ...resolved,
    isMessage,
    isGroup,
    isUrgent: type === "alert" || type === "warning" ||
      type === "payment_failed" || type === "booking_cancelled",
    type,
  };
};

export const getNotificationContextRows = (notification = {}) => {
  const metadata = parseNotificationMetadata(notification);
  const rows = [
    ["From", notification.sender_name || notification.senderName || metadata.senderName || metadata.sender_name],
    ["Destination", metadata.destinationName || metadata.destination_name || metadata.destination],
    ["Country", metadata.countryName || metadata.country_name || metadata.country],
    ["Package", metadata.packageName || metadata.package_name || (metadata.resourceType === "package" ? metadata.resourceName : "")],
    ["Booking reference", notification.booking_number || notification.bookingNumber || metadata.bookingNumber || metadata.booking_number],
    ["Travel date", metadata.travelDate || metadata.travel_date || metadata.departureDate || metadata.departure_date],
    ["Status", metadata.status || metadata.bookingStatus || metadata.booking_status],
  ];
  return rows.filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "");
};

export const getNotificationActionUrl = (notification = {}) => {
  const metadata = parseNotificationMetadata(notification);
  const conversationId = notification.conversation_id || notification.conversationId ||
    metadata.conversationId || metadata.conversation_id;
  if (conversationId) return `/messages?conversationId=${encodeURIComponent(conversationId)}`;
  const actionUrl = notification.action_url || notification.actionUrl;
  if (typeof actionUrl === "string" && actionUrl.startsWith("/")) return actionUrl;
  if (typeof actionUrl === "string" && /^https?:\/\//i.test(actionUrl)) return actionUrl;
  return "/notifications";
};

export default getNotificationPresentation;
