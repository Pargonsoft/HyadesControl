import React from "react";
import { Link } from "react-router-dom";
import Footer from "@Components/footer";

const Home = () => {
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

      {/* Title */}
      <div className="mb-12 z-10">
        <h1 className="text-6xl font-bold text-center font-['quasitron'] mb-4 text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text">
          Hyades Control
        </h1>
        <p className="text-xl text-center text-blue-300 font-light">
          Command the Stars. Conquer the Galaxy.
        </p>
      </div>

      {/* Menu Buttons */}
      <div className="flex flex-col gap-4 w-80 z-10">
        <Link to="/game" className="group">
          <button className="w-full py-4 px-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg text-lg font-semibold transition-all duration-300 transform group-hover:scale-105 shadow-lg border border-blue-400/30">
            New Game
          </button>
        </Link>

        <Link to="/scores" className="group">
          <button className="w-full py-4 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-lg font-semibold transition-all duration-300 transform group-hover:scale-105 shadow-lg border border-purple-400/30">
            Scores
          </button>
        </Link>

        <button
          className="w-full py-4 px-8 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border border-gray-400/30"
          onClick={() => window.contextAPI.ipcRenderer.closeApp()}
        >
          Exit
        </button>
      </div>

      {/* Subtle glow effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Footer */}
      <div className="absolute bottom-4 z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Home;
