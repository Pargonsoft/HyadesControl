import React from "react";
import { Stage } from "@pixi/react";

interface RenderType {
  children: string | JSX.Element | JSX.Element[] | (() => JSX.Element);
}

export default function Render(props: RenderType) {
  const { children } = props;
  return (
    <Stage
      width={1184}
      height={849}
      options={{
        background: 0x000,
        antialias: true,
        autoDensity: true,
        resolution: 2,
      }}
    >
      {children as JSX.Element}
    </Stage>
  );
}
