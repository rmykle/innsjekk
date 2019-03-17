import React, { Component } from "react";
import axios from "axios";

export default class News extends Component {
  constructor(props) {
    super(props);
    this.state = { news: [] };
  }

  componentDidMount() {
    axios
      .get("https://innsjekk.myklevoll.com/news/news.json")
      .then(({ data }) => {
        this.setState({ news: data });
      })
      .catch(e => console.log(e));
  }

  render() {
    const { news } = this.state;

    if (!news || news.length === 0) return null;
    return (
      <>
        <h3>Stopp pressen</h3>
        <ul className="news">
          {news.map((n, index) => (
            <li key={index}>{n}</li>
          ))}
        </ul>
      </>
    );
  }
}
