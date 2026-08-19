import crypto from "crypto";
import { Webhook } from "../models/webhook.model.js";
import { eventBus, QuillEvent } from "../events/eventBus.js";
import { logger } from "../utils/logger.js";

export class WebhookService {
  public static initListeners(): void {
    Object.values(QuillEvent).forEach((eventType) => {
      eventBus.on(eventType, (data) => {
        WebhookService.dispatchWebhook(eventType, data).catch((err) => {
          logger.error({ err, eventType }, "Failed to dispatch webhook event");
        });
      });
    });
  }

  public static async dispatchWebhook(event: string, payload: unknown): Promise<void> {
    const webhooks = await Webhook.find({ events: event, isActive: true });
    if (!webhooks.length) return;

    const body = JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    });

    for (const hook of webhooks) {
      try {
        const signature = crypto
          .createHmac("sha256", hook.secret)
          .update(body)
          .digest("hex");

        await fetch(hook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Quill-Signature": signature,
            "X-Quill-Event": event,
          },
          body,
        });

        logger.info({ webhookId: hook._id, url: hook.url, event }, "Webhook dispatched successfully");
      } catch (error) {
        logger.error({ webhookId: hook._id, error }, "Webhook HTTP dispatch error");
      }
    }
  }

  public static async sendTestEvent(webhookId: string): Promise<boolean> {
    const hook = await Webhook.findById(webhookId);
    if (!hook) return false;

    await WebhookService.dispatchWebhook(hook.event || "test.event", {
      message: "Synthetic test event payload from Quill Engine",
      webhookId: hook._id,
    });
    return true;
  }
}
