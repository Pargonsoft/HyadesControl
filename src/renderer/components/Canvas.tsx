import React, { Component } from "react";

import Background from "@Components/canvas/Background";
import Stars from "@Components/canvas/Stars";

export default class Canvas extends Component {
  render() {
    const style = {
      backgroundColor: "black",
    };
    const viewBox = [0, 0, window.innerWidth, window.innerHeight];
    return (
      <svg
        width="100%"
        height="100%"
        id="space-game-canvas"
        preserveAspectRatio="none"
        viewBox={viewBox}
        style={style}
      >
        <Background />
        <Stars
          stardata={this.props.data}
          size={[window.innerWidth, window.innerHeight]}
          handler={this.props.handler}
        />
      </svg>
    );
  }
}
