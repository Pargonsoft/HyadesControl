import React from "react";

interface scoreListProps {
  scores: number[];
}

const ScoreList = (props: scoreListProps) => {
  return (
    <div className="space-y-2">
      {props.scores.map(function (item, i) {
        const isTopThree = i < 3;
        const rankColor =
          i === 0
            ? "text-yellow-400"
            : i === 1
              ? "text-gray-300"
              : i === 2
                ? "text-amber-600"
                : "text-blue-300";
        const bgColor = isTopThree
          ? "bg-gradient-to-r from-blue-900/50 to-purple-900/50"
          : "bg-gray-800/30";

        return (
          <div
            key={i}
            className={`flex justify-between items-center p-3 rounded-lg ${bgColor} border border-gray-700/30 hover:border-blue-500/30 transition-all duration-200`}
          >
            <span className={`font-semibold ${rankColor}`}>#{i + 1}</span>
            <span className="text-white font-mono text-lg">
              {item.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ScoreList;
