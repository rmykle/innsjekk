import server, { registrationQueue } from "./index";
import { Student } from "./Schemas";
import { nextTick } from "./DateUtil";
import { mappedUserElements } from "./Elements";

export async function broadcast(connection) {
  const data = await broadCastData();
  const dataString = JSON.stringify(data);

  if (connection) connection.send(dataString);
  else {
    server.wsServer.connections.forEach(conn => conn.send(dataString));
  }
}

export const broadcastPersonalGame = (user, conn, error) => {
  const data = JSON.stringify({
    type: "personalGame",
    data: {
      credits: user.credits,
      upgrades: mappedUserElements(user),
      log: user.log,
      error: error,
      weeklySeminar: user.weeklySeminar
    }
  });
  if (conn) {
    console.log("heia");

    conn.send(data);
  } else {
    server.wsServer.connections
      .filter(conn => conn.auth && conn.auth.user === user.name)
      .forEach(conn => {
        conn.send(data);
      });
  }
};

export const broadcastPersonalGames = () => {
  server.wsServer.connections.forEach(conn => {
    if (conn.auth) {
      Student.findById(conn.auth.user, (err, user) => {
        if (user) broadcastPersonalGame(user, conn);
      });
    }
  });
};

const broadCastData = () => {
  return new Promise((resolve, reject) => {
    const type = "status";
    Student.find((err, students) => {
      if (err) {
        console.log(err);
        return;
      }
      resolve({
        type,
        nextTick: nextTick(),
        data: students.map(student => student.toPublicJson()),
        registrerQueue: registrationQueue.map(person => ({
          name: person.name,
          room: person.room
        }))
      });
    });
  });
};

export const sendError = (message, connection, relatedUser) => {
  connection.send(
    JSON.stringify({
      type: "error",
      message: message,
      relatedUser: relatedUser
    })
  );
};

export default broadcast;
