import fs from "fs";

const root = process.env["INNSJEKK_DATA"];

export const readAuction = () => {
  if (!fs.existsSync(root + "auction.json")) {
    return undefined;
  }
  return JSON.parse(fs.readFileSync(root + "auction.json"));
};
export const saveAuction = data => {
  fs.writeFileSync(root + "auction.json", JSON.stringify(data, null, 2));
};

export const incrementCheckIns = () => {
  const previous = readCurrentRound();
  previous.checkins += 1;
  saveCurrentRound(previous);
};

export const resetCheckins = () => {
  const previous = readCurrentRound();
  previous.checkins = 0;
  saveCurrentRound(previous);
};

export const readCurrentRound = () => {
  return JSON.parse(fs.readFileSync(root + "current.json"));
};
const saveCurrentRound = data => {
  fs.writeFileSync(root + "current.json", JSON.stringify(data, null, 2));
};
