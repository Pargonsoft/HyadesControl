import React from "react";

import { useApp } from "@pixi/react";
import run from "./starField";

export default function ClusterView({
  systemCatalog: starCatalog,
  selectedSystem: selectedStar,
}: {
  systemCatalog: any;
  selectedSystem: (id: number) => void;
}) {
  const app = useApp();
  app.stage.removeChildren();
  run(app, starCatalog, selectedStar);

  return <></>;
}
