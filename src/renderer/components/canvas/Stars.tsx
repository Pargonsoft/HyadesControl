import React, { Component } from 'react';

import Star from './Star';

export default class Stars extends Component {
  constructor(props) {
    super(props);

    this.state = {
      starlist: [
        { name: 'Arcturus', x: 150, y: 125, color: '#f00' },
        { name: 'Sirius', x: 350, y: 125, color: '#0f0' },
        { name: 'Betelgeuse', x: 150, y: 325, color: '#00f' },
        { name: 'Orion', x: 350, y: 325, color: '#ff0' },
      ],
    };
    // TODO: starlist to be updated by this.props.stardata prop that carries values of each star to plot, assign coordinates and color for each star depending of apparent magnitude and spectral type
  }

  render() {
    // TODO: to render the stars, the starlist data must be retrieved from redux, as it will be part of the game state and saved for each game for all its duration.

    const { stardata } = this.props;
    const values = stardata.map((data, i) => {
      return {
        id: i,
        name: data.name,
        starclass: data.class,
        x: Math.floor(Math.random() * this.props.size[0]),
        y: Math.floor(Math.random() * this.props.size[1]),
        color: data.color,
        radius: data.radius,
        planets: data.planets,
      };
    });

    // return this.state.starlist.map((data, i) => {
    return values.map((data, i) => {
      return <Star key={i} data={data} handler={this.props.handler} />;
    });
  }
}
