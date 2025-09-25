import React from "react";
import * as PIXI from "pixi.js";
import { useApp } from "@pixi/react";
import { Assets, Sprite, Container } from "pixi.js";
import starTextures from "@Components/utils/starTextures";
import planet1 from "@Assets/textures/Planet.png";
import terrestrial1 from "@Assets/textures/Terrestrial1.png";
import terrestrial2 from "@Assets/textures/Terrestrial2.png";

// Import refactored classes
import { AsteroidBeltGenerator } from "../../logic/asteroidBeltGenerator";
import { PlanetaryValidator } from "../../logic/planetaryValidator";
import { OrbitalRenderer } from "../../logic/orbitalRenderer";
import { ZoomController } from "../../logic/zoomController";
import { AnimationController } from "../../logic/animationController";

// Type definitions (from Game.d.ts)
interface CelestialObject {
  sprite?: Sprite;
  distance: number; // in AU
  speed: number; // in km/s
  angle: number; // in degrees
  size: number; // in km
  mass: number; // in kg
  diameter: number; // in km
  composition: { [key: string]: number }; // Composition with element percentages
  albedo: number; // Surface reflectivity
}

interface OrbitalState {
  semiMajorAxis: number; // AU
  eccentricity: number; // 0-1
  inclination: number; // radians
  longitudeOfAscendingNode: number; // radians
  argumentOfPeriapsis: number; // radians
  meanAnomaly: number; // radians
  meanMotion: number; // radians per day
  orbitalPeriod: number; // Earth days
}

interface StarType extends CelestialObject {
  type: "A" | "B" | "F" | "G" | "K" | "M" | "O";
  surfaceTemperature: number; // in Kelvin
  luminosity: number; // in Solar luminosities
  metallicity: number; // iron-to-hycrogen ratio
}

interface PlanetType extends CelestialObject {
  name: string;
  orbitalPeriod: number; // in Earth days
  meanTemperature: number; // in Kelvin
  inGoldilocksZone: boolean;
  orbitalState?: OrbitalState; // Physics-based orbital parameters
}

interface AsteroidType extends CelestialObject {
  collapsed: boolean;
}

interface SystemType {
  id: number;
  name: string;
  galX: number;
  galY: number;
  galZ: number;
  mass: number;
  metallicity: number;
  sprite?: Sprite;
  type: "A" | "B" | "F" | "G" | "K" | "M" | "O";
  stars: StarType[];
  planets: PlanetType[];
  asteroids: AsteroidType[];
  goldilocksZone: { innerBoundary: number; outerBoundary: number }; // in AU
}

interface AsteroidBeltObject {
  sprite: PIXI.Sprite & { isAsteroid?: boolean };
  name: string;
  orbitRadius: number;
  orbitSpeed: number;
  angle: number;
  rotation: number;
  rotationSpeed: number;
  beltType: "inner" | "outer";
}

