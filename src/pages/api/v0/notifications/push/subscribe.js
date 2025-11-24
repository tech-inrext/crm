import { Controller } from "@framework";
import dbConnect from "../../../../../lib/mongodb.js";
import Employee from "../../../../../models/Employee.js";

class PushSubscribeController extends Controller {
    constructor() {
        super();
    }

    async post(req, res) {
        try {
            await dbConnect();
            const { employee } = req;
            const { subscription, userAgent } = req.body;

            if (!employee) {
                res.status(401).json({
                    success: false,
                    message: "Authentication required",
                });
                return;
            }

            if (!subscription || !subscription.endpoint) {
                res.status(400).json({
                    success: false,
                    message: "Invalid subscription data",
                });
                return;
            }

            // Check if subscription already exists
            const existingSubscription = employee.pushSubscriptions.find(
                (sub) => sub.endpoint === subscription.endpoint
            );

            if (!existingSubscription) {
                // Add new subscription
                employee.pushSubscriptions.push({
                    endpoint: subscription.endpoint,
                    keys: subscription.keys,
                    userAgent: userAgent || req.headers["user-agent"],
                    createdAt: new Date(),
                });

                await employee.save();
            }

            res.status(200).json({
                success: true,
                message: "Subscription saved successfully",
            });
        } catch (error) {
            console.error("Push subscription error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to save subscription",
            });
        }
    }
}

export default new PushSubscribeController().handler;
