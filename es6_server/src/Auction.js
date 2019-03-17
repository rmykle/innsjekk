import { readAuction, saveAuction, readCurrentRound } from "./IO";
import { server } from "./index";
import { loginsThisWeek, addToLog } from "./Util";
import broadcast, {
  broadcastPersonalGame,
  broadcastPersonalGames
} from "./UserBroadcast";
import { Student } from "./Schemas";

let countdown = undefined;

export const startCountdown = force => {
  const auction = readAuction();

  if (countdown || !auction) return;

  const deadline = new Date(auction.deadline);
  const countdownTime = new Date(auction.countdownTime);
  const now = new Date();
  if (now >= deadline) return;
  const timeToCountdown =
    now < countdownTime ? new Date(countdownTime).getTime() - now.getTime() : 0;

  countdown = setTimeout(() => {
    const innerTimeout = seconds => {
      setTimeout(() => {
        const auction = readAuction();
        const auctionDeadline = new Date(auction.deadline);

        const currentDiff =
          (auctionDeadline.getTime() - new Date().getTime()) / 1000;
        if (currentDiff > 0) {
          broadcastAuctionCounter(Math.round(currentDiff));
          const nextRound =
            currentDiff < 30
              ? 1
              : currentDiff < 60
              ? currentDiff - 10 < 30
                ? currentDiff - 30
                : 10
              : 30;
          innerTimeout(nextRound * 1000);
        } else {
          endAuction();
        }
      }, seconds);
    };
    innerTimeout(0);
  }, timeToCountdown);
};

async function endAuction() {
  const auction = readAuction();
  auction.isActive = false;
  countdown = undefined;

  await Student.find({}, (err, result) => {
    result.forEach(player => {
      if (player.name === auction.leader) {
        player.score += auction.pages;
        player.addToLog(
          "auction",
          "Du vant " +
            auction.pages +
            " sider for " +
            auction.price +
            " credits!"
        );
      } else {
        const multiplierCount = player.upgrades["BI-student"];
        if (multiplierCount && multiplierCount > 0) {
          const value = auction.price * 0.02 * multiplierCount;
          player.credits += value;
          player.addToLog(
            "auction",
            "Du tjente " +
              value.toFixed(2) +
              " credits på auksjonsspekulasjoner!"
          );
        }
      }
      player.save();
    });
  });
  saveAuction(auction);
  broadcastAuction(null, "");
  broadcastAuctionCounter("");
  broadcast();
  broadcastPersonalGames();
}

export const cancelAuction = () => {
  clearInterval(countdown);
  const auction = readAuction();
  if (auction.leader) {
    Student.findById(auction.leader, function(err, winner) {
      if (winner) {
        winner.credits += auction.price;
        winner.save();
      }
    });
  }
  auction.isActive = false;
  saveAuction(auction);
};

export const broadcastAuction = (connection, message) => {
  const data = readAuction();
  const jsonData = JSON.stringify({
    type: "auction",
    data: Object.assign(data, { message: message })
  });
  if (connection) {
    connection.send(jsonData);
  } else {
    server.wsServer.connections.forEach(conn => conn.send(jsonData));
  }
};

export const broadcastAuctionCounter = count => {
  server.wsServer.connections
    .filter(conn => conn.auth)
    .forEach(conn =>
      conn.send(JSON.stringify({ type: "auctionTick", countdown: count }))
    );
};

export const takeBid = connection => {
  const { auth } = connection;
  if (!auth) return;
  const auction = readAuction();

  (async () => {
    Student.findById(auth.user, async function(err, user) {
      if (!auction || !user) return;
      if (user.credits < auction.nextPrice) {
        broadcastAuction(connection, "Du har ikke råd til dette");
        return;
      } else if (!auction.isActive) {
        broadcastAuction(connection, "Auksjonen er avsluttet");
      } else if (user.name === auction.leader) {
        broadcastAuction(connection, "Du har høyeste bud alt!");
      } else {
        if (auction.leader) {
          await Student.findById(auction.leader, function(err, leader) {
            if (leader) {
              leader.credits += auction.price;
              leader.save();
              server.wsServer.connections
                .filter(conn => conn.auth && conn.auth.user === leader.name)
                .forEach(conn => broadcastPersonalGame(leader, conn));
            }
          });
        }
        auction.leader = user.name;
        user.credits -= auction.nextPrice;
        auction.price = auction.nextPrice;
        auction.nextPrice = calculatePrice(auction.price);

        const deadline = new Date(auction.deadline);
        const now = new Date();
        const timeLeft = (deadline.getTime() - now.getTime()) / 1000;

        if (timeLeft < 30) {
          now.setSeconds(now.getSeconds() + 30);
          auction.deadline = now;
        }
        user.save();
        saveAuction(auction);
        broadcastPersonalGame(user, connection);
        broadcastAuction(null, user.name + " har plassert bud");
      }
    });
  })();
};

const calculatePrice = oldPrice => {
  return Math.round(oldPrice * 1.05) + 1;
};

export async function initAuction(time) {
  if (!time === undefined) return;

  const today = new Date();

  if (time === 0) {
    today.setHours(11, 30, 0, 0);
  } else if (time === 1) {
    today.setHours(15, 30, 0, 0);
  } else if (time === 42) {
    today.setMinutes(today.getMinutes() + 3);
  } else return;

  const countdownTime = new Date(today.getTime());
  countdownTime.setMinutes(countdownTime.getMinutes() - 5);

  const currentRound = readCurrentRound();
  const checkins = currentRound.checkins;

  const sellablePages = 50 + 7 * checkins;

  const price = 1;
  const auction = {
    leader: null,
    countdownTime: countdownTime,
    price: price,
    nextPrice: price,
    pages: sellablePages,
    deadline: today,
    isActive: true
  };
  saveAuction(auction);
  broadcastAuction(null, "");
  startCountdown();
}
