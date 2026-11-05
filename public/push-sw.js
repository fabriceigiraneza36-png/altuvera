/* Altuvera — Web Push service worker.
 * Persistent notifications are required for reliable mobile browser delivery.
 */
self.addEventListener("push", (event) => {
  event.waitUntil((async () => {
    let data = {};
    try { data = event.data ? event.data.json() : {}; }
    catch { data = { body: event.data ? event.data.text() : "" }; }

    // Keep external browser alerts for moments when the traveller is away from
    // the website. A visible and focused tab already receives the in-app update.
    const windows = await clients.matchAll({ type: "window", includeUncontrolled: true });
    const websiteIsActive = windows.some((client) =>
      client.visibilityState === "visible" && (client.focused === true || client.focused == null)
    );
    if (websiteIsActive) return;

    const title = data.title || "Altuvera";
    const options = {
      body: data.body || "You have a new update from Altuvera.",
      icon: data.icon || "/favicon.ico",
      badge: data.badge || "/favicon.ico",
      tag: data.tag || (data.id ? "altuvera-" + data.id : "altuvera-notification"),
      renotify: Boolean(data.tag),
      data: { ...(data.data || {}), url: data.data?.url || "https://www.altuverasafaris.com/notifications" },
    };

    await self.registration.showNotification(title, options);
  })());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "https://www.altuverasafaris.com/notifications";
  event.waitUntil((async () => {
    const targetUrl = new URL(target, self.location.origin);
    const windows = await clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if (new URL(client.url).origin === targetUrl.origin && "focus" in client) {
        if ("navigate" in client && client.url !== targetUrl.href) {
          try { await client.navigate(targetUrl.href); } catch { /* focus is still useful */ }
        }
        return client.focus();
      }
    }
    if (clients.openWindow) return clients.openWindow(targetUrl.href);
  })());
});
