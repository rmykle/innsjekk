import mongoose, { mongo } from "mongoose";

import {
  checkIn,
  login,
  registrer,
  newUserAction,
  conference
} from "./UserManager";
import { broadcast } from "./UserBroadcast";
import { server as WebSocketServer } from "websocket";
import express from "express";
import { buyUpgrade, tick, newRound } from "./Game";
import {
  broadcastAuction,
  initAuction,
  takeBid,
  startCountdown as startAuctionCountdown,
  cancelAuction
} from "./Auction";
import { addMessage, sendMessageHistory } from "./Chat";

export default class InnsjekkServer {
  constructor() {
    this.setupServer();
    this.setupDB();
  }

  setupDB() {
    mongoose.connect("mongodb://localhost/innsjekk", { useNewUrlParser: true });
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", function() {
      console.log("open");
    });
  }

  withLocalRequestOnly(req, run) {
    const ip = req.headers["x-forwarded-for"];
    const host = req.get("host");
    const isLocal =
      ip === "127.0.0.1" ||
      ip === "::ffff:127.0.0.1" ||
      ip === "::1" ||
      ip === undefined;
    console.log(ip);

    //||      host.indexOf("localhost") !== -1;

    if (isLocal) {
      return JSON.stringify(run());
    } else {
      return "Server init only";
    }
  }

  setupServer() {
    const app = express();
    const server = app.listen(1337);
    this.wsServer = new WebSocketServer({ httpServer: server });

    startAuctionCountdown();

    app.get("/clients", (req, res) => {
      if (!this.wsServer) {
        res.send("no server");
      } else {
        res.send(
          this.wsServer.connections.map(conn =>
            conn.auth ? conn.auth.user : "no-auth"
          )
        );
      }
    });
    app.get("/ip", (req, res) => {
      res.send(
        JSON.stringify(
          req.connection.remoteAddress + " - " + req.headers["x-forwarded-for"]
        )
      );
    });

    app.get("/tickz", (req, res) => {
      res.send(
        this.withLocalRequestOnly(req, () => {
          tick();
          return "TICK! " + new Date();
        })
      );
    });

    app.get("/initauc", (req, res) => {
      res.send(
        this.withLocalRequestOnly(req, () => {
          initAuction(parseInt(req.query.time));
          return "INIT AUC " + new Date();
        })
      );
    });

    app.get("/newz", (req, res) => {
      res.send(
        this.withLocalRequestOnly(req, () => {
          newRound();
          return "New round " + new Date();
        })
      );
    });

    app.get("/cancelauc", (req, res) => {
      res.send(
        this.withLocalRequestOnly(req, () => {
          cancelAuction();
          return "cancel auc " + new Date();
        })
      );
    });

    this.wsServer.on("request", function(request) {
      const connection = request.accept(null, request.origin);
      broadcast(connection);
      broadcastAuction(connection);
      sendMessageHistory(connection);

      connection.on("message", function(message) {
        if (message.type === "utf8") {
          const messageData = JSON.parse(message.utf8Data);
          const { type, data } = messageData;

          switch (type) {
            case "login":
              login(data, connection);
              break;

            case "newMessage":
              addMessage(connection, data);
              break;
            case "buyUpgrade":
              buyUpgrade(data, connection);
              break;
            case "checkedIn":
              checkIn(data, connection);
              break;
            case "conference":
              conference(connection);

              break;
            case "bid":
              takeBid(connection);
              break;
            case "registrer":
              registrer(data, connection);
              break;
            case "acceptUser":
            case "denyUser":
              newUserAction(data, connection, type === "acceptUser");
              break;

            default:
              break;
          }
        }
      });
    });
  }
}
