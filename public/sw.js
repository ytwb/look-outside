const EYE_REST_DURATION_SECONDS = 20;

self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;

  if (event.action !== "start-eye-rest") {
    notification.close();
    return;
  }

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });

      clients.forEach((client) => {
        client.postMessage({
          notificationHistoryId: notification.data?.notificationHistoryId,
          type: "start-eye-rest",
        });
      });

      await self.registration.showNotification(notification.title, {
        body: notification.data?.inProgressBody ?? notification.body,
        data: notification.data,
        requireInteraction: true,
        tag: notification.tag,
      });

      await new Promise((resolve) => setTimeout(resolve, EYE_REST_DURATION_SECONDS * 1000));

      const notifications = await self.registration.getNotifications({ tag: notification.tag });
      notifications.forEach((currentNotification) => currentNotification.close());
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("install", () => {
  self.skipWaiting();
});
