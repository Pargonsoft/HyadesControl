import React, { useEffect, useState } from "react";
import { Stage } from "@pixi/react";

interface RenderType {
  children: string | JSX.Element | JSX.Element[] | (() => JSX.Element);
}

export default function Render(props: RenderType) {
  const { children } = props;
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight - 80, // Subtract navbar height (h-20 = 80px)
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 80, // Subtract navbar height
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Stage
      width={dimensions.width}
      height={dimensions.height}
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
