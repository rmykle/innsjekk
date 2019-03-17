import React, { useState } from "react";
import LogMessage from "./LogMessage";
import StudentAuction from "./StudentAuction";

const UPGRADES = 0;
const AUCTION = 1;
const LOG = 2;

export default ({ score, gameData, sendMessage, authed, auction }) => {
  const [selectedCard, setSelectedCard] = useState(UPGRADES);
  const [selectedUpgrade, setSelectedUpgrade] = useState(0);
  const currentUpgrade = gameData.upgrades[selectedUpgrade];

  return (
    <div className="studentGamePanel">
      <table>
        <thead>
          <tr>
            <th>Sider</th>
            <th>Credits</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{score.toFixed(2)}</td>
            <td> {gameData.credits.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      <div className="gameMenu">
        <p
          className={`${selectedCard === UPGRADES ? "activeMenu" : ""}`}
          onClick={() => setSelectedCard(UPGRADES)}
        >
          <i className="material-icons">add_shopping_cart</i>Kjøp
        </p>
        <p
          className={`${selectedCard === AUCTION ? "activeMenu" : ""}`}
          onClick={() => setSelectedCard(AUCTION)}
        >
          {" "}
          <i className="material-icons">gavel</i>Auksjon
        </p>
        <p
          className={`${selectedCard === LOG ? "activeMenu" : ""}`}
          onClick={() => setSelectedCard(LOG)}
        >
          {" "}
          <i className="material-icons">format_list_bulleted</i>Logg
        </p>
      </div>
      {selectedCard === AUCTION ? (
        <StudentAuction
          auction={auction}
          student={gameData}
          sendMessage={sendMessage}
          authed={authed}
        />
      ) : null}

      {selectedCard === UPGRADES ? (
        <>
          <div className="upgrades">
            {gameData.upgrades.map((upgrade, index) => {
              return (
                <div
                  key={upgrade.name}
                  className={index === selectedUpgrade ? "active" : ""}
                  onClick={() => {
                    setSelectedUpgrade(index);
                  }}
                >
                  <i className="material-icons">{upgrade.icon}</i>
                  <p>
                    <strong>${upgrade.nextPrice}</strong>
                  </p>
                  <p>{upgrade.count}</p>
                </div>
              );
            })}
          </div>
          <div className="selectedUpgrade">
            <p className="upgradeName">{currentUpgrade.name}</p>
            <p className="upgradeDesc">{currentUpgrade.desc}</p>
            <p className="upgradeEffect">{currentUpgrade.effect_desc}</p>
            <p className="upgradeCount">
              Du har <strong>{currentUpgrade.count}</strong> fra før
            </p>
            <p className="upgradeError">{gameData.error}</p>
            <button
              className={
                currentUpgrade.nextPrice > gameData.credits
                  ? "nonAffordable"
                  : ""
              }
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    function(result) {
                      const { latitude, longitude } = result.coords;
                      sendMessage("buyUpgrade", {
                        upgrade: currentUpgrade.name,
                        auth: authed,
                        coords: { lat: latitude, lon: longitude }
                      });
                    },
                    function() {
                      alert(
                        "Trenger tillatelse til å hente lokasjon fra deg, slik at jeg ikke trenger å kjøpe den fra Facebook"
                      );
                    }
                  );
                } else {
                  alert("Enhet støtter ikke henting av lokasjon, sorry mac");
                }
              }}
            >
              {currentUpgrade.nextPrice} credits
            </button>
          </div>
        </>
      ) : null}

      {selectedCard === LOG ? (
        <>
          <ul className="events">
            {gameData.log.map((log, index) => {
              return <LogMessage key={index} log={log} />;
            })}
          </ul>
        </>
      ) : null}
    </div>
  );
};
