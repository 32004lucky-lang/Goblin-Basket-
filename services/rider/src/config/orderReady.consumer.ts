import axios from "axios";
import { getChannel } from "./rabbitmq.js";
import { Rider } from "../model/Rider.js";

const processedOrderEvents = new Set<string>();

export const startOrderReadyConsumer = async () => {
  const channel = getChannel();
  if (!channel) {
    console.warn("⚠️ RabbitMQ channel not available. Skipping orderReady consumer.");
    return;
  }

  console.log("Starting to consume from:", process.env.ORDER_READY_QUEUE);

  // Set prefetch to distribute work evenly across consumers
  try {
    await channel.prefetch(1);
  } catch (err) {
    console.warn("Could not set prefetch on channel:", err);
  }

  channel.consume(process.env.ORDER_READY_QUEUE!, async (msg) => {
    if (!msg) return;

    try {
      console.log("Recieved Message", msg.content.toString());

      const event = JSON.parse(msg.content.toString());

      console.log("event type", event.type);

      if (event.type !== "ORDER_READY_FOR_RIDER") {
        console.log("skipping non-order-ready-for-rider event");
        channel.ack(msg);
        return;
      }

      const { orderId, restaurantId, location } = event.data;

      // Idempotency check: prevent duplicate notifications for the same order dispatch cycle
      const eventKey = `${orderId}_${location?.coordinates?.join(",") || ""}`;
      if (processedOrderEvents.has(eventKey)) {
        console.log(`Order ${orderId} already processed by this consumer instance, skipping.`);
        channel.ack(msg);
        return;
      }
      processedOrderEvents.add(eventKey);
      // Clean up set after 10 minutes to avoid memory leak
      setTimeout(() => processedOrderEvents.delete(eventKey), 10 * 60 * 1000);

      console.log("Searching for rider near:", location);

      const riders = await Rider.find({
        isAvailble: true,
        location: {
          $near: {
            $geometry: location,
            $maxDistance: 5000,
          },
        },
      });

      console.log(`Found ${riders.length} nearby riders`);

      if (riders.length === 0) {
        console.log("No riders available nearby");
        channel.ack(msg);
        return;
      }

      for (const rider of riders) {
        console.log(`Notifying rider userId: ${rider.userId}`);

        try {
          await axios.post(
            `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
            {
              event: "order:available",
              room: `user:${rider.userId}`,
              payload: { orderId, restaurantId },
            },
            {
              headers: {
                "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
              },
            }
          );
          console.log(`Notified rider ${rider.userId} successfully`);
        } catch (error) {
          console.log(`Failed to notify rider ${rider.userId}`);
        }
      }

      channel.ack(msg);
      console.log("Message acknowledged");
    } catch (error) {
      console.log("OrderReady consumer error:", error);
    }
  });
};
