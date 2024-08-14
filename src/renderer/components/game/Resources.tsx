import React, { Fragment } from "react";
import Materials from "@Assets/img/Materials.png";
import Energy from "@Assets/img/Energy.png";
import FleetCap from "@Assets/img/FleetCap.png";
import Research from "@Assets/img/Research.png";
import Systems from "@Assets/img/Systems.png";

import Resource from "./Resource";

const handleMClick = (event: any) => {
  alert("Materials tab pressed");
};
const handleEClick = (event: any) => {
  alert("Energy tab pressed");
};
const handleFClick = (event: any) => {
  alert("FleetCap tab pressed");
};
const handleRClick = (event: any) => {
  alert("Research tab pressed");
};
const handleSClick = (event: any) => {
  alert("Systems tab pressed");
};

const Resources = () => {
  return (
    <div className="flex flex-row">
      <Resource
        name="Materials"
        hc={handleMClick}
        data={[1543, 2000]}
        img={Materials}
      />
      <Resource
        name="Energy"
        hc={handleEClick}
        data={[324, 1000]}
        img={Energy}
      />
      <Resource
        name="FleetCap"
        hc={handleFClick}
        data={[15, 20]}
        img={FleetCap}
      />
      <Resource
        name="Research"
        hc={handleRClick}
        data={[0, 3]}
        img={Research}
      />
      <Resource name="Systems" hc={handleSClick} data={[6, 10]} img={Systems} />
    </div>
  );
};

export default Resources;
