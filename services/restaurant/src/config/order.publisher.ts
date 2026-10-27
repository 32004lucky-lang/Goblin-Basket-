import { getChannel } from "./rabbitmq.js";

export const publishEvent = async (type: string, data: any) => {
  const channel = getChannel();
  if (!channel) {
    console.warn("⚠️ RabbitMQ channel not available. Skipping publishEvent.");
    return;
  }

  channel.sendToQueue(
    process.env.ORDER_READY_QUEUE!,
    Buffer.from(JSON.stringify({ type, data })),
    { persistent: true }
  );
};
