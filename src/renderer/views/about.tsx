import React from "react";
import Title from "@Renderer/components/title";
import log from "electron-log/renderer";
import { colorize } from "@Lib/logger";

function About() {
  log.error("This is an error log");
  log.warn("this is a warning log");
  log.info(
    `${colorize("This is a", "cyan")} ${colorize(
      "colorized",
      "magenta"
    )} ${colorize("info log", "red")}`
  );
  return (
    <div>
      <Title>AboutPage</Title>
      <p>This is the about page</p>
    </div>
  );
}

export default About;
