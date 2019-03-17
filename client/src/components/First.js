import React from "react";

export default ({ checkIns }) => {
  if (checkIns.length === 0) return null;

  const first = checkIns.sort(
    (a, b) => new Date(a.checkedIn) - new Date(b.checkedIn)
  )[0];
  if (!first | !first.checkedIn) return null;

  return (
    <>
      <h3>Dagens morgenfugl</h3>
      <p className="earlyBird">
        {first.name}
        <br />
        {first.checkedIn.toLocaleTimeString()}
      </p>
    </>
  );
};
