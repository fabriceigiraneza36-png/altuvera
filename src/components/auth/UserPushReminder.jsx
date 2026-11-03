import React, { useCallback, useEffect, useState } from 'react'
import { BellRing, ShieldCheck, X, RefreshCw, Settings2 } from 'lucide-react'
import { useUserAuth } from '../../context/UserAuthContext'

const API_BASE = (import.meta.env.VITE_API_URL || 'https://backend-jd8f.onrender.com/api').replace(/\/+$/, '')

const getToken = (contextToken) => {
  if (contextToken) return contextToken
  try {
    return localStorage.getItem('altuvera_auth_token') ||
      sessionStorage.getItem('altuvera_auth_token') || ''
  } catch {
    return ''
  }
}

const base64UrlToBytes = (value) => {
  const padding = '='.repeat((4 - value.length % 4) % 4)
  const normalized = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(normalized)
  const bytes = new Uint8Array(raw.length)
  for (let index = 0; index < raw.length; index += 1) bytes[index] = raw.charCodeAt(index)
  return bytes
}

export default function UserPushReminder () {
  const { user, isAuthenticated, token } = useUserAuth()
  const [status, setStatus] = useState('checking')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [dismissed, setDismissed] = useState(false)

  const syncSubscription = useCallback(async (subscription) => {
    const authToken = getToken(token)
    if (!authToken) throw new Error('Your sign-in session could not be verified. Please sign in again.')
    const json = subscription?.toJSON?.()
    if (!subscription?.endpoint || !json?.keys?.p256dh || !json?.keys?.auth) {
      throw new Error('The browser returned an incomplete push subscription. Please try again.')
    }
    const response = await fetch(API_BASE + '/push/subscribe', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + authToken,
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
        userAgent: navigator.userAgent,
      }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Altuvera could not register this browser yet.')
    }
    return true
  }, [token])

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setStatus('hidden')
      return undefined
    }

    let active = true
    const inspect = async () => {
      try {
        if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
          if (active) setStatus('unsupported')
          return
        }

        const deliveryResponse = await fetch(API_BASE + '/push/user-delivery-status', { cache: 'no-store' }).catch(() => null)
        if (deliveryResponse?.ok) {
          const delivery = await deliveryResponse.json().catch(() => ({}))
          if (delivery.success && delivery.enabled === false) {
            if (active) setStatus('disabled')
            return
          }
        }

        const registration = await navigator.serviceWorker.register('/push-sw.js', { scope: '/' })
        const existing = await registration.pushManager.getSubscription()
        if (existing && Notification.permission === 'granted') {
          await syncSubscription(existing)
          if (active) setStatus('enabled')
          return
        }

        if (!active) return
        setStatus(Notification.permission === 'denied' ? 'blocked' : 'needs')
      } catch (inspectionError) {
        if (active) {
          setError(inspectionError.message || 'Push notifications are not ready in this browser.')
          setStatus(Notification.permission === 'denied' ? 'blocked' : 'needs')
        }
      }
    }

    inspect()
    return () => { active = false }
  }, [isAuthenticated, user?.id, syncSubscription])

  const enablePush = async () => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        setStatus('unsupported')
        return
      }

      let permission = Notification.permission
      if (permission === 'default') permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'blocked' : 'needs')
        return
      }

      const keyResponse = await fetch(API_BASE + '/push/vapid-public-key', { cache: 'no-store' })
      const keyData = await keyResponse.json().catch(() => ({}))
      if (!keyResponse.ok || !keyData.publicKey) {
        throw new Error('Browser notifications are not configured yet. Please try again later.')
      }

      const registration = await navigator.serviceWorker.register('/push-sw.js', { scope: '/' })
      let subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64UrlToBytes(keyData.publicKey),
        })
      }

      await syncSubscription(subscription)
      setStatus('enabled')
      setDismissed(false)
    } catch (enableError) {
      setError(enableError.message || 'Could not enable browser notifications. Please retry.')
      setStatus(Notification.permission === 'denied' ? 'blocked' : 'error')
    } finally {
      setBusy(false)
    }
  }

  if (!isAuthenticated || !user?.id || dismissed || ['checking', 'hidden', 'enabled', 'disabled', 'unsupported'].includes(status)) return null

  const blocked = status === 'blocked'
  return (
    <section
      role="status"
      aria-live="polite"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap',
        marginBottom: 18, padding: '16px clamp(14px, 3vw, 20px)',
        border: '1px solid #b7e4cc', borderRadius: 17,
        background: 'linear-gradient(115deg,#f0fbf5 0%,#ffffff 72%)',
        boxShadow: '0 5px 18px rgba(15,23,42,.045)',
      }}
    >
      <div style={{
        width: 42, height: 42, flex: '0 0 42px', display: 'grid', placeItems: 'center',
        borderRadius: 13, background: '#d9f5e5', color: '#047857',
      }}>
        {blocked ? <Settings2 size={20}/> : <BellRing size={20}/>}
      </div>

      <div style={{ flex: '1 1 220px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, color: '#12382a', fontSize: 14, fontWeight: 800 }}>
            {blocked ? 'Allow Altuvera notifications in your browser' : 'Stay updated when you are away'}
          </h3>
          <span style={{
            padding: '3px 7px', borderRadius: 999, background: '#e0f5e9',
            color: '#047857', fontSize: 9, fontWeight: 850, letterSpacing: '.06em',
            textTransform: 'uppercase',
          }}>Browser alerts</span>
        </div>
        <p style={{ margin: '5px 0 0', color: '#52665c', fontSize: 12, lineHeight: 1.6 }}>
          {blocked
            ? 'Notifications are blocked for this site. Open your browser site settings, change Notifications to Allow, then refresh this page.'
            : 'Enable browser notifications to receive important booking updates, messages, and Altuvera account alerts even when this website is closed.'}
        </p>
        {error && <p style={{ margin: '7px 0 0', color: '#b91c1c', fontSize: 12, lineHeight: 1.5 }}>{error}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
        {!blocked ? (
          <button type="button" onClick={enablePush} disabled={busy} style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '10px 14px', border: 0, borderRadius: 11, background: '#047857',
            color: '#fff', fontSize: 12, fontWeight: 800, cursor: busy ? 'wait' : 'pointer',
            opacity: busy ? .7 : 1, whiteSpace: 'nowrap',
          }}>
            {busy ? <RefreshCw size={14} className="animate-spin"/> : <ShieldCheck size={14}/>}
            {busy ? 'Enabling…' : status === 'error' ? 'Try again' : 'Enable notifications'}
          </button>
        ) : (
          <button type="button" onClick={() => window.location.reload()} style={{
            padding: '10px 13px', border: '1px solid #b7e4cc', borderRadius: 11,
            background: '#fff', color: '#047857', fontSize: 12, fontWeight: 800,
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}>Refresh page</button>
        )}
        <button type="button" aria-label="Dismiss push reminder" onClick={() => setDismissed(true)} style={{
          width: 34, height: 34, display: 'grid', placeItems: 'center',
          border: '1px solid #d8e9df', borderRadius: 10, background: '#fff',
          color: '#728278', cursor: 'pointer',
        }}><X size={16}/></button>
      </div>
    </section>
  )
}
