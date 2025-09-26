import React from "react";

interface LoadingScreenProps {
  progress: number; // 0-100
  currentStep: string;
  starsGenerated: number;
  totalStars: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress,
  currentStep,
  starsGenerated,
  totalStars,
}) => {
  return (
    <div className="w-screen h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-black flex flex-col items-center justify-center text-white">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center font-['quasitron'] mb-2">
          Hyades Control
        </h1>
        <h2 className="text-xl text-center text-blue-300">
          Generating Star Cluster...
        </h2>
      </div>

      {/* Progress Bar */}
      <div className="w-96 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-blue-300">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Current Step */}
      <div className="text-center mb-4">
        <p className="text-lg font-semibold text-blue-200">{currentStep}</p>
        <p className="text-sm text-gray-400">
          {starsGenerated} of {totalStars} star systems generated
        </p>
      </div>

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
        </div>
      </div>

      {/* Loading Animation */}
      <div className="mt-8">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
