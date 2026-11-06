/* Altuvera public site — important browser push only. */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

const isRoutineLoginAlert = (data, title, body) => {
  const type = String(data.type || data.data?.type || "").toLowerCase();
  const text = String(title || "") + " " + String(body || "");
  return type === "login_success" ||
    /sign[\s-]?in successful|successful secure sign[\s-]?in|signed in successfully/i.test(text);
};

const isImportantAlert = (data) => {
  const category = String(data.category || data.data?.category || "").toLowerCase();
  const priority = String(data.priority || data.data?.priority || "normal").toLowerCase();
  return category === "booking" ||
    category === "messages" ||
    (category === "package" && ["high", "urgent"].includes(priority)) ||
    (category === "security" && ["high", "urgent"].includes(priority)) ||
    (category === "travel_updates" && ["high", "urgent"].includes(priority)) ||
    priority === "urgent";
};

const notificationTarget = (rawTarget) => {
  const fallback = new URL("/notifications", self.location.origin);
  try {
    const target = new URL(rawTarget || fallback.href, self.location.origin);
    const allowedOrigins = new Set([
      self.location.origin,
      "https://altuverasafaris.com",
      "https://www.altuverasafaris.com",
    ]);
    return allowedOrigins.has(target.origin) ? target : fallback;
  } catch {
    return fallback;
  }
};

self.addEventListener("push", (event) => {
  event.waitUntil((async () => {
    let data = {};
    try {
      data = event.data ? event.data.json() : {};
    } catch {
      data = { body: event.data ? event.data.text() : "" };
    }

    const title = data.title || "Altuvera";
    const body = data.body || data.message || "You have an important update from Altuvera.";
    if (isRoutineLoginAlert(data, title, body) || !isImportantAlert(data)) return;

    const createdAt = Date.parse(data.data?.createdAt || data.createdAt || "");
    if (Number.isFinite(createdAt) && Date.now() - createdAt > 10 * 60 * 1000) return;

    // Do not interrupt a traveller who is actively using the public website.
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const websiteIsActive = windows.some((client) =>
      client.visibilityState === "visible" && (client.focused === true || client.focused == null)
    );
    if (websiteIsActive) return;

    const notificationId = data.data?.notificationId || data.data?.id || data.id || "";
    const createdAtValue = Number.isFinite(createdAt) ? createdAt : Date.now();
    const options = {
      body,
      icon: data.icon || "/favicon.ico",
      badge: data.badge || "/favicon.ico",
      timestamp: createdAtValue,
      tag: data.tag || (notificationId
        ? "altuvera-notification-" + String(notificationId)
        : "altuvera-important-" + String(data.category || "update")),
      renotify: false,
      requireInteraction: data.requireInteraction === true,
      data: {
        ...(data.data && typeof data.data === "object" ? data.data : {}),
        url: notificationTarget(data.data?.url || data.url).href,
      },
    };

    await self.registration.showNotification(title, options);
  })());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = notificationTarget(event.notification.data?.url);
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      let current;
      try { current = new URL(client.url); } catch { continue; }
      if (current.origin !== target.origin || !("focus" in client)) continue;

      if ("navigate" in client && client.url !== target.href) {
        try { await client.navigate(target.href); } catch { /* A fresh tab is the fallback. */ }
      }
      return client.focus();
    }

    // Works when the browser has no open Altuvera tab. The browser opens the
    // exact destination when the user clicks the system notification.
    if (self.clients.openWindow) return self.clients.openWindow(target.href);
    return undefined;
  })());
});
