import React from "react";

export default ({ onClick, expanded, large }) => {
  return (
    <div
      className={`expandButton ${large ? "large" : "small"}`}
      onClick={() => onClick()}
    >
      <i className="material-icons">{`keyboard_arrow_${
        expanded ? "up" : "down"
      }`}</i>
    </div>
  );
};
