/**
 * In-memory message store
 * Replace with database (MongoDB, PostgreSQL, Redis) for production
 */

class MessageStore {
  constructor() {
    // Map<userPhone, { messages: [], registeredAt: number, adminPhone: string }>
    this.conversations = new Map();
    // Track all registered users
    this.registeredUsers = new Set();
  }

  // Register a user to receive notifications
  registerUser(userPhone, adminPhone) {
    const cleanPhone = this.cleanPhone(userPhone);

    if (!this.conversations.has(cleanPhone)) {
      this.conversations.set(cleanPhone, {
        messages: [],
        registeredAt: Date.now(),
        adminPhone: adminPhone,
        lastChecked: 0,
      });
    }

    this.registeredUsers.add(cleanPhone);

    console.log(`[MessageStore] User registered: ${cleanPhone}`);
    console.log(`[MessageStore] Total registered users: ${this.registeredUsers.size}`);

    return {
      success: true,
      userPhone: cleanPhone,
      registeredAt: this.conversations.get(cleanPhone).registeredAt,
    };
  }

  // Add a message from admin to a user's conversation
  addMessage(toPhone, fromPhone, messageData) {
    const cleanTo = this.cleanPhone(toPhone);

    // Check if this user is registered
    if (!this.conversations.has(cleanTo)) {
      // Try to find by partial match (last 9 digits)
      const match = this.findUserByPartialPhone(cleanTo);
      if (!match) {
        console.log(`[MessageStore] No registered user found for: ${cleanTo}`);
        return null;
      }
      return this.addMessageToConversation(match, fromPhone, messageData);
    }

    return this.addMessageToConversation(cleanTo, fromPhone, messageData);
  }

  addMessageToConversation(userPhone, fromPhone, messageData) {
    const conversation = this.conversations.get(userPhone);
    if (!conversation) return null;

    const message = {
      id: messageData.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from: fromPhone,
      fromName: messageData.fromName || 'IGIRANEZA Fabrice',
      to: userPhone,
      body: messageData.body || messageData.text?.body || '[No content]',
      timestamp: messageData.timestamp ? messageData.timestamp * 1000 : Date.now(),
      type: messageData.type || 'text',
      isFromAdmin: true,
      read: false,
    };

    conversation.messages.push(message);

    console.log(`[MessageStore] Message added for user ${userPhone}: "${message.body.substring(0, 50)}..."`);

    return message;
  }

  // Get unread messages for a user since a timestamp
  getMessages(userPhone, since = 0) {
    const cleanPhone = this.cleanPhone(userPhone);
    const conversation = this.conversations.get(cleanPhone);

    if (!conversation) {
      // Try partial match
      const match = this.findUserByPartialPhone(cleanPhone);
      if (!match) return [];
      const conv = this.conversations.get(match);
      return conv ? conv.messages.filter(m => m.timestamp > parseInt(since)) : [];
    }

    return conversation.messages.filter(m => m.timestamp > parseInt(since));
  }

  // Mark messages as read
  markAsRead(userPhone) {
    const cleanPhone = this.cleanPhone(userPhone);
    const conversation = this.conversations.get(cleanPhone);
    if (conversation) {
      conversation.messages.forEach(m => { m.read = true; });
      conversation.lastChecked = Date.now();
    }
  }

  // Get unread count
  getUnreadCount(userPhone) {
    const cleanPhone = this.cleanPhone(userPhone);
    const conversation = this.conversations.get(cleanPhone);
    if (!conversation) return 0;
    return conversation.messages.filter(m => !m.read).length;
  }

  // Find user by partial phone (last 9 digits match)
  findUserByPartialPhone(phone) {
    const last9 = phone.slice(-9);
    for (const [registeredPhone] of this.conversations) {
      if (registeredPhone.slice(-9) === last9) {
        return registeredPhone;
      }
    }
    return null;
  }

  // Check if user is registered
  isRegistered(userPhone) {
    const cleanPhone = this.cleanPhone(userPhone);
    return this.conversations.has(cleanPhone) ||
           this.findUserByPartialPhone(cleanPhone) !== null;
  }

  // Get all registered users
  getAllUsers() {
    const users = [];
    for (const [phone, data] of this.conversations) {
      users.push({
        phone,
        registeredAt: data.registeredAt,
        messageCount: data.messages.length,
        unreadCount: data.messages.filter(m => !m.read).length,
      });
    }
    return users;
  }

  // Clean phone number
  cleanPhone(phone) {
    let cleaned = String(phone).replace(/\D/g, '');
    // Ensure it starts with country code
    if (cleaned.length === 9) cleaned = '250' + cleaned;
    if (cleaned.length === 10 && cleaned.startsWith('0')) cleaned = '250' + cleaned.substring(1);
    return cleaned;
  }

  // Get stats
  getStats() {
    let totalMessages = 0;
    let totalUnread = 0;
    for (const [, data] of this.conversations) {
      totalMessages += data.messages.length;
      totalUnread += data.messages.filter(m => !m.read).length;
    }
    return {
      totalUsers: this.conversations.size,
      totalMessages,
      totalUnread,
    };
  }
}

// Singleton
const messageStore = new MessageStore();
module.exports = messageStore;