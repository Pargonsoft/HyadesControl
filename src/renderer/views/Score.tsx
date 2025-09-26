import React, { useState } from "react";
import { Link } from "react-router-dom";
import ScoreList from "@Components/ScoreList";

const Score = () => {
  const recent = [10200, 7890, 5467, 1234, 763, 324, 123, 78, 54, 22];
  const highest = [10250, 9954, 9210, 8952, 8884, 8701, 8321, 7451, 7002, 6548];
  const Global = [
    10500, 10500, 10500, 10500, 10500, 10500, 10500, 10500, 10500, 10500,
  ];
  const [scores, setScores] = useState(recent);
  const [activeTab, setActiveTab] = useState("recent");

  const clickRecent = () => {
    setScores(recent);
    setActiveTab("recent");
  };

  const clickHighest = () => {
    setScores(highest);
    setActiveTab("highest");
  };

  const clickGlobal = () => {
    setScores(Global);
    setActiveTab("global");
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-black flex flex-col items-center justify-center text-white relative">
      {/* Animated Stars Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated dots to simulate stars */}
        <div className="animate-pulse">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full opacity-60"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-300 rounded-full opacity-40"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white rounded-full opacity-80"></div>
          <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-cyan-300 rounded-full opacity-50"></div>
          <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-blue-200 rounded-full opacity-70"></div>
          <div className="absolute top-3/4 right-1/6 w-1 h-1 bg-white rounded-full opacity-60"></div>
          <div className="absolute top-1/6 right-1/2 w-1 h-1 bg-blue-100 rounded-full opacity-50"></div>
          <div className="absolute bottom-1/6 left-1/2 w-1 h-1 bg-cyan-200 rounded-full opacity-70"></div>
        </div>
      </div>

      {/* Content Container */}
      <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 w-full max-w-2xl mx-4 border border-blue-400/20 shadow-2xl z-10">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold font-['quasitron'] mb-2 text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text">
            Scores
          </h1>
          <p className="text-blue-300">Hall of Galactic Commanders</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6 bg-gray-800/50 rounded-lg p-1 backdrop-blur-sm">
          <button
            className={`flex-1 py-3 px-4 rounded-md text-sm font-semibold transition-all duration-300 ${
              activeTab === "recent"
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                : "text-gray-300 hover:text-white hover:bg-gray-700/50"
            }`}
            onClick={clickRecent}
          >
            Recent
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-md text-sm font-semibold transition-all duration-300 ${
              activeTab === "highest"
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                : "text-gray-300 hover:text-white hover:bg-gray-700/50"
            }`}
            onClick={clickHighest}
          >
            Highest
          </button>
          <button
            className={`flex-1 py-3 px-4 rounded-md text-sm font-semibold transition-all duration-300 ${
              activeTab === "global"
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                : "text-gray-300 hover:text-white hover:bg-gray-700/50"
            }`}
            onClick={clickGlobal}
          >
            Global
          </button>
        </div>

        {/* Score List */}
        <div className="bg-gray-900/40 rounded-lg p-4 mb-6 max-h-80 overflow-y-auto backdrop-blur-sm border border-gray-700/30">
          <ScoreList scores={scores} />
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Link to="/" className="group inline-block">
            <button className="py-3 px-8 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 rounded-lg text-lg font-semibold transition-all duration-300 transform group-hover:scale-105 shadow-lg border border-gray-400/30">
              ← Back to Home
            </button>
          </Link>
        </div>
      </div>

      {/* Subtle glow effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
};

export default Score;
