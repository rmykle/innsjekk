import React from "react";

export default ({ registrerQueue, authed, sendMessage }) => {
  if (registrerQueue.length === 0) return null;
  return (
    <div className="registrerList">
      <h3>Venter bekreftelse</h3>
      <ul>
        {registrerQueue.map(user => {
          return (
            <li key={user.name}>
              <div>
                <p>{user.name}</p>
                {user.room ? <p>{user.room}</p> : null}
              </div>
              {authed && authed.admin ? (
                <>
                  <button onClick={() => acceptUser(user, sendMessage)}>
                    Godta
                  </button>
                  <button onClick={() => denyUser(user, sendMessage)}>
                    Avvis
                  </button>
                </>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const acceptUser = (user, sendMessage) => {
  sendMessage("acceptUser", { user });
};
const denyUser = (user, sendMessage) => {
  sendMessage("denyUser", { user });
};
