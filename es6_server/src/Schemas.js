import mongoose, { Schema } from "mongoose";
import { getMonday, getTomorrow } from "./DateUtil";
import { isSameDate } from "./Util";

const StudentSchema = Schema(
  {
    _id: String,
    admin: { type: Boolean, default: false },
    pin: String,
    room: { type: Number, default: 0 },
    records: { type: [Date] },
    credits: { type: Number, default: 0 },
    historicResults: [{ date: Date, position: Number, legacy: Number }],
    weeklySeminar: Date,
    upgrades: {
      "Type med APP-Idé": { type: Number, default: 0 },
      "JUS-student": { type: Number, default: 0 },
      "HF-student": { type: Number, default: 0 },
      "BI-student": { type: Number, default: 0 }
    },
    log: [{ logDate: Date, logType: String, logData: Schema.Types.Mixed }],
    score: { type: Number, default: 0 }
  },
  {
    toObject: {
      virtuals: true
    },
    toJSON: {
      virtuals: true
    }
  }
);

StudentSchema.method("toPublicJson", function() {
  var user = this.toObject();
  delete user.records;
  delete user.credits;
  delete user.id;
  delete user.upgrades;
  delete user.pin;
  delete user.log;
  delete user.__v;
  return user;
});

StudentSchema.method("addToLog", function(message, data) {
  const logObj = { logDate: new Date(), logType: message, logData: data };
  this.log.unshift(logObj);
  this.log = this.log.slice(0, 5);
});

StudentSchema.virtual("attendence").get(function() {
  return this.records.length;
});

StudentSchema.virtual("legacy").get(function() {
  return this.historicResults.reduce((prev, curr) => (prev += curr.legacy), 0);
});
StudentSchema.virtual("name").get(function() {
  return this._id;
});
StudentSchema.virtual("checkedIn").get(function() {
  const today = new Date();
  return this.records.find(rec => isSameDate(rec, today));
});

StudentSchema.virtual("week").get(function() {
  const iterationDate = getMonday();
  const tomorrow = getTomorrow();

  return new Array(7).fill(0).map(() => {
    const isInRecords = this.records.some(
      record =>
        isSameDate(new Date(record), iterationDate) ||
        (this.weeklySeminar && isSameDate(this.weeklySeminar, iterationDate))
    );
    iterationDate.setDate(iterationDate.getDate() + 1);
    if (iterationDate > tomorrow) return -1;
    return isInRecords ? 1 : 0;
  });
});

export const Student = mongoose.model("Student", StudentSchema);
