import React, { Component } from "react";

import { Card, CardContent, CardHeader } from "@Components/ui/card";
import { Button } from "@Components/ui/button";

class StarSystemDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      description: "",
    };
  }

  render() {
    const planets = [
      {
        name: "Sun",
        dist: 0,
        orbitalPeriod: 0,
        rad: 30,
        category: "planets",
        description: "description 1",
      },
      {
        name: "Mercury",
        dist: 0.39,
        orbitalPeriod: 0.24,
        rad: 5,
        category: "planets",
        description: "description 2",
      },
      {
        name: "Venus",
        dist: 0.72,
        orbitalPeriod: 0.62,
        rad: 7,
        category: "planets",
        description: "description 3",
      },
      {
        name: "Earth",
        dist: 1.0,
        orbitalPeriod: 1,
        rad: 7,
        category: "planets",
        description: "description 4",
      },
      {
        name: "Mars",
        dist: 1.52,
        orbitalPeriod: 1.88,
        rad: 7,
        category: "planets",
        description: "description 5",
      },
      {
        name: "Ceres",
        dist: 2.77,
        orbitalPeriod: 4.6,
        rad: 3,
        category: "dwarf",
        description: "description 6",
      },
      {
        name: "Asteroid Belt",
        // NOTE covers area between 2.3 and 3.3, so spot picked
        // between the two (Ceres), with an SVG filter on orbital path to
        // make it fill the gap:
        dist: 2.77,
        // NOTE arbitrary orbital period:
        orbitalPeriod: 100,
        // NOTE no planet
        rad: 0,
        category: "asteroids",
        description: "description 7",
      },
      {
        name: "Jupiter",
        dist: 5.2,
        orbitalPeriod: 11.9,
        rad: 15,
        category: "planets",
        description: "description 8",
      },
      {
        name: "Saturn",
        dist: 9.54,
        orbitalPeriod: 29.5,
        rad: 12,
        category: "planets",
        description: "description 9",
      },
      {
        name: "Uranus",
        dist: 19.2,
        orbitalPeriod: 84,
        rad: 12,
        category: "planets",
        description: "description 10",
      },
      {
        name: "Neptune",
        dist: 30.1,
        orbitalPeriod: 165,
        rad: 12,
        category: "planets",
        description: "description 11",
      },
    ].reverse();

    const viewBox = [
      (window.innerWidth * 1.2) / -2,
      (window.innerHeight * 1.2) / -2,
      window.innerWidth * 1.2,
      window.innerHeight * 1.2,
    ];
    console.log(this.props.planets);

    return this.props.visible ? (
      <Card className="StarSystemDialog" bg="dark" variant="dark">
        <CardHeader>
          <b className="title-text">Star System: </b>
          {this.props.data.name}
        </CardHeader>
        <CardContent>
          <svg
            width="100%"
            height="100%"
            id="star-system"
            preserveAspectRatio="none"
            viewBox={viewBox}
          >
            <defs>
              <filter id="filter" height="2" width="2">
                <feTurbulence
                  baseFrequency="0.5"
                  numOctaves="3"
                  type="fractalNoise"
                />
                <feDisplacementMap
                  scale="80"
                  xChannelSelector="R"
                  in="SourceGraphic"
                />
              </filter>
            </defs>
            {this.props.data.planets.reverse().map((data, i) => {
              return (
                <g
                  className={`planet-group ${data.category}-category`}
                  style={{ animationDuration: `${6 * data.orbitalPeriod}s` }}
                  key={i}
                  onClick={() => {
                    this.props.handler(data);
                  }}
                  onMouseEnter={() => {
                    // this.setState(() => {
                    //   return { description: data.description };
                    // });
                  }}
                  onMouseLeave={() => {
                    // this.setState(() => {
                    //   return { description: "" };
                    // });
                  }}
                >
                  <title>{data.name}</title>
                  <circle
                    cx="0"
                    cy="0"
                    r={data.dist === 0 ? 0 : Math.sqrt(data.dist * 100)}
                    className="orbit"
                  />
                  <circle
                    cx={0 + data.dist === 0 ? 0 : Math.sqrt(data.dist * 100)}
                    cy="0"
                    r={data.rad}
                    className="planet"
                  />
                </g>
              );
            })}
          </svg>
          <div>
            {this.state.description}
            <Button
              variant="light"
              className="float-right"
              onClick={this.props.handler}
            >
              close
            </Button>
          </div>
        </CardContent>
      </Card>
    ) : (
      <></>
    );
  }
}

export default StarSystemDialog;
