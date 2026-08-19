import crypto from "crypto";
import { Webhook, IWebhook } from "../models/webhook.model.js";
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

  private static async sendPayloadToHook(hook: IWebhook, event: string, payload: unknown): Promise<void> {
    const body = JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    });

    try {
      const signature = crypto
        .createHmac("sha256", hook.secret)
        .update(body)
        .digest("hex");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Quill-Signature": signature,
        "X-Quill-Event": event,
      };

      if (hook.secret) {
        headers["Authorization"] = `Bearer ${hook.secret}`;
      }

      await fetch(hook.url, {
        method: "POST",
        headers,
        body,
      });

      hook.lastTriggeredAt = new Date();
      await hook.save();

      logger.info({ webhookId: hook._id, url: hook.url, event }, "Webhook dispatched successfully");
    } catch (error) {
      hook.failureCount = (hook.failureCount || 0) + 1;
      await hook.save();
      logger.error({ webhookId: hook._id, error }, "Webhook HTTP dispatch error");
    }
  }

  public static async dispatchWebhook(event: string, payload: unknown): Promise<void> {
    const webhooks = await Webhook.find({
      $or: [{ event: event }, { events: event }],
      isActive: true,
    });

    if (!webhooks.length) return;

    for (const hook of webhooks) {
      await this.sendPayloadToHook(hook, event, payload);
    }
  }

  public static async sendTestEvent(webhookId: string): Promise<boolean> {
    const hook = await Webhook.findById(webhookId);
    if (!hook) return false;

    await this.sendPayloadToHook(hook, hook.event || "test.event", {
      message: "Synthetic test event payload from Quill Engine",
      webhookId: hook._id,
    });
    return true;
  }
}
