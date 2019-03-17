import React from "react";

export default ({ week }) => {
  return (
    <div className="weekStat">
      <div>
        {week.map((day, index) => (
          <p
            key={index}
            className={day === 1 ? "checkin" : day === 0 ? "nocheckin" : ""}
          >
            {dayKey(index)}
          </p>
        ))}
      </div>
    </div>
  );
};

const dayKey = index => {
  switch (index) {
    case 0:
      return "M";
    case 1:
    case 3:
      return "T";
    case 2:
      return "O";
    case 4:
      return "F";
    case 5:
      return "L";
    case 6:
      return "S";

    default:
      break;
  }
};
