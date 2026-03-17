/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ALTUVERA TRAVEL - UTILITY HELPERS
 * Comprehensive helper functions for the application
 * ═══════════════════════════════════════════════════════════════════════════════
 */

"use strict";

const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

// ═══════════════════════════════════════════════════════════════════════════════
// STRING UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a URL-friendly slug from a string
 * @param {string} text - The text to slugify
 * @param {Object} options - Options for slug generation
 * @returns {string} URL-friendly slug
 */
const slugify = (text, options = {}) => {
  const { 
    lowercase = true, 
    separator = "-",
    maxLength = 100 
  } = options;

  if (!text || typeof text !== "string") return "";

  let slug = text
    .toString()
    .normalize("NFD")                    // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, "")     // Remove diacritics
    .trim()
    .replace(/\s+/g, separator)          // Replace spaces with separator
    .replace(/[^\w-]+/g, "")             // Remove non-word characters
    .replace(/--+/g, separator)          // Replace multiple separators
    .replace(/^-+/, "")                  // Remove leading separator
    .replace(/-+$/, "");                 // Remove trailing separator

  if (lowercase) {
    slug = slug.toLowerCase();
  }

  if (maxLength && slug.length > maxLength) {
    slug = slug.substring(0, maxLength).replace(/-+$/, "");
  }

  return slug;
};

/**
 * Generate unique slug with suffix if needed
 * @param {string} baseSlug - Base slug
 * @param {Function} checkExists - Async function to check if slug exists
 * @returns {Promise<string>} Unique slug
 */
const generateUniqueSlug = async (baseSlug, checkExists) => {
  let slug = slugify(baseSlug);
  let counter = 0;
  let uniqueSlug = slug;

  while (await checkExists(uniqueSlug)) {
    counter++;
    uniqueSlug = `${slug}-${counter}`;
  }

  return uniqueSlug;
};

/**
 * Sanitize input string (remove HTML and dangerous characters)
 * @param {string} str - String to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} Sanitized string
 */
const sanitizeInput = (str, options = {}) => {
  const {
    trim = true,
    removeHtml = true,
    removeScripts = true,
    maxLength = null
  } = options;

  if (!str || typeof str !== "string") return str;

  let sanitized = str;

  if (removeScripts) {
    sanitized = sanitized.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    );
  }

  if (removeHtml) {
    sanitized = sanitized
      .replace(/<[^>]*>/g, "")     // Remove HTML tags
      .replace(/[<>]/g, "");        // Remove remaining angle brackets
  }

  if (trim) {
    sanitized = sanitized.trim();
  }

  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
};

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add (default: "...")
 * @returns {string} Truncated text
 */
