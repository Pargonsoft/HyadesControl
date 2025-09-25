import React, { useEffect, useState } from "react";
import log from "electron-log/renderer";
import { FaHome } from "react-icons/fa";
import ClusterView from "@Components/canvas/ClusterView";

import GameNav from "@Components/game/GameNav";
import Render from "@Components/canvas/Render";
import System from "@Components/canvas/System";
import starCatalog from "@Assets/data/nearest.json";
import generateStarSystem from "@Renderer/logic/aigenerator";

const Game = () => {
  const [mode, setMode] = useState<"starMap" | "starView">("starMap");
  const [system, setSystem] = useState<SystemType>();
  const [starSystems, setStarSystems] = useState<SystemType[]>();

  /**
   * Function to generate the game.
   */
  const generateGame = () => {
    const numberOfStars = 30;
    const result: SystemType[] = [];

    for (let i = 0; i < numberOfStars; i += 1) {
      const { id, starName, galX, galY, galZ } = starCatalog[i + 1];
      // Example usage:
      const cloudMass = 2; // in Solar masses
      const metallicity = 0.02; // 2% metal content
      const newSystem = generateStarSystem(
        cloudMass,
        metallicity,
        starName,
        galX,
        galY,
        galZ
      );

      // const newSystem = generateStarSystem(starName, galX, galY, galZ);
      newSystem.id = id;
      result.push(newSystem);
    }

    log.info("generated the following systems: ", result);
    return result;
  };
  /**
   * Handles the selection of a star.
   * @param {number} systemID - The ID of the selected star
   */
  const selectedSystem = (systemID: number) => {
    // do something with selected star
    log.info("pressed: ", systemID);
    setSystem(starSystems.find((x) => x.id === systemID));
    setMode("starView");
  };

  useEffect(() => {
    const newStars = generateGame();
    setStarSystems(newStars);
  }, []);

  return (
    <div className="container w-screen h-screen p-0">
      <GameNav />
      {mode === "starMap" ? (
        <div className="relative">
          <Render>
            <ClusterView
              systemCatalog={starSystems}
              selectedSystem={selectedSystem}
            />
          </Render>
          {/* Zoom Controls Overlay */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <button
              className="w-10 h-10 bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded-md flex items-center justify-center text-white font-bold text-lg shadow-lg"
              onClick={() =>
                window.dispatchEvent(new KeyboardEvent("keydown", { key: "+" }))
              }
              title="Zoom In"
            >
              +
            </button>
            <button
              className="w-10 h-10 bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded-md flex items-center justify-center text-white font-bold text-lg shadow-lg"
              onClick={() =>
                window.dispatchEvent(new KeyboardEvent("keydown", { key: "-" }))
              }
              title="Zoom Out"
            >
              −
            </button>
            <button
              className="w-10 h-10 bg-slate-700 hover:bg-slate-600 border border-slate-500 rounded-md flex items-center justify-center text-white text-xs shadow-lg"
              onClick={() =>
                window.dispatchEvent(new KeyboardEvent("keydown", { key: "c" }))
              }
              title="Center/Reset Zoom & Pan"
            >
              <FaHome size={14} />
            </button>
          </div>
          {/* Controls Help Overlay */}
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white text-xs p-2 rounded-md z-10">
            <div>Arrow Keys: Pan view</div>
            <div>+/- Keys: Zoom in/out</div>
            <div>Mouse Wheel: Zoom in/out</div>
            <div>C Key: Center & reset</div>
          </div>
        </div>
      ) : (
        <Render>
          <System system={system} />
        </Render>
      )}
      {mode === "starView" ? (
        <button
          className="absolute left-4 top-24 bg-slate-500 border-solid border-t-zinc-500 z-10 rounded-md px-4 py-2"
          onClick={() => setMode("starMap")}
        >
          Back to Cluster
        </button>
      ) : (
        ""
      )}
    </div>
  );
};

export default Game;
