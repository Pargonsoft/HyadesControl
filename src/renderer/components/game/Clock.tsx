import React, { Component } from "react";

export default class Clock extends Component {
  intervalID: any;
  constructor(props: any) {
    super(props);
    this.intervalID = undefined;
    this.state = {
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };
  }

  componentDidMount() {
    this.intervalID = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalID);
  }

  tick() {
    const datetime = new Date();
    this.setState({
      date: datetime.toLocaleDateString(),
      time: datetime.toLocaleTimeString(),
    });
  }

  render() {
    const { date, time } = this.state;
    return (
      <a className="my-auto p-2 place-content-center" href="/#">
        {date}
        <br />
        {time}
      </a>
    );
  }
}
