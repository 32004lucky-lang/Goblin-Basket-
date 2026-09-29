import amqp from "amqplib";

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL!);

    channel = await connection.createChannel();

    await channel.assertQueue(process.env.PAYMENT_QUEUE!, {
      durable: true,
    });

    console.log("🐇 connected To Rabbitmq");
  } catch (error) {
    console.error("❌ RabbitMQ connection failed (utils):", error);
    console.log("⚠️  Service will continue without RabbitMQ.");
  }
};

export const getChannel = () => channel;
