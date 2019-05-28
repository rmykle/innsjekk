import React, { Component } from "react";
import WeekStat from "./WeekStat";
import StudentGame from "./StudentGame";
import { shortDateTime, isSameDate } from "../util/DateUtil";

export default class Student extends Component {
  constructor(props) {
    super(props);
    this.state = { pin: "" };
    this.pin = React.createRef();

    this.onCheckIn = this.onCheckIn.bind(this);
    this.sendCheckIn = this.sendCheckIn.bind(this);
  }

  render() {
    const { student, authed, gameData, auction } = this.props;
    const conferenceToday =
      student.weeklySeminar && isSameDate(new Date(), student.weeklySeminar);

    return (
      <div
        className={`student ${
          student.checkedIn ? "checkedIn" : conferenceToday ? "conference" : ""
        }`}
        onClick={() => (this.pin.current ? this.pin.current.focus() : () => {})}
      >
        <div>
          <p className="name">{student.name}</p>
          <div className="prizeRoom">
            {student.room ? <p name="room">{student.room}</p> : null}
          </div>
          <p className="attendence">{`${student.attendence} ${
            student.attendence === 1 ? "innsjekk" : "innsjekker"
          } ${student.legacy ? ` - ${student.legacy} veil.` : ""}`}</p>
          <div className="historyWeek">
            <WeekStat week={student.week} />
          </div>
          <p className="checkInStatus">
            {student.checkedIn
              ? `Innsjekk ${shortDateTime(student.checkedIn)}`
              : conferenceToday
              ? `Konferanse ${shortDateTime(student.weeklySeminar)}`
              : null}
          </p>
          {this.props.message ? (
            <p className="cardError">{this.props.message}</p>
          ) : null}
        </div>
        <div className="rightPanel">
          <div className="studentIcons">
            <i
              className={`material-icons ${
                student.checkedIn ? "checkedIn" : ""
              }`}
            >
              {student.checkedIn ? "check_circle" : "not_interested"}
            </i>
          </div>
        </div>

        <>
          <div className="authPanel">
            {authed && authed.user === student.name ? (
              !student.checkedIn && !conferenceToday ? (
                <>
                  <button
                    onClick={() => this.checkIn(this.sendCheckIn, authed)}
                  >
                    Sjekk inn
                  </button>
                  {!student.weeklySeminar ? (
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Du kan kun dra på konferanse en gang i uka, og vil ikke ha mulighet til å sjekke inn i dag. Sikker på at du vil dra?"
                          )
                        ) {
                          this.props.sendMessage("conference");
                        }
                      }}
                    >
                      Konferanse
                    </button>
                  ) : null}
                </>
              ) : null
            ) : !authed ? (
              <form onSubmit={this.onCheckIn}>
                <input
                  value={this.state.pin}
                  placeholder="PIN"
                  onChange={e => this.onPinChange(e)}
                  ref={this.pin}
                  type="password"
                />
              </form>
            ) : null}
          </div>
          {student.attendence >= 1 && gameData ? (
            <StudentGame
              auction={auction}
              score={student.score}
              sendMessage={this.props.sendMessage}
              gameData={this.props.gameData}
              authed={authed}
            />
          ) : null}
        </>
      </div>
    );
  }

  onPinChange(e) {
    const { value } = e.target;
    if (value.length <= 4) {
      this.setState({ pin: value }, () => {
        if (this.state.pin.length === 4) {
          this.setState({ pin: "" });
          this.login();
        }
      });
    }
  }

  login() {
    localStorage.setItem("last_name", this.props.student.name);
    this.props.sendMessage("login", {
      name: this.props.student.name,
      pin: this.state.pin
    });
  }
  onCheckIn(e) {
    e.preventDefault();
  }

  sendCheckIn(data) {
    this.props.sendMessage("checkedIn", data);
  }

  checkIn(sendCheckin) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function(result) {
          const coords = result.coords;

          sendCheckin({
            lat: coords.latitude,
            lon: coords.longitude
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
  }
}
