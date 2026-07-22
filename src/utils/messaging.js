// utils/messaging.js
'use strict'

const { query } = require('../config/db')
const logger    = require('../utils/logger')

/* ── IO ref (set by server.js) ─────────────────────────────────────────────── */
let _io = null
exports.setIO = (io) => { _io = io }
exports.getIO = ()    => _io

/* ═══════════════════════════════════════════════════════════════════════════
   SERIALISERS
═══════════════════════════════════════════════════════════════════════════ */

exports.serializeConversation = (row) => {
  if (!row) return null
  return {
    id:              row.id,
    sessionId:       row.session_id,
    userId:          row.user_id,
    guestName:       row.guest_name  || row.user_full_name  || null,
    guestEmail:      row.guest_email || row.user_email      || null,
    guestAvatar:     row.user_avatar || null,
    subject:         row.subject,
    status:          row.status     || 'open',
    priority:        row.priority   || 'normal',
    source:          row.source,
    bookingId:       row.booking_id,
    bookingNumber:   row.booking_number,
    assignedAdmin:   row.assigned_admin,
    lastMessage:     row.last_message,
    lastMessageAt:   row.last_message_at,
    unreadAdmin:     parseInt(row.unread_admin || 0, 10),
    unreadUser:      parseInt(row.unread_user  || 0, 10),
    metadata:        row.metadata || {},
    closedAt:        row.closed_at,
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  }
}

