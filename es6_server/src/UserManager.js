import broadcast, { sendError, broadcastPersonalGame } from "./UserBroadcast";
import crypt from "crypto-js";
import {
  findCheckInToday,
  isNightCheck,
  validateNewUser,
  isSameDate
} from "./Util";
import { registrationQueue } from "./index";
import { gameCheckIn } from "./Game";
import verifyUserLocation from "./LocationChecker";
import { Student } from "./Schemas";

export const login = (data, connection) => {
  Student.findOne(
    { _id: data.name, pin: crypt.MD5(data.pin).toString() },
    (err, user) => {
      if (err || !user) sendError("FEIL PIN", connection, data.name);
      else {
        connection.auth = { user: user._id, admin: user.admin };
        connection.send(
          JSON.stringify({
            type: "authed",
            auth: connection.auth
          })
        );
        broadcastPersonalGame(user, connection);
        sendError("", connection, data.name);
      }
    }
  );
};

export const checkIn = (data, connection) => {
  const { auth } = connection;
  try {
    if (!auth.user) {
      throw "Ikke logget inn";
    }
    verifyUserLocation(data, connection);
    isNightCheck();
  } catch (e) {
    sendError(e, connection, auth.user);
    return;
  }
  Student.findById(auth.user, function(err, user) {
    if (!user || user.checkedIn) return;
    if (
      user.weeklySeminar &&
      isSameDate(new Date(user.weeklySeminar), new Date())
    ) {
      return;
      console.log("allerede konferansiert");
    }

    user.records.push(new Date());
    gameCheckIn(user, connection);

    user.save(() => broadcast());
  });
};

export const conference = connection => {
  const { auth } = connection;
  if (!auth || !auth.user) return;
  Student.findById(auth.user, function(err, user) {
    if (user.weeklySeminar) return;
    user.weeklySeminar = new Date();
    gameCheckIn(user, connection, conference);
    user.save(() => {
      broadcast();
    });
  });
};

export const registrer = (data, connection) => {
  let error = "";
  const { name, pin } = data;
  Student.find({ _id: new RegExp(`^${name.trim()}$`, "i") }, function(
    err,
    result
  ) {
    if (result.length > 0) {
      error = "Navn allerede registert";
    } else {
      try {
        validateNewUser(name, pin);
        registrationQueue.push({
          name: data.name.trim(),
          pin: crypt.MD5(data.pin).toString(),
          room: data.room
        });
        broadcast();
      } catch (e) {
        error = e;
      }
    }
  });
  sendError(error, connection);
};

export const newUserAction = (data, connection, accept) => {
  if (connection.auth.admin) {
    const candidate = registrationQueue.splice(
      registrationQueue.map(user => user.name).indexOf(data["user"].name),
      1
    )[0];

    if (candidate && accept) {
      const newUser = new Student({
        _id: candidate.name,
        pin: candidate.pin,
        room: candidate.room
      });
      newUser.save(() => broadcast());
    } else {
      broadcast();
    }
  }
};
