/**
 * sendMessage.js v3.0
 *
 * Three separate, clearly-named functions:
 *
 *   sendContactForm(formData)
 *     → POST /api/contact
 *     → Used by: Contact page, general enquiries
 *
 *   sendChatMessage({ conversationId, body, sessionId, token, metadata })
 *     → POST /api/messages/send
 *     → Used by: Chat portal HTTP fallback when socket is offline
 *
 *   submitBookingRequest(formData, token)
 *     → POST /api/bookings
 *     → Used by: Booking wizard final step
 *
 *   sendMessage  (legacy alias → sendContactForm)
 */

/* ═══════════════════════════════════════════════════════════════
   API BASE
═══════════════════════════════════════════════════════════════ */
const resolveApiBase = () => {
  const raw  = import.meta.env.VITE_API_URL || 'https://backend-jd8f.onrender.com'
  const base = raw.replace(/\/+$/, '')
  return base.endsWith('/api') ? base : `${base}/api`
}

const API_BASE = resolveApiBase()

/* ═══════════════════════════════════════════════════════════════
   SHARED UTILITIES
═══════════════════════════════════════════════════════════════ */

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim())

/** Read auth token from storage */
const readStoredToken = () => {
  try {
    return (
      localStorage.getItem('altuvera_auth_token')   ||
      sessionStorage.getItem('altuvera_auth_token')  ||
      null
    )
  } catch { return null }
}

/** Build Authorization headers if token available */
const authHeaders = (token) => {
  const t = token || readStoredToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

/** Standard JSON POST fetch wrapper */
const postJSON = async (url, body, token) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message =
      data?.error        ||
      data?.message      ||
      data?.errors?.[0]  ||
      `Request failed (${res.status})`
    const err    = new Error(message)
    err.status   = res.status
    err.data     = data
    throw err
  }

  return data
}

/* ═══════════════════════════════════════════════════════════════
   FIELD RESOLVERS
   (handle all common naming conventions from form components)
═══════════════════════════════════════════════════════════════ */

const resolveName = (f) => {
  if (f.name)         return f.name
  if (f.fullName)     return f.fullName
  if (f.full_name)    return f.full_name
  if (f.contactName)  return f.contactName
  if (f.firstName || f.first_name) {
    return `${f.firstName || f.first_name || ''} ${f.lastName || f.last_name || ''}`.trim()
  }
  return ''
}

const resolveEmail = (f) =>
  f.email        ||
  f.userEmail    ||
  f.user_email   ||
  f.contactEmail ||
  ''

const resolveMessage = (f) =>
  f.message          ||
  f.body             ||
  f.content          ||
  f.description      ||
  f.notes            ||
  f.details          ||
  ''

const resolvePhone = (f) =>
  f.phone        ||
  f.phoneNumber  ||
  f.phone_number ||
  f.telephone    ||
  null