exports.serializeMessage = (row) => {
  if (!row) return null

  // Parse reactions — stored as { emoji: [userId, ...] }
  let reactions = {}
  try {
    reactions = typeof row.reactions === 'string'
      ? JSON.parse(row.reactions)
      : (row.reactions || {})
  } catch { reactions = {} }

  return {
    id:             row.id,
    conversationId: row.conversation_id,
    senderType:     row.sender_type,
    senderId:       row.sender_id,
    senderName:     row.sender_name,
    senderEmail:    row.sender_email,
    senderAvatar:   row.sender_avatar,
    body:           row.body,
    isRead:         row.is_read,
    readAt:         row.read_at,
    replyToId:      row.reply_to_id,
    reactions,
    metadata:       row.metadata || {},
    createdAt:      row.created_at,
    updatedAt:      row.updated_at,
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONVERSATION HELPERS
═══════════════════════════════════════════════════════════════════════════ */

exports.findConversationById = async (id) => {
  if (!id || isNaN(id)) return null
  try {
    const { rows } = await query(
      `SELECT c.*,
              u.full_name  AS user_full_name,
              u.email      AS user_email,
              u.avatar_url AS user_avatar
         FROM conversations c
         LEFT JOIN users u ON u.id = c.user_id
        WHERE c.id = $1 AND c.deleted_at IS NULL
        LIMIT 1`,
      [id],
    )
    return rows[0] || null
  } catch (err) {
    logger.error('[Messaging] findConversationById:', err.message)
    return null
  }
}

/**
 * Find or create a conversation.
 * If sessionId is provided and matches an existing row, returns it.
 * Otherwise creates a new conversation.
 */
exports.getOrCreateConversation = async ({
  sessionId,
  userId,
  guestName,
  guestEmail,
  subject,
  status    = 'open',
  priority  = 'normal',
  source    = 'frontend',
  bookingId,
  bookingNumber,
  metadata  = {},
  adminId,         // when admin initiates: set assigned_admin
}) => {
  // 1. Try existing by sessionId
  if (sessionId) {
    const existing = await query(
      `SELECT c.*, u.full_name AS user_full_name, u.email AS user_email,
              u.avatar_url AS user_avatar
         FROM conversations c
         LEFT JOIN users u ON u.id = c.user_id
        WHERE c.session_id = $1 AND c.deleted_at IS NULL
        LIMIT 1`,
      [sessionId],
    )
    if (existing.rows[0]) return existing.rows[0]
  }

  // 2. Try existing by userId + no deleted
  if (userId && !sessionId) {
    const existing = await query(
      `SELECT c.*, u.full_name AS user_full_name, u.email AS user_email,
              u.avatar_url AS user_avatar
         FROM conversations c
         LEFT JOIN users u ON u.id = c.user_id
        WHERE c.user_id = $1
          AND c.status != 'closed'
          AND c.deleted_at IS NULL
        ORDER BY c.updated_at DESC
        LIMIT 1`,
      [userId],
    )
    if (existing.rows[0]) return existing.rows[0]
  }

  // 3. Create new
  const sid = sessionId || `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const { rows } = await query(
    `INSERT INTO conversations
       (session_id, user_id, guest_name, guest_email, subject, status, priority,
        source, booking_id, booking_number, assigned_admin, metadata,
        created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW())
     ON CONFLICT (session_id) DO UPDATE
       SET updated_at = NOW()
     RETURNING *`,
    [
      sid,
      userId        || null,
      guestName     || null,
      guestEmail    || null,
      subject       || 'New conversation',
      status,
      priority,
      source,
      bookingId     || null,
      bookingNumber || null,
      adminId       || null,
      JSON.stringify(metadata || {}),
    ],
  )
  return rows[0]
}

/* ═══════════════════════════════════════════════════════════════════════════
   MESSAGE HELPERS
═══════════════════════════════════════════════════════════════════════════ */

exports.getMessages = async (conversationId, limit = 200, offset = 0) => {
  try {
    const { rows } = await query(
      `SELECT * FROM messages
        WHERE conversation_id = $1
        ORDER BY created_at ASC
        LIMIT $2 OFFSET $3`,
      [conversationId, limit, offset],
    )
    return rows
  } catch (err) {
    logger.error('[Messaging] getMessages:', err.message)
    return []
  }
}

exports.saveMessage = async ({
  conversationId,
  senderType,
  senderId,
  senderName,
  senderEmail,
  senderAvatar,
  body,
  metadata = {},
  replyToId,
}) => {
  const { rows } = await query(
    `INSERT INTO messages
       (conversation_id, sender_type, sender_id, sender_name, sender_email,
        sender_avatar, body, metadata, reply_to_id, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW())
     RETURNING *`,
    [
      conversationId,
      senderType,
      senderId      || null,
      senderName    || null,
      senderEmail   || null,
      senderAvatar  || null,
      body,
      JSON.stringify(metadata || {}),
      replyToId     || null,
    ],
  )

  const message = rows[0]

  // Update conversation last_message + unread counters
  const unreadCol = senderType === 'admin' ? 'unread_user' : 'unread_admin'
  await query(
    `UPDATE conversations
       SET last_message    = $1,
           last_message_at = NOW(),
           updated_at      = NOW(),
           ${unreadCol}    = COALESCE(${unreadCol}, 0) + 1
     WHERE id = $2`,
    [body.slice(0, 255), conversationId],
  ).catch(err => logger.warn('[Messaging] saveMessage update conv:', err.message))

  return message
}

/* ═══════════════════════════════════════════════════════════════════════════
   READ / UNREAD HELPERS
═══════════════════════════════════════════════════════════════════════════ */

exports.markReadForRecipient = async (conversationId, recipientType) => {
  // Mark individual messages read
  const senderType = recipientType === 'admin' ? 'user' : 'admin'
  await query(
    `UPDATE messages
       SET is_read = true, read_at = NOW(), updated_at = NOW()
     WHERE conversation_id = $1
       AND sender_type     = $2
       AND is_read         = false`,
    [conversationId, senderType],
  ).catch(() => {})

  // Reset conversation unread counter
  const col = recipientType === 'admin' ? 'unread_admin' : 'unread_user'
  await query(
    `UPDATE conversations SET ${col} = 0, updated_at = NOW() WHERE id = $1`,
    [conversationId],
  ).catch(() => {})
}

exports.countUnreadAdmin = async (conversationId) => {
  try {
    const { rows } = await query(
      `SELECT COALESCE(unread_admin,0)::INT AS n FROM conversations WHERE id=$1`,
      [conversationId],
    )
    return rows[0]?.n ?? 0
  } catch { return 0 }
}

/* ═══════════════════════════════════════════════════════════════════════════
   REACTIONS
═══════════════════════════════════════════════════════════════════════════ */

exports.addReaction = async (conversationId, messageId, emoji, userId) => {
  const { rows } = await query(
    `SELECT * FROM messages WHERE id=$1 AND conversation_id=$2 LIMIT 1`,
    [messageId, conversationId],
  )
  if (!rows[0]) return null

  let reactions = {}
  try { reactions = rows[0].reactions || {} } catch { reactions = {} }

  const key     = String(emoji)
  const userKey = String(userId)
  const current = Array.isArray(reactions[key]) ? reactions[key] : []

  if (current.includes(userKey)) {
    reactions[key] = current.filter((u) => u !== userKey)
    if (reactions[key].length === 0) delete reactions[key]
  } else {
    reactions[key] = [...current, userKey]
  }

  const { rows: updated } = await query(
    `UPDATE messages SET reactions=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
    [JSON.stringify(reactions), messageId],
  )
  return updated[0] || null
}

/* ═══════════════════════════════════════════════════════════════════════════
   REAL-TIME BROADCAST HELPERS
═══════════════════════════════════════════════════════════════════════════ */

exports.broadcastMessage = ({ conversationId, sessionId, userId, payload, adminPayload }) => {
  if (!_io) return
  // Emit to the conversation room (all participants)
  _io.to(`conv:${conversationId}`).emit('msg:message', payload)
  // Emit to the admin room
  _io.to('role-admin').emit('msg:new-from-user', adminPayload)
  // Emit to the specific user if we know their socket room
  if (userId) _io.to(`user-${userId}`).emit('msg:message', payload)
  if (sessionId) _io.to(`session:${sessionId}`).emit('msg:message', payload)
}

exports.broadcastConversationUpdate = (conv) => {
  if (!_io) return
  const serialized = exports.serializeConversation(conv)
  _io.to(`conv:${conv.id}`).emit('msg:conversation-updated', serialized)
  _io.to('role-admin').emit('msg:conversation-updated', serialized)
}