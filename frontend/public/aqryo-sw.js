self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      title: "AQRYO",
      body: event.data ? event.data.text() : "Yeni bir bildirimin var.",
    };
  }

  const title = data.title || "AQRYO";
  const options = {
    body: data.body || "Yeni bir bildirimin var.",
    icon: data.icon || "/aqryo-q.png",
    badge: data.badge || "/aqryo-q.png",
    tag: data.tag || "aqryo-notification",
    renotify: true,
    data: {
      url: data.url || "/creator-inbox",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(
    event.notification.data?.url || "/creator-inbox",
    self.location.origin,
  ).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }

        return clients.openWindow(targetUrl);
      }),
  );
});
