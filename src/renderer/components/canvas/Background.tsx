import React from "react";

const Background = () => {
  const skyStyle = {
    opacity: 0.2,
  };
  const skyWidth = 1500;
  const gameHeight = 1500;
  return (
    <image
      // href={require('../../assets/svg/')}
      x={0}
      y={-300}
      width={skyWidth}
      height={gameHeight}
      style={skyStyle}
    />
  );
};

export default Background;
