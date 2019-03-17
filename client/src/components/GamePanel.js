import React, { useState } from "react";
import ExpandButton from "./ExpandButton";

export default ({ nextTick, students, authed }) => {
  const [showAll, setShowAll] = useState(false);

  let mappedData = students
    .filter(student => student.score)
    .sort((a, b) => b.score - a.score);
  const maxScore = Math.max.apply(
    Math,
    mappedData.map(student => student.score)
  );

  const medals = ["gold", "silver", "bronze"];

  return (
    <div className="game">
      <h3>Masterspelet</h3>
      <p>Neste tick: {new Date(nextTick).toLocaleTimeString()} </p>
      <ul>
        {mappedData
          .filter(
            (student, index) =>
              showAll || index < 10 || (authed && authed.user === student.name)
          )
          .map((student, index) => (
            <li
              key={student.name}
              className={
                authed && authed.user === student.name ? "currentUser" : ""
              }
            >
              <p>
                {student.name} <span>{student.score.toFixed(2)} sider</span>
              </p>
              {index < 3 ? (
                <div className={`medal ${medals[index]}`} />
              ) : (
                <div className="position">{index + 1}.</div>
              )}
              <div
                className="bar"
                style={{ width: `${(student.score / maxScore) * 100}%` }}
              />
            </li>
          ))}
      </ul>
      {mappedData.length > 10 ? (
        <ExpandButton
          onClick={() => setShowAll(!showAll)}
          expanded={showAll}
          large={false}
        />
      ) : null}
    </div>
  );
};
