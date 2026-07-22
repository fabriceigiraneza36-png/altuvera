// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGING UTILITIES v2.0 — Conversation & Message Helpers
// ═══════════════════════════════════════════════════════════════════════════════
// Uses your exact schema — no missing columns, no bad aliases.
// ═══════════════════════════════════════════════════════════════════════════════

"use strict";

const { query } = require("../config/db");
const logger    = require("./logger");

/* ─── Constants ────────────────────────────────────────────────────────────── */

const CHANNELS   = ["live_chat", "email", "whatsapp", "sms"];
const STATUSES   = ["open", "closed", "pending"];
const PRIORITIES = ["low", "normal", "high", "urgent"];

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

const genSessionId = () =>
  `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

/* ═══════════════════════════════════════════════════════════════════════════
   GET OR CREATE CONVERSATION
   ─────────────────────────────────────────────────────────────────────────
   Called when a user sends their first message, or resumes an existing thread.
   Matches on (userId | sessionId | bookingId) to avoid duplicates.
═══════════════════════════════════════════════════════════════════════════ */
async function getOrCreateConversation({
  userId,
  sessionId,
  guestName,
  guestEmail,
  bookingId,
  bookingNumber,
  subject,
  channel   = "live_chat",
  source    = "website",
  priority  = "normal",
  ipAddress,
  userAgent,
  metadata  = {},
}) {
  try {
    /* ─── 1. Try to find an existing OPEN conversation ─────────────────── */

    const findConditions = ["conv.deleted_at IS NULL", "conv.status != 'closed'"];
    const findParams     = [];
    let   p              = 1;

    if (userId) {
      findConditions.push(`conv.user_id = $${p}`);
      findParams.push(userId);
      p++;
    } else if (sessionId) {
      findConditions.push(`conv.session_id = $${p}`);
      findParams.push(sessionId);
      p++;
    } else {
      throw Object.assign(
        new Error("Either userId or sessionId is required"),
        { status: 400 }
      );
    }

    if (bookingId) {
      findConditions.push(`conv.booking_id = $${p}`);
      findParams.push(bookingId);
      p++;
    }

    const existing = await query(
      `SELECT conv.*
         FROM conversations conv
        WHERE ${findConditions.join(" AND ")}
        ORDER BY conv.last_message_at DESC NULLS LAST, conv.created_at DESC
        LIMIT 1`,
      findParams
    );

    if (existing.rows[0]) {
      return existing.rows[0];
    }

    /* ─── 2. No match — create a new conversation ──────────────────────── */

    const finalSessionId = sessionId || genSessionId();
    const finalMetadata  = {
      ...metadata,
      ...(bookingNumber ? { bookingNumber } : {}),
    };

    const created = await query(
      `INSERT INTO conversations (
         session_id, user_id, guest_name, guest_email,
         channel, subject, status, priority,
         booking_id, booking_number,
         source, ip_address, user_agent, metadata,
         unread_admin, unread_user,
         created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4,
         $5, $6, 'open', $7,
         $8, $9,
         $10, $11, $12, $13::jsonb,
         0, 0,
         NOW(), NOW()
       )
       RETURNING *`,
      [
        finalSessionId,
        userId               || null,
        guestName            || null,
        guestEmail           || null,
        channel,
        subject              || null,
        priority,
        bookingId            || null,
        bookingNumber        || null,
        source,
        ipAddress            || null,
        userAgent            || null,
        JSON.stringify(finalMetadata),
      ]
    );

    logger.info("[messaging] Conversation created:", {
      id:            created.rows[0].id,
      userId,
      bookingId,
      bookingNumber,
    });

    return created.rows[0];
  } catch (err) {
    logger.error("[messaging] getOrCreateConversation failed:", {
      error: err.message,
      code:  err.code,
    });
    throw err;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   INSERT MESSAGE
═══════════════════════════════════════════════════════════════════════════ */
async function insertMessage({
  conversationId,
  senderType,          // "user" | "admin" | "system"
  senderId,
  senderName,
  senderEmail,
  senderAvatar,
  body,
  msgType        = "text",
  attachmentUrl,
  attachmentName,
  attachmentType,
  replyToId,
  metadata       = {},
}) {
  if (!conversationId) {
    throw Object.assign(new Error("conversationId is required"), { status: 400 });
  }
  if (!senderType) {
    throw Object.assign(new Error("senderType is required"), { status: 400 });
  }
  if (!body || !String(body).trim()) {
    throw Object.assign(new Error("Message body is required"), { status: 400 });
  }

  const trimmedBody = String(body).trim();

  try {
    const result = await query(
      `INSERT INTO messages (
         conversation_id, sender_type, sender_id, sender_name,
         sender_email, sender_avatar,
         body, msg_type,
         attachment_url, attachment_name, attachment_type,
         reply_to_id, metadata, reactions,
         is_read, created_at
       ) VALUES (
         $1, $2, $3, $4,
         $5, $6,
         $7, $8,
         $9, $10, $11,
         $12, $13::jsonb, '{}'::jsonb,
         FALSE, NOW()
       )
       RETURNING *`,
      [
        conversationId,
        senderType,
        senderId       || null,
        senderName     || null,
        senderEmail    || null,
        senderAvatar   || null,
        trimmedBody,
        msgType,
        attachmentUrl  || null,
        attachmentName || null,
        attachmentType || null,
        replyToId      || null,
        JSON.stringify(metadata),
      ]
    );

    const msg = result.rows[0];

    /* Update conversation last-message and increment unread counter */
    const bumpField = senderType === "admin" ? "unread_user" : "unread_admin";

    await query(
      `UPDATE conversations
          SET last_message    = $1,
              last_message_at = NOW(),
              ${bumpField}    = COALESCE(${bumpField}, 0) + 1,
              first_message   = COALESCE(first_message, $1),
              updated_at      = NOW()
        WHERE id = $2`,
      [trimmedBody.slice(0, 500), conversationId]
    );

    return msg;
  } catch (err) {
    logger.error("[messaging] insertMessage failed:", {
      error: err.message,
      code:  err.code,
    });
    throw err;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   MARK CONVERSATION READ
═══════════════════════════════════════════════════════════════════════════ */
async function markConversationRead({ conversationId, readerType }) {
  if (!["user", "admin"].includes(readerType)) {
    throw Object.assign(new Error("Invalid readerType"), { status: 400 });
  }

  const otherSide  = readerType === "admin" ? "user" : "admin";
  const unreadCol  = readerType === "admin" ? "unread_admin" : "unread_user";

  await query(
    `UPDATE messages
        SET is_read = TRUE,
            read_at = NOW()
      WHERE conversation_id = $1
        AND sender_type     = $2
        AND (is_read IS NULL OR is_read = FALSE)`,
    [conversationId, otherSide]
  );

  await query(
    `UPDATE conversations
        SET ${unreadCol} = 0,
            updated_at   = NOW()
      WHERE id = $1`,
    [conversationId]
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LIST CONVERSATIONS (admin)
═══════════════════════════════════════════════════════════════════════════ */
async function listConversations({
  status  = "open",
  limit   = 100,
  page    = 1,
  search,
}) {
  const offset     = (parseInt(page) - 1) * parseInt(limit);
  const conditions = ["conv.deleted_at IS NULL"];
  const params     = [];
  let   p          = 1;

  if (status && status !== "all") {
    conditions.push(`conv.status = $${p}`);
    params.push(status);
    p++;
  }

  if (search) {
    conditions.push(`(
      conv.guest_name     ILIKE $${p} OR
      conv.guest_email    ILIKE $${p} OR
      conv.subject        ILIKE $${p} OR
      conv.last_message   ILIKE $${p} OR
      conv.booking_number ILIKE $${p}
    )`);
    params.push(`%${search}%`);
    p++;
  }

  const where = conditions.join(" AND ");

  const [dataRes, countRes] = await Promise.all([
    query(
      `SELECT conv.*
         FROM conversations conv
        WHERE ${where}
        ORDER BY
          (conv.unread_admin > 0) DESC,
          conv.last_message_at   DESC NULLS LAST,
          conv.created_at        DESC
        LIMIT  $${p}
        OFFSET $${p + 1}`,
      [...params, parseInt(limit), offset]
    ),
    query(
      `SELECT COUNT(*)::INT AS total
         FROM conversations conv
        WHERE ${where}`,
      params
    ),
  ]);

  return {
    rows:  dataRes.rows,
    total: countRes.rows[0]?.total || 0,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   GET CONVERSATION WITH MESSAGES
═══════════════════════════════════════════════════════════════════════════ */
async function getConversationWithMessages(id) {
  const [convRes, msgsRes] = await Promise.all([
    query(
      `SELECT conv.*
         FROM conversations conv
        WHERE conv.id = $1
          AND conv.deleted_at IS NULL`,
      [id]
    ),
    query(
      `SELECT m.*
         FROM messages m
        WHERE m.conversation_id = $1
          AND (m.deleted IS NULL OR m.deleted = FALSE)
          AND m.deleted_at IS NULL
        ORDER BY m.created_at ASC`,
      [id]
    ),
  ]);

  if (!convRes.rows[0]) return null;

  return {
    ...convRes.rows[0],
    messages: msgsRes.rows,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   TOGGLE REACTION
═══════════════════════════════════════════════════════════════════════════ */
async function toggleReaction({ messageId, userId, emoji, add }) {
  const cur = await query(
    `SELECT reactions FROM messages WHERE id = $1`,
    [messageId]
  );

  if (!cur.rows[0]) {
    throw Object.assign(new Error("Message not found"), { status: 404 });
  }

  const reactions = cur.rows[0].reactions || {};
  const uid       = String(userId);
  const list      = reactions[emoji] || [];

  const updated = add
    ? [...new Set([...list, uid])]
    : list.filter((x) => x !== uid);

  if (updated.length === 0) delete reactions[emoji];
  else                      reactions[emoji] = updated;

  await query(
    `UPDATE messages SET reactions = $1::jsonb WHERE id = $2`,
    [JSON.stringify(reactions), messageId]
  );

  return reactions;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CHANGE STATUS
═══════════════════════════════════════════════════════════════════════════ */
async function changeConversationStatus({ conversationId, status }) {
  if (!STATUSES.includes(status)) {
    throw Object.assign(
      new Error(`Status must be one of: ${STATUSES.join(", ")}`),
      { status: 400 }
    );
  }

  const closedAtExpr = status === "closed"
    ? ", closed_at = NOW()"
    : status === "open"
      ? ", closed_at = NULL"
      : "";

  const result = await query(
    `UPDATE conversations
        SET status     = $1,
            updated_at = NOW()
            ${closedAtExpr}
      WHERE id = $2
      RETURNING *`,
    [status, conversationId]
  );

  return result.rows[0] || null;
}

/* ─── Exports ──────────────────────────────────────────────────────────────── */

module.exports = {
  CHANNELS,
  STATUSES,
  PRIORITIES,
  getOrCreateConversation,
  insertMessage,
  markConversationRead,
  listConversations,
  getConversationWithMessages,
  toggleReaction,
  changeConversationStatus,
};