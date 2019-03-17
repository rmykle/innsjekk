import { getMonday } from "./DateUtil";
import { Student } from "./Schemas";

export const isSameDate = (a, b) => {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
};

export const findCheckInToday = user => {
  const today = new Date();
  return user.records.find(record => {
    const recordDate = new Date(record);
    return isSameDate(today, recordDate);
  });
};

export const addToLog = (user, message, data) => {
  const obj = { logDate: new Date(), logType: message, logData: data };
  if (!user.log) user.log = [];
  user.log.unshift(obj);
  user.log = user.log.slice(0, 5);
};

export const isNightCheck = () => {
  const currentHours = new Date().getHours();
  if (currentHours >= 0 && currentHours < 6) {
    throw "Ingen pålogging på natta! Legg deg..";
  }
};

export const loginsThisWeek = () => {
  return new Promise((resolve, reject) => {
    Student.find({}, function(err, result) {
      const monday = getMonday();
      const today = new Date();
      const logins = result.reduce((prev, curr) => {
        return (prev += curr.records.reduce((innerPrev, innerCurr) => {
          const recordDate = new Date(innerCurr);
          if (recordDate >= monday && !isSameDate(today, recordDate)) {
            innerPrev++;
          }

          return innerPrev;
        }, 0));
      }, 0);
      resolve(logins);
    });
  });
};

export const validateNewUser = (name, pin) => {
  if (name.length > 20) {
    throw "Max 20 tegn i navn";
  } else if (name.length < 2) throw "Minst 2 tegn i navn";
  else if (pin.length < 4) throw "Minst fire tegn i PIN";
  return true;
};