/** Build a structured message for booking-form submissions */
const buildBookingMessage = (f) => {
  const lines = []

  if (f.destinationName)
    lines.push(`Destination: ${f.destinationName}`)
  else if (f.destination)
    lines.push(`Destination: ${f.destination}`)

  if (f.countryId)
    lines.push(`Country ID: ${f.countryId}`)

  if (f.groupType)
    lines.push(`Group Type: ${f.groupType}`)

  if (f.isFlexible) {
    lines.push(
      `Dates: Flexible${
        f.flexibleMonths?.length
          ? ` (${f.flexibleMonths.join(', ')})`
          : ''
      }`
    )
  } else {
    if (f.startDate) lines.push(`Departure: ${f.startDate}`)
    if (f.endDate)   lines.push(`Return: ${f.endDate}`)
  }

  if (f.adults || f.children || f.infants) {
    const parts = []
    if (f.adults)   parts.push(`${f.adults} adult${f.adults   !== 1 ? 's' : ''}`)
    if (f.children) parts.push(`${f.children} child${f.children !== 1 ? 'ren' : ''}`)
    if (f.infants)  parts.push(`${f.infants} infant${f.infants  !== 1 ? 's' : ''}`)
    lines.push(`Travellers: ${parts.join(', ')}`)
  }

  if (f.accommodationType)
    lines.push(`Accommodation: ${f.accommodationType}`)

  if (f.budgetRange)
    lines.push(`Budget: ${f.budgetRange}`)

  if (f.interests?.length)
    lines.push(`Interests: ${f.interests.join(', ')}`)

  if (f.dietaryRequirements)
    lines.push(`Dietary: ${f.dietaryRequirements}`)

  if (f.specialRequests)
    lines.push(`Special Requests: ${f.specialRequests}`)

  if (f.medicalDetails)
    lines.push(`Medical: ${f.medicalDetails}`)

  if (f.hearAboutUs)
    lines.push(`How they heard: ${f.hearAboutUs}`)

  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════
   1. CONTACT FORM
   POST /api/contact
═══════════════════════════════════════════════════════════════ */
export const sendContactForm = async (formData) => {
  if (!formData || typeof formData !== 'object') {
    throw new Error('Form data is required')
  }

  const name    = resolveName(formData).trim()
  const email   = resolveEmail(formData).trim()
  let   message = resolveMessage(formData).trim()

  // Build rich message for booking-style forms
  if (!message) message = buildBookingMessage(formData).trim()

  /* ── Client-side validation ── */
  if (!name)
    throw new Error('Name is required')
  if (!email)
    throw new Error('Email address is required')
  if (!isValidEmail(email))
    throw new Error('Please enter a valid email address')
  if (!message)
    throw new Error('Message is required')
  if (message.length < 10)
    throw new Error('Message must be at least 10 characters')

  const subject =
    formData.subject                                    ||
    formData.topic                                      ||
    (formData.destinationName
      ? `Booking Inquiry — ${formData.destinationName}`
      : null)                                           ||
    'Booking Inquiry'

  const payload = {
    name,
    email,
    message,
    subject,
    phone:                 resolvePhone(formData),
    trip_type:             formData.trip_type || formData.tripType   || null,
    travel_date:           formData.travel_date || formData.travelDate ||
                           formData.startDate   || null,
    number_of_travelers:   formData.number_of_travelers ||
                           formData.numberOfTravelers   ||
                           formData.adults              || null,
    source: formData.source || 'website',
  }

  if (import.meta.env.DEV) {
    console.info('[sendContactForm] →', `${API_BASE}/contact`)
    console.debug('[sendContactForm] payload:', payload)
  }

  return postJSON(`${API_BASE}/contact`, payload)
}

/* ═══════════════════════════════════════════════════════════════
   2. CHAT MESSAGE (Socket HTTP fallback)
   POST /api/messages/send
═══════════════════════════════════════════════════════════════ */
export const sendChatMessage = async ({
  conversationId,
  body,
  sessionId,
  token,
  metadata = {},
}) => {
  if (!conversationId)
    throw new Error('conversationId is required')
  if (!body?.trim())
    throw new Error('Message body is required')

  const payload = {
    conversationId: Number(conversationId),
    body:           body.trim(),
    sessionId:      sessionId || undefined,
    metadata:       { ...metadata, source: 'http-fallback' },
  }

  if (import.meta.env.DEV) {
    console.info('[sendChatMessage] →', `${API_BASE}/messages/send`, {
      conversationId,
      body: body.slice(0, 60),
    })
  }

  return postJSON(`${API_BASE}/messages/send`, payload, token)
}

/* ═══════════════════════════════════════════════════════════════
   3. BOOKING REQUEST
   POST /api/bookings
═══════════════════════════════════════════════════════════════ */
export const submitBookingRequest = async (formData, token) => {
  if (!formData || typeof formData !== 'object') {
    throw new Error('Form data is required')
  }

  const name      = resolveName(formData).trim()
  const email     = resolveEmail(formData).trim()
  const firstName = formData.firstName || formData.first_name || name.split(' ')[0] || name
  const lastName  = formData.lastName  || formData.last_name  || name.split(' ').slice(1).join(' ') || ''

  /* ── Validation ── */
  if (!firstName)
    throw new Error('First name is required')
  if (!email)
    throw new Error('Email address is required')
  if (!isValidEmail(email))
    throw new Error('Please enter a valid email address')
  if (!formData.agreeToTerms)
    throw new Error('You must agree to the terms and conditions')

  const payload = {
    /* Contact */
    firstName,
    lastName,
    email,
    phone:       resolvePhone(formData) || '',
    country:     formData.country       || '',
    hearAboutUs: formData.hearAboutUs   || '',

    /* Trip */
    destinationId:   formData.destinationId  || null,
    countryId:       formData.countryId      || null,
    categoryId:      formData.categoryId     || null,
    serviceId:       formData.serviceId      || null,
    startDate:       formData.startDate      || null,
    endDate:         formData.endDate        || null,
    isFlexible:      Boolean(formData.isFlexible),
    flexibleMonths:  Array.isArray(formData.flexibleMonths) ? formData.flexibleMonths : [],

    /* Travellers */
    adults:    Number(formData.adults)   || 1,
    children:  Number(formData.children) || 0,
    infants:   Number(formData.infants)  || 0,
    groupType: formData.groupType        || 'couple',

    /* Preferences */
    accommodationType:    formData.accommodationType    || '',
    interests:            Array.isArray(formData.interests) ? formData.interests : [],
    budgetRange:          formData.budgetRange           || '',
    dietaryRequirements:  formData.dietaryRequirements   || '',
    specialRequests:      formData.specialRequests        || '',
    hasMedicalConditions: Boolean(formData.hasMedicalConditions),
    medicalDetails:       formData.medicalDetails         || '',

    /* Meta */
    agreeToTerms:        Boolean(formData.agreeToTerms),
    subscribeNewsletter: Boolean(formData.subscribeNewsletter),
    source: 'website_booking_form',
  }

  if (import.meta.env.DEV) {
    console.info('[submitBookingRequest] →', `${API_BASE}/bookings`, {
      name,
      email,
      destination: payload.destinationId,
      travellers:  payload.adults + payload.children + payload.infants,
    })
  }

  return postJSON(`${API_BASE}/bookings`, payload, token)
}

/* ═══════════════════════════════════════════════════════════════
   LEGACY ALIAS
═══════════════════════════════════════════════════════════════ */
export const sendMessage = sendContactForm
export default sendContactForm