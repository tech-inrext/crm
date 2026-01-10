import { useCallback } from "react";
import axios from "axios";

export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface UsePushNotificationsProps {
  user: any;
  pendingRoleSelection: boolean;
}

export const usePushNotifications = ({
  user,
  pendingRoleSelection,
}: UsePushNotificationsProps) => {
  const subscribeToPushNotifications = useCallback(async () => {
    if (
      !user ||
      pendingRoleSelection ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      return;
    }

    try {
      // Register Service Worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered:", registration);

      // Check permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("Notification permission denied");
        return;
      }

      // Subscribe
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error("VAPID public key not found");
        return;
      }

      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      // Send subscription to backend
      await axios.post("/api/v0/notifications/push/subscribe", {
        subscription,
      });

      console.log("Push notification subscription successful");
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
    }
  }, [user, pendingRoleSelection]);

  return { subscribeToPushNotifications };
};
