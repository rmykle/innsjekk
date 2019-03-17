import React, { Component } from "react";
import "./scss/index.scss";
import Student from "./components/Student";
import Registrer from "./components/Register";
import RegisterQueue from "./components/RegisterQueue";
import First from "./components/First";
import GamePanel from "./components/GamePanel";
import News from "./components/News";
import Auction from "./components/Auction";
import ExpandButton from "./components/ExpandButton";
import Help from "./components/Help";
import Chat from "./components/Chat";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      client: undefined,
      errors: {
        global: undefined,
        users: {}
      },
      showAllAccs: false,
      students: [],
      nextTick: undefined,
      auth: undefined,
      registrerQueue: [],
      personalGame: undefined,
      auction: undefined,
      chatMessages: []
    };
    this.sendMessage = this.sendMessage.bind(this);
    this.noServerConnection = this.noServerConnection.bind(this);
    this.onServerMessage = this.onServerMessage.bind(this);
    this.reconnectAttempts = 1;
  }

  componentDidMount() {
    this.createConnection();
  }

  createConnection() {
    if (
      !this.state.client ||
      (this.state.client.readyState === this.state.client) ===
        this.state.client.CLOSED
    ) {
      const client = new WebSocket("ws://localhost:1337");
      //const client = new WebSocket("wss://innsjekk1.myklevoll.com/server/");
      const instance = this;
      client.onopen = function() {
        instance.reconnectAttempts = 1;
      };

      client.onerror = this.noServerConnection;
      client.onclose = this.noServerConnection;
      client.onmessage = this.onServerMessage;
      this.setState({ client: client });
    }
  }

  render() {
    if (this.state.error)
      return (
        <>
          <header>
            <h1>Innsjekk</h1>
          </header>
          <h2 className="serverError">{this.state.error}</h2>
        </>
      );
    const { students, auth, nextTick, auction, chatMessages } = this.state;

    const loginAcc = auth
      ? students.find(student => student.name === auth.user)
      : students.find(
          student => student.name === localStorage.getItem("last_name")
        );

    const checkInsToday = this.state.students
      .filter(student => student.checkedIn || student.weeklySeminar)
      .sort((a, b) => b.attendence - a.attendence);

    const visibleCheckins = checkInsToday.filter(
      student => !loginAcc || loginAcc.name !== student.name
    );

    return (
      <>
        <header>
          <h1>Innsjekk</h1>
        </header>
        <div className="left">
          <First checkIns={checkInsToday} />
          <News />
          {auction ? <Auction auction={auction} /> : null}
          <GamePanel nextTick={nextTick} students={students} authed={auth} />
        </div>
        <div className="right">
          <Chat
            chatMessages={chatMessages}
            sendMessage={this.sendMessage}
            authed={auth}
          />
          {loginAcc ? (
            <>
              <h3>Deg:</h3>
              {this.setupStudentCard(loginAcc)}
            </>
          ) : null}
          {visibleCheckins.length > 0 ? (
            <>
              <h3>Innsjekket i dag</h3>
              {visibleCheckins.map((student, index) =>
                this.setupStudentCard(student)
              )}
            </>
          ) : null}
          <h3>Ikke innsjekkede</h3>
          {this.state.students
            .filter(
              student =>
                this.state.showAllAccs &&
                !student.checkedIn &&
                (!loginAcc || loginAcc.name !== student.name)
            )
            .sort((a, b) => b.attendence - a.attendence)
            .map((student, index) => this.setupStudentCard(student))}
          <ExpandButton
            onClick={() =>
              this.setState({ showAllAccs: !this.state.showAllAccs })
            }
            large={false}
            expanded={this.state.showAllAccs}
          />

          <Help />
          <h2 className="registrationError">{this.state.errors.global}</h2>
          <RegisterQueue
            registrerQueue={this.state.registrerQueue}
            authed={this.state.auth}
            sendMessage={this.sendMessage}
          />
          <Registrer sendMessage={this.sendMessage} />
        </div>
      </>
    );
  }

  setupStudentCard(student) {
    return (
      <Student
        authed={this.state.auth}
        gameData={
          this.state.auth && this.state.auth.user === student.name
            ? this.state.personalGame
            : null
        }
        auction={
          this.state.auth && this.state.auth.user === student.name
            ? this.state.auction
            : null
        }
        key={student.name}
        student={student}
        sendMessage={this.sendMessage}
        message={this.state.errors.users[student.name]}
      />
    );
  }

  sendMessage(type, data) {
    this.state.client.send(JSON.stringify({ type: type, data: data }));
  }

  onServerMessage(message) {
    const messageJson = JSON.parse(message.data);
    const { type } = messageJson;

    switch (type) {
      case "status":
        this.setState({
          registrerQueue: messageJson.registrerQueue,
          students: this.parsedStudents(messageJson.data),
          nextTick: messageJson.nextTick
        });
        break;
      case "chatMessage":
        const messages = [messageJson.data, ...this.state.chatMessages];
        messages.length = 40;
        this.setState({
          chatMessages: messages.filter(message => message !== null)
        });
        break;
      case "authed":
        this.setState({ auth: messageJson.auth });
        break;
      case "personalGame":
        this.setState({ personalGame: messageJson.data }, () => {
          const credits =
            this.state.personalGame &&
            this.state.personalGame.credits !== undefined
              ? this.state.personalGame.credits
              : undefined;

          document.title = `Innsjekk ${
            credits !== undefined ? ` (${credits.toFixed(2)} creds)` : null
          }`;
        });
        break;
      case "auctionTick":
        this.setState({
          auction: {
            ...this.state.auction,
            countdown: messageJson.countdown
          }
        });
        break;
      case "chatHistory":
        this.setState({ chatMessages: messageJson.data });
        break;
      case "auction":
        this.setState({
          auction: {
            countdown: this.state.auction
              ? this.state.auction.countdown
              : undefined,
            ...messageJson.data,
            deadline: new Date(messageJson.data.deadline)
          }
        });
        break;

      case "error":
        if (messageJson.relatedUser) {
          this.setState({
            errors: {
              ...this.state.errors,
              users: {
                ...this.state.errors.users,
                [messageJson.relatedUser]: messageJson.message
              }
            }
          });
        } else {
          this.setState({
            errors: { ...this.state.errors, global: messageJson.message }
          });
        }
        break;

      default:
        break;
    }
  }

  parsedStudents(data) {
    return data.map(user => {
      return {
        ...user,
        error: "",
        checkedIn: user.checkedIn ? new Date(user.checkedIn) : null,
        weeklySeminar: user.weeklySeminar ? new Date(user.weeklySeminar) : null
      };
    });
  }

  noServerConnection(e) {
    this.setState({
      error: "Du er ikke tilkoblet!"
    });
  }
}

export default App;