const run = async (system: SystemType) => {
  // Create the PixiJS application
  const app = useApp();
  app.stage.removeChildren();
  const container = new Container();
  app.stage.addChild(container);

  // Load star sprites
  system.stars.forEach(async (star, i) => {
    system.stars[i].sprite = new Sprite(
      await Assets.load(
        starTextures[
          star.type.charAt(0) as "A" | "B" | "F" | "G" | "K" | "M" | "O"
        ]
      )
    );
  });

  // Load planet textures
  const desert = await Assets.load(planet1);
  const aqua = await Assets.load(terrestrial2);
  const jungla = await Assets.load(terrestrial1);

  // Load asteroid texture
  const Asteroid = await Assets.load(
    "https://static.vecteezy.com/system/resources/previews/023/289/382/original/this-image-showcases-a-strikingly-detailed-asteroid-with-a-rugged-surface-featuring-realistic-shades-and-intricate-texture-presented-against-a-transparent-background-generative-ai-png.png"
  );

  console.log("printing the system data", system);

  // Constants for orbit limits and scaling
  const maxOrbits = 10; // Maximum number of orbits to display
  const maxRadius = Math.min(app.screen.width, app.screen.height) * 0.4; // Maximum orbital radius based on screen size
  const baseOrbitScaleFactor = 80; // Base scale factor for orbit distances

  // Initialize the sun
  const sun = system.stars[0].sprite;
  const apparentSize = system.stars[0].diameter / 100000;

  sun.width = apparentSize * 4;
  sun.height = apparentSize * 4;
  sun.anchor.x = 0.5;
  sun.anchor.y = 0.5;
  sun.x = app.screen.width / 2;
  sun.y = app.screen.height / 2;
  container.addChild(sun);

  // Isometric transformation function
  function applyIsometric(x: number, y: number): { x: number; y: number } {
    const isoX = x - y;
    const isoY = (x + y) / 2;
    return { x: isoX, y: isoY };
  }

  // Initialize planetary validator
  const planetaryValidator = new PlanetaryValidator({
    system,
    maxRadius,
    orbitScaleFactor: baseOrbitScaleFactor,
  });

  // Filter and validate planets
  const initialPlanets = system.planets.slice(0, maxOrbits);
  const planetsToDisplay = planetaryValidator.validatePlanetaryStatus(initialPlanets);

  console.log(`Original planets: ${initialPlanets.length}, Valid planets after clearance check: ${planetsToDisplay.length}`);

  // Initialize orbital renderer
  const orbitalRenderer = new OrbitalRenderer({
    container,
    orbitScaleFactor: baseOrbitScaleFactor,
    zoomLevel: 1,
    sun,
    applyIsometric,
  });

  // Initialize and setup planets with sprites
  planetsToDisplay.forEach((planet: PlanetType) => {
    // Randomly choose from all 3 planet textures
    const planetTextures = [desert, aqua, jungla];
    const randomTexture = planetTextures[Math.floor(Math.random() * planetTextures.length)];
    planet.sprite = new Sprite(randomTexture);
    planet.size = planet.size * 20;
    orbitalRenderer.createOrbitLine(planet);
    orbitalRenderer.createPlanet(planet);
  });

  // Initialize asteroid belt generator
  const asteroidBeltGenerator = new AsteroidBeltGenerator({
    system,
    planetsToDisplay,
    orbitScaleFactor: baseOrbitScaleFactor,
    zoomLevel: 1,
    container,
    sun,
    Asteroid,
    applyIsometric,
  });

  // Initialize asteroid belts with realistic positioning
  let asteroids: AsteroidBeltObject[] = asteroidBeltGenerator.createAsteroidBelts();

  // Mark asteroids for easy identification
  asteroids.forEach(asteroid => {
    asteroid.sprite.isAsteroid = true;
  });

  // Create zoom indicator
  const zoomIndicator = new PIXI.Text(`Zoom: 100%`, {
    fontFamily: "Arial",
    fontSize: 16,
    fill: 0xffffff,
    align: "right",
  });
  zoomIndicator.x = app.screen.width - 10;
  zoomIndicator.y = app.screen.height - 30;
  zoomIndicator.anchor.x = 1; // Right-align the text
  zoomIndicator.anchor.y = 1; // Bottom-align the text
  app.stage.addChild(zoomIndicator);

  // Function to recreate asteroids (needed for zoom controller)
  const recreateAsteroids = (): AsteroidBeltObject[] => {
    console.log(`Recreating asteroids at zoom level: ${zoomController.getCurrentZoomLevel()}, orbitScaleFactor: ${zoomController.getCurrentOrbitScaleFactor()}`);
    console.log(`Sun position during recreation: x=${sun.x}, y=${sun.y}`);
    
    // Update asteroid generator configuration
    const newGenerator = new AsteroidBeltGenerator({
      system,
      planetsToDisplay,
      orbitScaleFactor: zoomController.getCurrentOrbitScaleFactor(),
      zoomLevel: zoomController.getCurrentZoomLevel(),
      container,
      sun,
      Asteroid,
      applyIsometric,
    });
    
    asteroids = newGenerator.createAsteroidBelts();
    
    // Mark asteroids for easy identification
    asteroids.forEach(asteroid => {
      asteroid.sprite.isAsteroid = true;
    });
    
    // Update animation controller with new asteroids
    animationController.updateAsteroids(asteroids);
    
    console.log(`Created ${asteroids.length} asteroids`);
    return asteroids;
  };

  // Initialize zoom controller
  const zoomController = new ZoomController({
    app,
    container,
    system,
    sun,
    planetsToDisplay,
    orbitalRenderer,
    recreateAsteroids,
    zoomIndicator,
    baseOrbitScaleFactor,
  });

  // Initialize animation controller
  const animationController = new AnimationController({
    planetsToDisplay,
    asteroids,
    orbitalRenderer,
    applyIsometric,
    sun,
    timeScale: 1, // 1 Earth day per frame
  });

  // Set up zoom indicator and start animation
  zoomController.initialize();
  animationController.createAnimationLoop(app);
};

interface SystemProps {
  system: SystemType;
}

const System = (props: SystemProps) => {
  run(props.system);
  return <></>;
};

export default System;