const truncate = (text, length = 100, suffix = "...") => {
  if (!text || typeof text !== "string") return "";
  if (text.length <= length) return text;

  const truncated = text.substring(0, length - suffix.length).trim();
  // Try to break at a word boundary
  const lastSpace = truncated.lastIndexOf(" ");
  
  if (lastSpace > length * 0.8) {
    return truncated.substring(0, lastSpace) + suffix;
  }
  
  return truncated + suffix;
};

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
const titleCase = (str) => {
  if (!str || typeof str !== "string") return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Capitalize first letter only
 * @param {string} str - String to capitalize
 * @returns {string} String with first letter capitalized
 */
const capitalize = (str) => {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert camelCase to Title Case
 * @param {string} str - camelCase string
 * @returns {string} Title Case string
 */
const camelToTitle = (str) => {
  if (!str) return "";
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
};

/**
 * Convert snake_case to camelCase
 * @param {string} str - snake_case string
 * @returns {string} camelCase string
 */
const snakeToCamel = (str) => {
  if (!str) return "";
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

// ═══════════════════════════════════════════════════════════════════════════════
// ID & CODE GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a unique booking number
 * Format: ALT-YYYYMMDD-XXXXXX
 * @returns {string} Unique booking number
 */
const generateBookingNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = uuidv4().split("-")[0].toUpperCase();
  return `ALT-${year}${month}${day}-${random}`;
};

/**
 * Generate a short booking reference
 * Format: BK-YYMMDD-XXXX
 * @returns {string} Short booking reference
 */
const generateShortBookingRef = () => {
  const date = new Date();
  const dateStr =
    date.getFullYear().toString().slice(-2) +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${dateStr}-${random}`;
};

/**
 * Generate a confirmation code (6 alphanumeric characters)
 * Excludes confusing characters (0, O, I, L, 1)
 * @param {number} length - Code length (default: 6)
 * @returns {string} Confirmation code
 */
const generateConfirmationCode = (length = 6) => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Generate a verification code (numeric)
 * @param {number} length - Code length (default: 6)
 * @returns {string} Numeric verification code
 */
const generateVerificationCode = (length = 6) => {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
};

/**
 * Generate a secure random token
 * @param {number} length - Token length in bytes (default: 32)
 * @returns {string} Hex token
 */
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

/**
 * Generate a referral code
 * Format: REF-XXXXXX
 * @returns {string} Referral code
 */
const generateReferralCode = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "REF-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Generate a unique UUID
 * @returns {string} UUID v4
 */
const generateUUID = () => uuidv4();

/**
 * Generate order/invoice number
 * Format: INV-YYYYMMDD-XXXXX
 * @param {string} prefix - Prefix (default: "INV")
 * @returns {string} Invoice number
 */
const generateInvoiceNumber = (prefix = "INV") => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${year}${month}${day}-${random}`;
};

// ═══════════════════════════════════════════════════════════════════════════════
// DATE & TIME UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string (YYYY, MM, DD, HH, mm, ss)
 * @returns {string|null} Formatted date or null
 */
const formatDate = (date, format = "YYYY-MM-DD") => {
  if (!date) return null;

  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
};

/**
 * Format date as relative time (e.g., "2 hours ago")
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string
 */
const formatRelativeTime = (date) => {
  if (!date) return "";

  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
};

/**
 * Format date as human-readable string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
const formatDateHuman = (date, options = {}) => {
  if (!date) return "";

  const defaultOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };

  return new Date(date).toLocaleDateString("en-US", defaultOptions);
};

/**
 * Get date range for common periods
 * @param {string} period - Period name (today, yesterday, thisWeek, etc.)
 * @returns {Object} Object with start and end dates
 */
const getDateRange = (period) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const ranges = {
    today: {
      start: today,
      end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
    },
    yesterday: {
      start: new Date(today.getTime() - 24 * 60 * 60 * 1000),
      end: new Date(today.getTime() - 1),
    },
    thisWeek: {
      start: new Date(today.setDate(today.getDate() - today.getDay())),
      end: now,
    },
    lastWeek: {
      start: new Date(today.setDate(today.getDate() - today.getDay() - 7)),
      end: new Date(today.setDate(today.getDate() - today.getDay() - 1)),
    },
    thisMonth: {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: now,
    },
    lastMonth: {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end: new Date(now.getFullYear(), now.getMonth(), 0),
    },
    thisYear: {
      start: new Date(now.getFullYear(), 0, 1),
      end: now,
    },
    lastYear: {
      start: new Date(now.getFullYear() - 1, 0, 1),
      end: new Date(now.getFullYear() - 1, 11, 31),
    },
    last7Days: {
      start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      end: now,
    },
    last30Days: {
      start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      end: now,
    },
    last90Days: {
      start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      end: now,
    },
    last12Months: {
      start: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
      end: now,
    },
  };

  return ranges[period] || ranges.thisMonth;
};

/**
 * Calculate days between two dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {number} Number of days
 */
const daysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
const isPastDate = (date) => {
  return new Date(date) < new Date();
};

/**
 * Check if date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the future
 */
const isFutureDate = (date) => {
  return new Date(date) > new Date();
};

/**
 * Add days to a date
 * @param {Date|string} date - Starting date
 * @param {number} days - Number of days to add
 * @returns {Date} New date
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// ═══════════════════════════════════════════════════════════════════════════════
// PAGINATION & QUERIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build paginated response metadata
 * @param {number} totalItems - Total number of items
 * @param {number} currentPage - Current page number
 * @param {number} itemsPerPage - Items per page (limit)
 * @returns {Object} Pagination metadata
 */
const paginate = (totalItems, currentPage = 1, itemsPerPage = 20) => {
  const total = parseInt(totalItems) || 0;
  const page = Math.max(1, parseInt(currentPage) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(itemsPerPage) || 20));
  const totalPages = Math.ceil(total / limit) || 1;
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * limit;

  return {
    total,
    page: safePage,
    limit,
    totalPages,
    offset,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
    nextPage: safePage < totalPages ? safePage + 1 : null,
    prevPage: safePage > 1 ? safePage - 1 : null,
    startItem: total > 0 ? offset + 1 : 0,
    endItem: Math.min(offset + limit, total),
  };
};

