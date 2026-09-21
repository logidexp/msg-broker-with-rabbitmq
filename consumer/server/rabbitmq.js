import amqplib from "amqplib";

const EXCHANGE = "alerts.direct";
const QUEUE = "alerts.consumer.direct";
const CHANNELS = ["channel-1", "channel-2"];
const url = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

let connecting = false;

export async function consumeAlerts(onAlert) {
  if (connecting) {
    return;
  }

  connecting = true;

  while (true) {
    try {
      const connection = await amqplib.connect(url);
      connection.on("error", (err) => {
        console.error("rabbitmq connection error", err.message);
      });

      const closed = new Promise((resolve) => {
        connection.on("close", () => {
          console.error("rabbitmq connection closed");
          resolve();
        });
      });

      const channel = await connection.createChannel();
      await channel.assertExchange(EXCHANGE, "direct", { durable: true });
      const queue = await channel.assertQueue(QUEUE, { durable: true });

      for (const routingKey of CHANNELS) {
        await channel.bindQueue(queue.queue, EXCHANGE, routingKey);
      }

      await channel.prefetch(1);
      console.log("rabbitmq connected, consuming alerts");

      await channel.consume(queue.queue, (message) => {
        if (!message) {
          return;
        }

        try {
          const alert = JSON.parse(message.content.toString());
          onAlert({
            ...alert,
            channel: alert.channel || message.fields.routingKey,
          });
          channel.ack(message);
        } catch (err) {
          console.error("invalid alert message", err.message);
          channel.nack(message, false, false);
        }
      });

      connecting = false;
      await closed;
      connecting = true;
    } catch (err) {
      console.error("rabbitmq consume failed", err.message);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}
