import React from "react";

interface scoreListProps {
  scores: number[];
}

const ScoreList = (props: scoreListProps) => {
  return props.scores.map(function (item, i) {
    return (
      <li key={i}>
        {i + 1}º: {item}
      </li>
    );
  });
};

export default ScoreList;