/**
 * Build WHERE clause and params from filters object
 * @param {Object} filters - Filter key-value pairs
 * @param {number} startIndex - Starting parameter index
 * @param {Object} options - Additional options
 * @returns {Object} { clause, params, nextIndex }
 */
const buildWhereClause = (filters, startIndex = 1, options = {}) => {
  const {
    tableAlias = "",
    useILike = false,
    dateFields = [],
    arrayFields = [],
  } = options;

  const conditions = [];
  const params = [];
  let idx = startIndex;
  const prefix = tableAlias ? `${tableAlias}.` : "";

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") continue;

    // Handle date range fields
    if (dateFields.includes(key)) {
      if (key.endsWith("_from")) {
        const field = key.replace("_from", "");
        conditions.push(`${prefix}${field} >= $${idx}`);
        params.push(value);
        idx++;
      } else if (key.endsWith("_to")) {
        const field = key.replace("_to", "");
        conditions.push(`${prefix}${field} <= $${idx}`);
        params.push(value);
        idx++;
      }
      continue;
    }

    // Handle array contains
    if (arrayFields.includes(key)) {
      conditions.push(`$${idx} = ANY(${prefix}${key})`);
      params.push(value);
      idx++;
      continue;
    }

    // Handle boolean
    if (typeof value === "boolean") {
      conditions.push(`${prefix}${key} = $${idx}`);
      params.push(value);
      idx++;
      continue;
    }

    // Handle ILIKE search
    if (useILike && typeof value === "string") {
      conditions.push(`${prefix}${key} ILIKE $${idx}`);
      params.push(`%${value}%`);
      idx++;
      continue;
    }

    // Default equality
    conditions.push(`${prefix}${key} = $${idx}`);
    params.push(value);
    idx++;
  }

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    conditions,
    params,
    nextIndex: idx,
  };
};

/**
 * Build search conditions for multiple fields
 * @param {string} searchTerm - Search term
 * @param {string[]} fields - Fields to search in
 * @param {number} startIndex - Starting parameter index
 * @param {string} tableAlias - Optional table alias
 * @returns {Object} { condition, param, nextIndex }
 */
const buildSearchCondition = (searchTerm, fields, startIndex = 1, tableAlias = "") => {
  if (!searchTerm || !fields.length) {
    return { condition: "", param: null, nextIndex: startIndex };
  }

  const prefix = tableAlias ? `${tableAlias}.` : "";
  const conditions = fields.map((field) => `${prefix}${field} ILIKE $${startIndex}`);

  return {
    condition: `(${conditions.join(" OR ")})`,
    param: `%${searchTerm}%`,
    nextIndex: startIndex + 1,
  };
};

/**
 * Build ORDER BY clause
 * @param {string} sortBy - Field to sort by
 * @param {string} sortOrder - Sort order (ASC/DESC)
 * @param {string[]} allowedFields - Allowed sort fields
 * @param {string} defaultField - Default sort field
 * @returns {string} ORDER BY clause
 */
