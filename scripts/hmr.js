import { WebSocketServer } from "ws";

export default class HMR {
  static RELOAD_MESSAGE = "reload";
  constructor(port = 4003, domain = "localhost") {
    this.wss = new WebSocketServer({ port });
    this.domain = domain;
    this.port = port;
  }

  onConnection(cb) {
    this.wss.on("connection", cb);
  }

  reloadClients() {
    this.wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(HMR.RELOAD_MESSAGE);
      }
    });
  }

  getClientScript() {
    return `
      const socket = new WebSocket("ws://${this.domain}:${this.port}");
      socket.addEventListener("message", (event) => {
        if (event.data === "${HMR.RELOAD_MESSAGE}") {
          console.log("reloading...");
          window.location.reload();
        }
      });

      socket.addEventListener("close", () => {
        console.log("WebSocket connection closed");
      });
    `;
  }
}
