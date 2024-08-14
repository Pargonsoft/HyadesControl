import React from "react";
import * as PIXI from "pixi.js";
import { useApp } from "@pixi/react";
import { Assets, Sprite, Graphics, Container } from "pixi.js";
import starTextures from "@Components/utils/starTextures";
import planet1 from "@Assets/textures/Planet.png";
import terrestrial1 from "@Assets/textures/Terrestrial1.png";
import terrestrial2 from "@Assets/textures/Terrestrial2.png";

const run = async (system: SystemType) => {
  // Create the PixiJS application
  const app = useApp();
  app.stage.removeChildren();
  const container = new Container();
  app.stage.addChild(container);

  system.stars.forEach(async (star, i) => {
    system.stars[i].sprite = new Sprite(
      await Assets.load(
        starTextures[
          star.type.charAt(0) as "A" | "B" | "F" | "G" | "K" | "M" | "O"
        ]
      )
    );
  });

  const RandPlanet = await Assets.load(planet1);
  const aqua = await Assets.load(terrestrial2);
  const jungla = await Assets.load(terrestrial1);

  const Asteroid = await Assets.load(
    "https://static.vecteezy.com/system/resources/previews/023/289/382/original/this-image-showcases-a-strikingly-detailed-asteroid-with-a-rugged-surface-featuring-realistic-shades-and-intricate-texture-presented-against-a-transparent-background-generative-ai-png.png"
  );

  console.log("printing the system data", system);

  // Create the Sun
  const sun = system.stars[0].sprite;
  const apparentSize = system.stars[0].diameter / 100000;

  sun.width = apparentSize * 4;
  sun.height = apparentSize * 4;
  sun.anchor.x = 0.5;
  sun.anchor.y = 0.5;
  sun.x = app.screen.width / 2;
  sun.y = app.screen.height / 2;
  container.addChild(sun);

  // Function to apply isometric transformation
  function applyIsometric(x: number, y: number): { x: number; y: number } {
    const isoX = x - y;
    const isoY = (x + y) / 2;
    return { x: isoX, y: isoY };
  }

  // Function to create and add planets to the stage
  function createPlanet(planet: PlanetType) {
    planet.sprite.width = planet.size / 100000;
    planet.sprite.height = planet.size / 100000;
    planet.sprite.anchor.x = 0.5;
    planet.sprite.anchor.y = 0.5;
    const isoPosition = applyIsometric(sun.x + planet.distance * 80, sun.y);
    planet.sprite.x = isoPosition.x;
    planet.sprite.y = isoPosition.y;
    container.addChild(planet.sprite);
  }

  // Function to create and add orbit lines to the stage
  function createOrbitLine(radius: number) {
    const orbit = new Graphics();
    orbit.lineStyle(1, 0x999999, 0.5);
    orbit.drawEllipse(0, 0, radius * Math.SQRT2, radius / Math.SQRT2);
    orbit.x = sun.x;
    orbit.y = sun.y;
    container.addChild(orbit);
  }

  // Create asteroid ring
  const createAsteroidRing = (
    radius: number,
    count: number,
    speed: number,
    size: number
  ) => {
    const result = [];
    for (let i = 0; i < count; i++) {
      const asteroid = new PIXI.Sprite(Asteroid);
      const randSize = Math.random() * size + size;

      asteroid.width = randSize;
      asteroid.height = randSize;
      asteroid.anchor.x = 0.5;
      asteroid.anchor.y = 0.5;

      const angle = (i / count) * Math.PI * 2;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      const isoPos = applyIsometric(x, y);
      asteroid.x = sun.x + isoPos.x;
      asteroid.y = sun.y + isoPos.y;
      asteroid.rotation = Math.random() * Math.PI; // Random rotation for realism
      app.stage.addChild(asteroid);
      result.push({
        sprite: asteroid,
        name: i.toString(),
        orbitRadius: radius,
        orbitSpeed: speed,
        angle,
        rotation: asteroid.rotation,
        rotationSpeed: 0.001,
      });
    }
    return result;
  };

  const decoratorRings = (
    radius: number,
    count: number,
    speed: number,
    size: number
  ) => {
    const result = [];
    for (let i = 0; i < count; i++) {
      const asteroid = new PIXI.Sprite(Asteroid);
      const randRad =
        Math.random() * 10 * (Math.random() > 0.5 ? -1 : 1) + radius;
      const randSize = Math.random() * size + size;

      asteroid.width = randSize;
      asteroid.height = randSize;
      asteroid.anchor.x = 0.5;
      asteroid.anchor.y = 0.5;

      const angle = (i / count) * Math.PI * 2;
      const x = randRad * Math.cos(angle);
      const y = randRad * Math.sin(angle);
      const isoPos = applyIsometric(x, y);
      asteroid.x = sun.x + isoPos.x;
      asteroid.y = sun.y + isoPos.y;
      asteroid.rotation = Math.random() * Math.PI; // Random rotation for realism
      app.stage.addChild(asteroid);
      result.push({
        sprite: asteroid,
        name: i.toString(),
        orbitRadius: radius,
        orbitSpeed: speed,
        angle,
        rotation: asteroid.rotation,
        rotationSpeed: 0.001,
      });
    }
    return result;
  };

  // Initialize planets and orbits
  system.planets.forEach((planet) => {
    planet.sprite = new Sprite(RandPlanet);
    planet.size = planet.size * 20;
    createOrbitLine(planet.distance * 80);
    createPlanet(planet);
  });

  // Initialize asteroids
  const asteroids = createAsteroidRing(400, 10, 0.0002, 20);
  const decoratorAst = decoratorRings(400, 800, 0.0002, 1);

  // Animation loop
  app.ticker.add((delta) => {
    system.planets.forEach((planet) => {
      planet.angle += (planet.speed / 10000) * delta;
      const x = planet.distance * 80 * Math.cos(planet.angle);
      const y = planet.distance * 80 * Math.sin(planet.angle);
      const isoPosition = applyIsometric(x, y);
      planet.sprite.x = sun.x + isoPosition.x;
      planet.sprite.y = sun.y + isoPosition.y;
    });
    decoratorAst.forEach((asteroid) => {
      asteroid.angle += asteroid.orbitSpeed * delta;
      const x = asteroid.orbitRadius * Math.cos(asteroid.angle);
      const y = asteroid.orbitRadius * Math.sin(asteroid.angle);
      const isoPosition = applyIsometric(x, y);
      asteroid.sprite.x = sun.x + isoPosition.x;
      asteroid.sprite.y = sun.y + isoPosition.y;
    });
    asteroids.forEach((asteroid) => {
      asteroid.angle += asteroid.orbitSpeed * delta;
      const x = asteroid.orbitRadius * Math.cos(asteroid.angle);
      const y = asteroid.orbitRadius * Math.sin(asteroid.angle);
      const isoPosition = applyIsometric(x, y);
      asteroid.sprite.x = sun.x + isoPosition.x;
      asteroid.sprite.y = sun.y + isoPosition.y;
      asteroid.rotation =
        asteroid.rotationSpeed * delta * Math.PI + asteroid.rotation;
      asteroid.sprite.rotation = asteroid.rotation;
    });
  });
};

interface SystemProps {
  system: SystemType;
}

const System = (props: SystemProps) => {
  run(props.system);
  return <></>;
};

export default System;