const buildOrderClause = (
  sortBy,
  sortOrder = "DESC",
  allowedFields = [],
  defaultField = "created_at"
) => {
  const field = allowedFields.includes(sortBy) ? sortBy : defaultField;
  const order = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";
  return `ORDER BY ${field} ${order}`;
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Estimate reading time for text content
 * @param {string} content - Text content
 * @param {number} wordsPerMinute - Reading speed (default: 200)
 * @returns {number} Estimated reading time in minutes
 */
const calculateReadTime = (content, wordsPerMinute = 200) => {
  if (!content || typeof content !== "string") return 0;
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

/**
 * Extract excerpt from content
 * @param {string} content - Full content
 * @param {number} length - Excerpt length
 * @returns {string} Excerpt
 */
const extractExcerpt = (content, length = 160) => {
  if (!content) return "";

  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, "").trim();

  if (text.length <= length) return text;

  // Try to break at sentence
  const truncated = text.substring(0, length);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastQuestion = truncated.lastIndexOf("?");
  const lastExclaim = truncated.lastIndexOf("!");

  const breakPoint = Math.max(lastPeriod, lastQuestion, lastExclaim);

  if (breakPoint > length * 0.6) {
    return text.substring(0, breakPoint + 1);
  }

  // Break at word boundary
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + "...";
};

/**
 * Strip HTML tags from content
 * @param {string} html - HTML content
 * @returns {string} Plain text
 */
const stripHtml = (html) => {
  if (!html) return "";
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
};

// ═══════════════════════════════════════════════════════════════════════════════
// NUMBER & CURRENCY UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @param {string} locale - Locale (default: en-US)
 * @returns {string} Formatted number
 */
const formatNumber = (num, locale = "en-US") => {
  if (num === null || num === undefined) return "0";
  return new Intl.NumberFormat(locale).format(num);
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @param {string} locale - Locale (default: en-US)
 * @returns {string} Formatted currency
 */
const formatCurrency = (amount, currency = "USD", locale = "en-US") => {
  if (amount === null || amount === undefined) return "";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
};

/**
 * Parse number from string (handles commas, etc.)
 * @param {string} str - String to parse
 * @returns {number} Parsed number or 0
 */
const parseNumber = (str) => {
  if (typeof str === "number") return str;
  if (!str) return 0;
  const cleaned = str.toString().replace(/[^0-9.-]/g, "");
  return parseFloat(cleaned) || 0;
};

/**
 * Calculate percentage
 * @param {number} part - Part value
 * @param {number} total - Total value
 * @param {number} decimals - Decimal places
 * @returns {number} Percentage
 */
const calculatePercentage = (part, total, decimals = 2) => {
  if (!total || total === 0) return 0;
  return Number(((part / total) * 100).toFixed(decimals));
};

/**
 * Round to specified decimal places
 * @param {number} num - Number to round
 * @param {number} decimals - Decimal places
 * @returns {number} Rounded number
 */
const roundTo = (num, decimals = 2) => {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
};

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate phone number format
 * @param {string} phone - Phone to validate
 * @returns {boolean} True if valid
 */
const isValidPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
const isValidUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 */
const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

/**
 * Validate required fields in object
 * @param {Object} data - Data object
 * @param {string[]} requiredFields - Array of required field names
 * @returns {Object} { valid: boolean, missing: string[] }
 */
const validateRequired = (data, requiredFields) => {
  const missing = requiredFields.filter(
    (field) => data[field] === undefined || data[field] === null || data[field] === ""
  );
  return {
    valid: missing.length === 0,
    missing,
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// ARRAY & OBJECT UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Remove duplicates from array
 * @param {Array} arr - Array to dedupe
 * @param {string} key - Key to use for objects (optional)
 * @returns {Array} Deduped array
 */
const uniqueArray = (arr, key = null) => {
  if (!Array.isArray(arr)) return [];
  if (!key) return [...new Set(arr)];
  
  const seen = new Set();
  return arr.filter((item) => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

/**
 * Group array by key
 * @param {Array} arr - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
const groupBy = (arr, key) => {
  if (!Array.isArray(arr)) return {};
  return arr.reduce((groups, item) => {
    const value = item[key];
    groups[value] = groups[value] || [];
    groups[value].push(item);
    return groups;
  }, {});
};

/**
 * Pick specified keys from object
 * @param {Object} obj - Source object
 * @param {string[]} keys - Keys to pick
 * @returns {Object} New object with picked keys
 */
const pick = (obj, keys) => {
  if (!obj || typeof obj !== "object") return {};
  return keys.reduce((result, key) => {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

/**
 * Omit specified keys from object
 * @param {Object} obj - Source object
 * @param {string[]} keys - Keys to omit
 * @returns {Object} New object without omitted keys
 */
const omit = (obj, keys) => {
  if (!obj || typeof obj !== "object") return {};
  return Object.keys(obj)
    .filter((key) => !keys.includes(key))
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});
};

/**
 * Deep clone object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj);
  if (Array.isArray(obj)) return obj.map(deepClone);
  
  return Object.keys(obj).reduce((result, key) => {
    result[key] = deepClone(obj[key]);
    return result;
  }, {});
};

/**
 * Flatten nested object
 * @param {Object} obj - Object to flatten
 * @param {string} prefix - Key prefix
 * @returns {Object} Flattened object
 */
const flattenObject = (obj, prefix = "") => {
  const result = {};

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(result, flattenObject(obj[key], newKey));
    } else {
      result[newKey] = obj[key];
    }
  }

  return result;
};

// ═══════════════════════════════════════════════════════════════════════════════
// FILE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted file size
 */
const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
};

/**
 * Get file extension from filename or URL
 * @param {string} filename - Filename or URL
 * @returns {string} File extension (lowercase)
 */
const getFileExtension = (filename) => {
  if (!filename) return "";
  const parts = filename.split(".");
  if (parts.length < 2) return "";
  return parts.pop().toLowerCase().split("?")[0];
};

/**
 * Get mime type from extension
 * @param {string} extension - File extension
 * @returns {string} Mime type
 */
const getMimeType = (extension) => {
  const mimeTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    csv: "text/csv",
    txt: "text/plain",
    json: "application/json",
    mp3: "audio/mpeg",
    mp4: "video/mp4",
    zip: "application/zip",
  };
  return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
};

/**
 * Check if file is an image
 * @param {string} filename - Filename or URL
 * @returns {boolean} True if image
 */
const isImage = (filename) => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"];
  return imageExtensions.includes(getFileExtension(filename));
};

// ═══════════════════════════════════════════════════════════════════════════════
// MISCELLANEOUS UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum retries
 * @param {number} baseDelay - Base delay in ms
 * @returns {Promise} Result of function
 */
const retry = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
};

/**
 * Debounce function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function} Debounced function
 */
const debounce = (fn, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Hash string using SHA256
 * @param {string} str - String to hash
 * @returns {string} Hash
 */
const hashString = (str) => {
  return crypto.createHash("sha256").update(str).digest("hex");
};

/**
 * Generate random color hex
 * @returns {string} Hex color code
 */
const randomColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
};

/**
 * Convert object to query string
 * @param {Object} params - Parameters object
 * @returns {string} Query string
 */
const toQueryString = (params) => {
  if (!params || typeof params !== "object") return "";
  
  const pairs = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  
  return pairs.length > 0 ? `?${pairs.join("&")}` : "";
};

/**
 * Parse query string to object
 * @param {string} queryString - Query string
 * @returns {Object} Parsed parameters
 */
const parseQueryString = (queryString) => {
  if (!queryString) return {};
  
  const query = queryString.startsWith("?") ? queryString.substring(1) : queryString;
  
  return query.split("&").reduce((params, param) => {
    const [key, value] = param.split("=");
    if (key) {
      params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : "";
    }
    return params;
  }, {});
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  // String utilities
  slugify,
  generateUniqueSlug,
  sanitizeInput,
  truncate,
  titleCase,
  capitalize,
  camelToTitle,
  snakeToCamel,

  // ID & Code generation
  generateBookingNumber,
  generateShortBookingRef,
  generateConfirmationCode,
  generateVerificationCode,
  generateSecureToken,
  generateReferralCode,
  generateUUID,
  generateInvoiceNumber,

  // Date & Time utilities
  formatDate,
  formatRelativeTime,
  formatDateHuman,
  getDateRange,
  daysBetween,
  isPastDate,
  isFutureDate,
  addDays,

  // Pagination & Queries
  paginate,
  buildWhereClause,
  buildSearchCondition,
  buildOrderClause,

  // Content utilities
  calculateReadTime,
  extractExcerpt,
  stripHtml,

  // Number & Currency utilities
  formatNumber,
  formatCurrency,
  parseNumber,
  calculatePercentage,
  roundTo,

  // Validation utilities
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isEmpty,
  validateRequired,

  // Array & Object utilities
  uniqueArray,
  groupBy,
  pick,
  omit,
  deepClone,
  flattenObject,

  // File utilities
  formatFileSize,
  getFileExtension,
  getMimeType,
  isImage,

  // Miscellaneous
  sleep,
  retry,
  debounce,
  hashString,
  randomColor,
  toQueryString,
  parseQueryString,
};