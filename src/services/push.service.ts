import webpush from "web-push";

class PushService {
    constructor() {
        if (
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
            process.env.VAPID_PRIVATE_KEY
        ) {
            webpush.setVapidDetails(
                "mailto:support@inrext.com", // Replace with actual support email
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
                process.env.VAPID_PRIVATE_KEY
            );
        } else {
            console.warn("VAPID keys are missing. Push notifications will not work.");
        }
    }

    /**
     * Send a push notification to a specific subscription
     * @param {Object} subscription - The user's push subscription object
     * @param {Object} payload - The notification payload (title, message, url, etc.)
     */
    async sendNotification(subscription, payload) {
        try {
            const result = await webpush.sendNotification(
                subscription,
                JSON.stringify(payload)
            );
            return { success: true, statusCode: result.statusCode };
        } catch (error) {
            console.error("Error sending push notification:", error);

            // Check for expired subscription (410 Gone or 404 Not Found)
            if (error.statusCode === 410 || error.statusCode === 404) {
                return { success: false, error: "SUBSCRIPTION_EXPIRED" };
            }

            return { success: false, error: error.message };
        }
    }
}

export default new PushService();
