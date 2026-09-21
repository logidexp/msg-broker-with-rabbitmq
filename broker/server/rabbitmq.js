import amqplib from "amqplib";

export const EXCHANGE = "alerts.direct";
export const CHANNELS = ["channel-1", "channel-2"];

const url = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

let channel = null;
let connecting = false;

export async function connectRabbit() {
  if (connecting || channel) {
    return;
  }

  connecting = true;

  while (!channel) {
    try {
      const connection = await amqplib.connect(url);
      connection.on("error", (err) => {
        console.error("rabbitmq connection error", err.message);
      });
      connection.on("close", () => {
        console.error("rabbitmq connection closed");
        channel = null;
        connecting = false;
        setTimeout(() => {
          connectRabbit().catch((err) => {
            console.error("rabbitmq reconnect failed", err.message);
          });
        }, 2000);
      });

      const nextChannel = await connection.createChannel();
      await nextChannel.assertExchange(EXCHANGE, "direct", { durable: true });
      channel = nextChannel;
      connecting = false;
      console.log("rabbitmq connected");
    } catch (err) {
      console.error("rabbitmq connect failed", err.message);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

export async function publishAlert(alert) {
  if (!channel) {
    throw new Error("rabbitmq not connected");
  }

  const sent = channel.publish(
    EXCHANGE,
    alert.channel,
    Buffer.from(JSON.stringify(alert)),
    {
      persistent: true,
      contentType: "application/json",
    },
  );

  if (!sent) {
    throw new Error("rabbitmq publish failed");
  }
}
