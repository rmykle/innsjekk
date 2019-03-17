import React, { Component } from "react";

export default class Registrer extends Component {
  constructor(props) {
    super(props);
    this.state = { name: "", pin: "", room: "" };
  }
  render() {
    const { name, pin, room } = this.state;
    return (
      <form
        className="registrer"
        onSubmit={e => {
          this.submit(e);
        }}
      >
        <input
          value={name}
          onChange={e => this.setState({ name: e.target.value })}
          type="text"
          placeholder="Navn"
          required
        />
        <input
          onChange={e => this.setState({ pin: e.target.value })}
          value={pin}
          type="number"
          required
          placeholder="PIN for innsjekk"
        />
        <input
          onChange={e => this.setState({ room: e.target.value })}
          value={room}
          type="number"
          placeholder="Lesesal(Valgfri)"
        />
        <input type="submit" value="Registrer" />
      </form>
    );
  }

  submit(e) {
    e.preventDefault();
    this.props.sendMessage("registrer", {
      name: this.state.name,
      pin: this.state.pin,
      room: this.state.room
    });
  }
}
