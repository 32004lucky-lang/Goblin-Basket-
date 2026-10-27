import { getChannel } from "./rabbitmq.js";

export const publishPaymentSuccess = async (payload: {
  orderId: string;
  paymentId: string;
  provider: "razorpay" | "stripe";
}) => {
  const channel = getChannel();
  if (!channel) {
    console.warn("⚠️ RabbitMQ channel not available. Skipping publishPaymentSuccess.");
    return;
  }

  channel.sendToQueue(
    process.env.PAYMENT_QUEUE!,
    Buffer.from(
      JSON.stringify({
        type: "PAYMENT_SUCCESS",
        data: payload,
      })
    ),
    { persistent: true }
  );
};
