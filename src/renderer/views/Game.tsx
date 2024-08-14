import React, { useEffect, useState } from "react";
import log from "electron-log/renderer";
import ClusterView from "@Components/canvas/ClusterView";

import GameNav from "@Components/game/GameNav";
import Render from "@Components/canvas/Render";
import System from "@Components/canvas/System";
import starCatalog from "@Assets/data/nearest.json";
import generateStarSystem from "@Components/game/aigenerator";

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
        <Render>
          <ClusterView
            systemCatalog={starSystems}
            selectedSystem={selectedSystem}
          />
        </Render>
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
