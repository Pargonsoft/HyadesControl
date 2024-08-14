import React, { Component, Fragment } from 'react';

export default class Star extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ring: false,
      known: false,
    };
  }

  render() {
    const { name, x, y, color, radius } = this.props.data;
    const star = (
      <path
        onClick={() => {
          this.props.handler(this.props.data);
        }}
        onMouseEnter={() => {
          this.setState(() => {
            return { ring: true, known: true };
          });
        }}
        onMouseLeave={() => {
          this.setState(() => {
            return { ring: false, known: false };
          });
        }}
        transform="scale(.2)"
        d={
          `m ${x * 5} ${y * 5} c` +
          `-4.021 2.5673-9.3543-9.0292-14.052-8.1962-4.6974 0.83307-7.4631 23.017-12.122 21.989-4.6586-1.028 2.1681-22.316-1.7425-25.048-3.9106-2.7325-12.786 5.6716-15.353 1.6506-2.5673-4.021 8.5461-8.9199 7.713-13.617-0.83307-4.6974-23.017-7.4631-21.989-12.122 1.028-4.6586 22.316 2.1681 25.048-1.7425 2.7325-3.9106-5.5851-13.825-1.564-16.393 4.021-2.5673 8.8333 9.5854 13.531 8.7523 4.6974-0.83307 7.4631-23.017 12.122-21.989 4.6586 1.028-2.1681 22.316 1.7425 25.048 3.9106 2.7325 14.09-5.5231 16.657-1.5021 2.5673 4.021-9.8503 8.7714-9.0172 13.469 0.83307 4.6974 23.017 7.4631 21.989 12.122-1.028 4.6586-22.316-2.1681-25.048 1.7425-2.7325 3.9106 6.106 13.269 2.085 15.836z`
        }
        fill={color.value}
        opacity="0.8"
      />
    );
    const ring = (
      <circle
        cx={x - 4}
        cy={y - 5}
        r={12}
        stroke={color.value}
        strokeDasharray="5, 10"
        strokeWidth="3"
        fill="none"
      />
    );
    const title = (
      <text
        x={x}
        y={y + 20}
        fill="white"
        textAnchor="middle"
        style={{ fontSize: '0.8em' }}
      >
        {name}
      </text>
    );

    return (
      <>
        {star}
        {!this.state.ring ? <></> : ring}
        {!this.state.known ? <></> : title}
      </>
    );
  }
}
