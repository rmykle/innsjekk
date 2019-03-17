import { server } from "./index";

const messages = [];

export const addMessage = (connection, message) => {
  if (connection.auth && message && message.length <= 160) {
    const newMessage = {
      sender: connection.auth.user,
      message: message,
      date: new Date()
    };
    messages.unshift(newMessage);
    messages.length = 40;

    server.wsServer.connections.forEach(connection => {
      connection.send(
        JSON.stringify({ type: "chatMessage", data: newMessage })
      );
    });
  }
};

export const sendMessageHistory = conn => {
  conn.send(
    JSON.stringify({
      type: "chatHistory",
      data: messages.filter(message => message !== null)
    })
  );
};
