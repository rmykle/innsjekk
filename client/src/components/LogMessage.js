import React from "react";

const logTitles = { tick: "Tick", checkin: "Innsjekk", auction: "Auksjon" };

export default ({ log, single }) => {
  const { logData: data, logType: type } = log;
  return (
    <li className={single ? "singleLog" : ""}>
      <p>
        <strong>{logTitles[type]}!</strong>{" "}
        {new Date(log.logDate).toLocaleString()}
      </p>
      {(() => {
        switch (type) {
          case "auction":
            return <p>{data}</p>;
          case "checkin":
            return (
              <ul>
                <li>
                  <strong>Sider: {data.score}</strong>
                </li>
                <li>
                  <strong>Credits: {data.credits.toFixed(2)}</strong>
                </li>
              </ul>
            );
          case "tick":
            return (
              <ul>
                <li>
                  <strong>Sider: {data.pages.toFixed(2)}</strong>
                  {data.hfScore ? ` - HF: ${data.hfScore}` : null}
                  {data.lawScore ? ` - Jus: ${data.lawScore}` : null}
                  {data.legacyScore ? ` - Veil: ${data.legacyScore}` : null}
                </li>
                <li>
                  <strong> Credits: {data.credits.toFixed(2)}</strong>
                  {data.biScore ? ` - BI: ${data.biScore.toFixed(2)}` : null}
                  {data.appScore ? ` - App: ${data.appScore.toFixed(2)}` : null}
                  {data.creditCore
                    ? ` - Inn: ${data.creditCore.toFixed(2)}`
                    : null}
                </li>
              </ul>
            );

          default:
            return null;
        }
      })()}
    </li>
  );
};
