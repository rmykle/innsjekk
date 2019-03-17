import React, { useState } from "react";
import ExpandButton from "./ExpandButton";

export default () => {
  const [show, setShow] = useState(false);
  return (
    <>
      <div className="help">
        <h3>Hjelp!</h3>
        {show ? (
          <div className={`instructions ${show ? "expanded" : "hidden"}`}>
            <ul>
              <li>"Skriv" flest sider på en uke ved å sjekke inn</li>
              <li>Vær tilkoblet UIB-nett</li>
              <li>Vær på SV-bygget</li>
              <li>Bruk mobil, da GPS-lokasjon på PC er så som så.</li>
              <li>Kjøp oppgraderinger ved hjelp av credits</li>
              <li>
                Hver hele time "ticker" spiller, hvor man får en kreditt og
                oppgraderinger kan gi sider eller credits. Se nøyere beskrivelse
                på hver oppgraderinger.
              </li>
              <li>
                Sider resettes hver uke, mens credits og oppgraderinger beholdes
                (I betaen ihvertfall)
              </li>
              <li>
                Sider per oppmøte: <strong>100</strong>
              </li>
              <li>
                Oppmøte før 09:00: <strong>30</strong>
              </li>
            </ul>
          </div>
        ) : null}
        <ExpandButton
          large={false}
          onClick={() => setShow(!show)}
          expanded={show}
        />
      </div>
    </>
  );
};
