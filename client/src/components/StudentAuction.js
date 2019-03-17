import React, { Component } from "react";
import ExpandButton from "./ExpandButton";

export default class StudentAction extends Component {
  constructor(props) {
    super(props);
    if (localStorage.getItem("auctionWarning") === undefined)
      localStorage.setItem("auctionWarning", false);
    this.state = {
      showHelp: false,
      notification: localStorage.getItem("auctionWarning")
    };
  }

  render() {
    const { auction, student, sendMessage, authed } = this.props;
    const { notification, showHelp } = this.state;
    if (!auction) return null;

    return (
      <>
        <div className="auction">
          <p>Deadline: {auction.deadline.toLocaleTimeString()}</p>
          <div className="auctionInfo">
            <div>
              <p>Salgsobject</p>
              <p>{auction.pages} sider</p>
            </div>
            <div>
              <p>{auction.isActive ? "Bud" : "Bud"}</p>
              <p>{auction.price} credits</p>
            </div>
            <div>
              <p>Bud av </p>

              {auction.leader ? (
                <p>{auction.leader} </p>
              ) : (
                <p className="nobids">Ingen</p>
              )}
            </div>
          </div>
          <p className="countdown">
            {auction.countdown
              ? `${auction.countdown} ${
                  auction.countdown !== "Avsluttet" ? "sekunder igjen" : ""
                }`
              : ""}
          </p>
          <p>{auction.message}</p>
          {auction.isActive ? (
            <button
              className={
                student.credits < auction.nextPrice ? "isNotAffordable" : ""
              }
              onClick={() => sendMessage("bid", authed)}
            >
              Legg inn bud - {auction.nextPrice} credits
            </button>
          ) : (
            "Ingen aktiv runde"
          )}

          <div className="help">
            {this.state.showHelp ? (
              <ul>
                <li>Kjøp sider gjennom daglige auksjoner</li>
                <li>
                  Det er to runder, en på formiddagen og en på ettermiddagen
                </li>
                <li>Høyeste bud når auksjonen avsluttes vinner</li>
                <li>
                  Credits betales ved bud, og blir refundert om noen byr over
                  deg
                </li>
                <li>
                  Bud de siste 30 sekundene før deadline medfører utvided
                  deadline
                </li>
              </ul>
            ) : null}

            <div className="helpToggle">
              Vis hjelp
              <ExpandButton
                expanded={showHelp}
                large={false}
                onClick={() => this.setState({ showHelp: !showHelp })}
              />
            </div>
          </div>
        </div>
      </>
    );
  }
}
