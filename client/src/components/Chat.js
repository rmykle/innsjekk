import React, { Component } from "react";

export default class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = { input: "" };
  }
  render() {
    const { authed, chatMessages } = this.props;

    return (
      <div className="chat">
        <h3>Preik</h3>
        <ul className="messages">
          {chatMessages.map((message, index) => {
            return (
              <li key={index}>
                <p>
                  {message.sender}{" "}
                  <span>{new Date(message.date).toLocaleString()}</span>
                </p>
                <p>{message.message}</p>
              </li>
            );
          })}
        </ul>
        {authed ? (
          <form
            className="newMessage"
            onSubmit={e => {
              e.preventDefault();
              this.sendMessage();
            }}
          >
            <input
              type="text"
              maxLength="160"
              value={this.state.input}
              onChange={e => this.setState({ input: e.target.value })}
            />
            <button type="submit">
              <i className="material-icons">send</i>
            </button>
          </form>
        ) : null}
      </div>
    );
  }

  sendMessage() {
    const { input } = this.state;
    if (input.length > 0 && input.length <= 160) {
      this.props.sendMessage("newMessage", input);
      this.setState({ input: "" });
    }
  }
}
