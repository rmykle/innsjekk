import elements from "./Elements";
import { findCheckInToday, addToLog, isNightCheck, isSameDate } from "./Util";
import { mappedUserElements } from "./Elements";
import broadcast, {
  broadcastPersonalGame,
  broadcastPersonalGames
} from "./UserBroadcast";
import verifyUserLocation from "./LocationChecker";
import { Student } from "./Schemas";
import { incrementCheckIns, resetCheckins } from "./IO";
const CHECKIN_SCORE = 100;
const CHECKIN_EARLY_SCORE = 30;
const CONFERENCE_MODIFIER = 0.75;

export function tick() {
  Student.find({ score: { $gte: 100 } }, async function(err, results) {
    await Promise.all(
      results.map(async student => {
        const logValues = { pages: 0, credits: 0 };

        coreTick(student, logValues);
        if (student.upgrades) {
          hfTick(student, logValues);
          lawTick(student, logValues);
          appTick(student, logValues);
        }

        const legacyScore = 0.001 * student.legacy * logValues["pages"];
        student.score += legacyScore;
        logValues["legacyScore"] = legacyScore.toFixed(2);
        logValues["pages"] += legacyScore;

        addToLog(student, "tick", logValues);
        await student.save();
        console.log("kek");
      })
    );
    broadcast();
    broadcastPersonalGames();
  });
}

const coreTick = (student, log) => {
  const loggedInToday = findCheckInToday(student);
  const conferenceToday = student.weeklySeminar
    ? isSameDate(new Date(), student.weeklySeminar)
    : false;
  if (loggedInToday || conferenceToday) {
    const creditCore = 1;
    log["credits"] += creditCore;
    log["creditCore"] = creditCore;
    student.credits += creditCore;
  }
};

const hfTick = (student, log) => {
  const worker = student.upgrades["HF-student"];
  const element = elements.find(ele => ele.name === "HF-student");

  if (worker) {
    const hfScore = element.getValue() * worker;
    log["pages"] += hfScore;
    log["hfScore"] = hfScore;
    student.score += hfScore;
    return hfScore;
  }
};

const lawTick = (student, log) => {
  const element = elements.find(ele => ele.name === "JUS-student");
  const lawCount = student.upgrades["JUS-student"];
  const loggedInToday = findCheckInToday(student);
  const conferenceToday = student.weeklySeminar
    ? isSameDate(new Date(), student.weeklySeminar)
    : false;

  if (lawCount > 0 && (loggedInToday || conferenceToday)) {
    const lawScore =
      element.getValue() *
      lawCount *
      (conferenceToday ? CONFERENCE_MODIFIER : 1);
    log["pages"] += lawScore;
    log["lawScore"] = lawScore;
    student.score += lawScore;
  }
};

const appTick = (student, log) => {
  const appCount = student.upgrades["Type med APP-Idé"];
  const element = elements.find(ele => ele.name === "Type med APP-Idé");
  const loggedInToday = findCheckInToday(student);
  const conferenceToday = student.weeklySeminar
    ? isSameDate(new Date(), student.weeklySeminar)
    : false;
  if (appCount > 0) {
    const appScore =
      element.getValue(
        student.score,
        appCount,
        loggedInToday || conferenceToday
      ) * (conferenceToday ? CONFERENCE_MODIFIER : 1);
    log["credits"] += appScore;
    log["appScore"] = appScore;
    student.credits += appScore;
  }
};

export const newRound = () => {
  console.log("newgame!", new Date().toISOString());
  resetCheckins();
  Student.find({}, (err, result) => {
    if (!result || result.length === 0) return;
    result
      .filter(player => player.score && player.score >= 100)
      .sort((a, b) => b.score - a.score)
      .forEach((player, index) => {
        player.score = 0;
        player.credits = 0;
        Object.keys(player.upgrades).forEach(key => (player.upgrades[key] = 0));
        player.historicResults.push({
          date: new Date(),
          position: index + 1,
          legacy: result.length - index
        });
        player.save();
      });

    broadcast();
    broadcastPersonalGames();
  });
};

export const gameCheckIn = (user, connection, conference) => {
  const checkinHour = new Date().getHours();
  incrementCheckIns();
  const addScore =
    (checkinHour < 9 ? CHECKIN_EARLY_SCORE + CHECKIN_SCORE : CHECKIN_SCORE) *
    (conference ? CONFERENCE_MODIFIER : 1);
  if (user.score === undefined) user.score = 0;
  user.score += addScore;

  // bi
  const multiplierCount = user.upgrades["BI-student"];
  const credits =
    5 * (multiplierCount && multiplierCount > 0 ? multiplierCount + 1 : 1);
  user.credits += credits;

  addToLog(user, "checkin", { score: addScore, credits });

  broadcastPersonalGame(user, connection);
};

export const buyUpgrade = (data, connection) => {
  const { upgrade, coords } = data;

  const username = connection.auth.user;
  Student.findById(username, function(err, user) {
    if (!user) return;

    const mappedElements = mappedUserElements(user);
    const selectedUpgrade = mappedElements.find(up => up.name === upgrade);
    try {
      verifyUserLocation(coords, connection);
      isNightCheck();
      isAffordable(user, selectedUpgrade);
    } catch (e) {
      broadcastPersonalGame(user, connection, e);
      return;
    }

    user.credits -= selectedUpgrade.nextPrice;
    user.upgrades[selectedUpgrade.name] = selectedUpgrade.count + 1;
    user.save(() => broadcastPersonalGame(user, null, ""));
  });
};

const isAffordable = (student, selectedUpgrade) => {
  if (student.credits < selectedUpgrade.nextPrice)
    throw "Litt for lite credits.";
};
