import { defineWebSocketHandler } from "nitro";

export default defineWebSocketHandler({
  open(peer) {
    peer.subscribe("chat");
    peer.send({
      type: "system",
      message: "Connected. Open another tab to try the chat.",
    });
  },
  message(peer, message) {
    const text = message.text().trim();
    if (!text || text.length > 1000) {
      peer.send({
        type: "error",
        message: "Send between 1 and 1000 characters.",
      });
      return;
    }
    const payload = {
      type: "message",
      id: crypto.randomUUID(),
      user: peer.id,
      message: text,
      timestamp: new Date().toISOString(),
    };
    peer.send(payload);
    peer.publish("chat", payload);
  },
  close(peer) {
    peer.send({ type: "system", message: "Disconnected." });
  },
});
