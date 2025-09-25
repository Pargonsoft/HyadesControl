import React from "react";
import * as PIXI from "pixi.js";
import { useApp } from "@pixi/react";
import { Assets, Sprite, Graphics, Container } from "pixi.js";
import starTextures from "@Components/utils/starTextures";
import planet1 from "@Assets/textures/Planet.png";
import terrestrial1 from "@Assets/textures/Terrestrial1.png";
import terrestrial2 from "@Assets/textures/Terrestrial2.png";

// Type for asteroid belt objects (different from AsteroidType in Game.d.ts)
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

  system.stars.forEach(async (star, i) => {
    system.stars[i].sprite = new Sprite(
      await Assets.load(
        starTextures[
          star.type.charAt(0) as "A" | "B" | "F" | "G" | "K" | "M" | "O"
        ]
      )
    );
  });

  const desert = await Assets.load(planet1);
  const aqua = await Assets.load(terrestrial2);
  const jungla = await Assets.load(terrestrial1);

  const Asteroid = await Assets.load(
    "https://static.vecteezy.com/system/resources/previews/023/289/382/original/this-image-showcases-a-strikingly-detailed-asteroid-with-a-rugged-surface-featuring-realistic-shades-and-intricate-texture-presented-against-a-transparent-background-generative-ai-png.png"
  );

  console.log("printing the system data", system);

  // Constants for orbit limits and scaling
  const maxOrbits = 10; // Maximum number of orbits to display
  const maxRadius = Math.min(app.screen.width, app.screen.height) * 0.4; // Maximum orbital radius based on screen size
  const baseOrbitScaleFactor = 80; // Base scale factor for orbit distances

  // Zoom system for star system view
  let zoomLevel = 1; // Current zoom level
  const zoomLevels = [0.5, 1, 2, 4, 8]; // Five zoom levels: 50%, 100%, 200%, 400%, 800%
  let currentZoomIndex = 1; // Start at 100% zoom
  let orbitScaleFactor = baseOrbitScaleFactor * zoomLevel;

  // Panning system
  let panOffsetX = 0;
  let panOffsetY = 0;
  const panSpeed = 50;

  // Function to update zoom and recalculate positions
  const updateZoom = () => {
    zoomLevel = zoomLevels[currentZoomIndex];
    orbitScaleFactor = baseOrbitScaleFactor * zoomLevel;

    // Clean up any old asteroids that might still be on app.stage from before the fix
    app.stage.children.forEach((child) => {
      if ((child as PIXI.Sprite & { isAsteroid?: boolean }).isAsteroid) {
        app.stage.removeChild(child);
      }
    });

    // Update star size and position
    const apparentSize = system.stars[0].diameter / 100000;
    sun.width = apparentSize * 4 * zoomLevel;
    sun.height = apparentSize * 4 * zoomLevel;
    sun.x = app.screen.width / 2 + panOffsetX;
    sun.y = app.screen.height / 2 + panOffsetY;

    // Update all planet positions, sizes, and orbits
    container.removeChildren(); // Clear existing graphics
    container.addChild(sun); // Re-add star

    // Recreate orbits and planets with new scale
    planetsToDisplay.forEach((planet: PlanetType) => {
      if (planet.sprite) {
        // Update planet size
        planet.sprite.width = (planet.size / 100000) * zoomLevel;
        planet.sprite.height = (planet.size / 100000) * zoomLevel;

        // Recreate orbit line with new scale
        createOrbitLine(planet);

        // Update planet position
        updatePlanetPosition(planet);

        container.addChild(planet.sprite);
      }
    });

    // Recreate asteroids with new scale
    recreateAsteroids();
  };

  // Function to recreate asteroids with current zoom level
  const recreateAsteroids = () => {
    // Note: container.removeChildren() in updateZoom() already removed all asteroids
    // No need to remove them again here

    console.log(
      `Recreating asteroids at zoom level: ${zoomLevel}, orbitScaleFactor: ${orbitScaleFactor}`
    );
    console.log(`Sun position during recreation: x=${sun.x}, y=${sun.y}`);

    // Recreate asteroid belts with new scale
    asteroids = createAsteroidBelts();

    // Mark asteroids for easy identification
    asteroids.forEach((asteroid) => {
      asteroid.sprite.isAsteroid = true;
    });

    console.log(`Created ${asteroids.length} asteroids`);
    return { asteroids };
  };

  // Function to update individual planet position
  const updatePlanetPosition = (planet: PlanetType) => {
    const orbitalState = planet.orbitalState;
    if (!orbitalState || !planet.sprite) return;

    // Use current orbital position
    const eccentricAnomaly = orbitalState.meanAnomaly; // Simplified for immediate update
    const trueAnomaly =
      2 *
      Math.atan2(
        Math.sqrt(1 + orbitalState.eccentricity) *
          Math.sin(eccentricAnomaly / 2),
        Math.sqrt(1 - orbitalState.eccentricity) *
          Math.cos(eccentricAnomaly / 2)
      );

    const distance =
      orbitalState.semiMajorAxis *
      (1 - orbitalState.eccentricity * Math.cos(eccentricAnomaly));
    const orbitalX = distance * Math.cos(trueAnomaly);
    const orbitalY = distance * Math.sin(trueAnomaly);

    // Apply 3D rotation (simplified)
    const screenX = orbitalX * orbitScaleFactor;
    const screenY = orbitalY * orbitScaleFactor;

    const isoPosition = applyIsometric(screenX, screenY);
    planet.sprite.x = sun.x + isoPosition.x;
    planet.sprite.y = sun.y + isoPosition.y;
  };

  // Keyboard and mouse event handlers
  const handleKeyPress = (event: KeyboardEvent) => {
    let needsUpdate = false;

    switch (event.key) {
      case "+":
      case "=":
        // Zoom in
        if (currentZoomIndex < zoomLevels.length - 1) {
          currentZoomIndex++;
          needsUpdate = true;
        }
        break;
      case "-":
      case "_":
        // Zoom out
        if (currentZoomIndex > 0) {
          currentZoomIndex--;
          needsUpdate = true;
        }
        break;
      case "c":
      case "C":
        // Center/Reset
        currentZoomIndex = 1;
        panOffsetX = 0;
        panOffsetY = 0;
        needsUpdate = true;
        break;
      case "ArrowUp":
        panOffsetY -= panSpeed;
        needsUpdate = true;
        break;
      case "ArrowDown":
        panOffsetY += panSpeed;
        needsUpdate = true;
        break;
      case "ArrowLeft":
        panOffsetX -= panSpeed;
        needsUpdate = true;
        break;
      case "ArrowRight":
        panOffsetX += panSpeed;
        needsUpdate = true;
        break;
    }

    if (needsUpdate) {
      event.preventDefault();
      updateZoom();
      updateZoomIndicator();
    }
  };

  // Mouse wheel zoom handler
  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();

    if (event.deltaY < 0) {
      // Scroll up - zoom in
      if (currentZoomIndex < zoomLevels.length - 1) {
        currentZoomIndex++;
        updateZoom();
        updateZoomIndicator();
      }
    } else if (event.deltaY > 0) {
      // Scroll down - zoom out
      if (currentZoomIndex > 0) {
        currentZoomIndex--;
        updateZoom();
        updateZoomIndicator();
      }
    }
  };

  // Add event listeners
  document.addEventListener("keydown", handleKeyPress);
  const canvas = app.view as HTMLCanvasElement;
  canvas.addEventListener("wheel", handleWheel, { passive: false });

  // Create zoom indicator
  const zoomIndicator = new PIXI.Text(`Zoom: ${Math.round(zoomLevel * 100)}%`, {
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

  // Function to update zoom indicator
  const updateZoomIndicator = () => {
    zoomIndicator.text = `Zoom: ${Math.round(zoomLevel * 100)}% | Use +/- or mouse wheel to zoom | Arrow keys to pan | C to center`;
  };

  // Initial update
  updateZoomIndicator();

  // Cleanup function to remove event listeners
  const cleanup = () => {
    document.removeEventListener("keydown", handleKeyPress);
    canvas.removeEventListener("wheel", handleWheel);
    if (zoomIndicator.parent) {
      app.stage.removeChild(zoomIndicator);
    }
  };

  // Store cleanup function for later use
  (globalThis as any).systemViewCleanup = cleanup;

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
    const isoPosition = applyIsometric(
      sun.x + planet.distance * orbitScaleFactor,
      sun.y
    );
    planet.sprite.x = isoPosition.x;
    planet.sprite.y = isoPosition.y;
    container.addChild(planet.sprite);
  }

  // Function to create and add orbit lines to the stage (properly oriented elliptical orbits)
  function createOrbitLine(planet: PlanetType) {
    const orbitalState = planet.orbitalState;
    if (!orbitalState) return;

    const orbit = new Graphics();
    orbit.lineStyle(1, 0x999999, 0.5);

    // Draw the actual orbital path by calculating positions at many points
    const points: number[] = [];
    const numPoints = 128; // More points for smoother orbit

    // Pre-calculate rotation matrix elements
    const cosLAN = Math.cos(orbitalState.longitudeOfAscendingNode);
    const sinLAN = Math.sin(orbitalState.longitudeOfAscendingNode);
    const cosAP = Math.cos(orbitalState.argumentOfPeriapsis);
    const sinAP = Math.sin(orbitalState.argumentOfPeriapsis);
    const cosI = Math.cos(orbitalState.inclination);
    const sinI = Math.sin(orbitalState.inclination);

    for (let i = 0; i <= numPoints; i++) {
      // True anomaly for this point on the orbit
      const trueAnomaly = (i / numPoints) * 2 * Math.PI;

      // Calculate eccentric anomaly from true anomaly
      const eccentricAnomaly =
        2 *
        Math.atan(
          Math.sqrt(
            (1 - orbitalState.eccentricity) / (1 + orbitalState.eccentricity)
          ) * Math.tan(trueAnomaly / 2)
        );

      // Distance at this point in the orbit
      const distance =
        orbitalState.semiMajorAxis *
        (1 - orbitalState.eccentricity * Math.cos(eccentricAnomaly));

      // Position in orbital plane
      const orbitalX = distance * Math.cos(trueAnomaly);
      const orbitalY = distance * Math.sin(trueAnomaly);

      // Apply 3D rotation for inclination and other orbital elements
      const x3d =
        (cosLAN * cosAP - sinLAN * sinAP * cosI) * orbitalX +
        (-cosLAN * sinAP - sinLAN * cosAP * cosI) * orbitalY;
      const y3d =
        (sinLAN * cosAP + cosLAN * sinAP * cosI) * orbitalX +
        (-sinLAN * sinAP + cosLAN * cosAP * cosI) * orbitalY;
      const z3d = sinAP * sinI * orbitalX + cosAP * sinI * orbitalY;

      // Convert to screen coordinates (project 3D to 2D)
      const screenX = x3d * orbitScaleFactor;
      const screenY =
        (y3d * Math.cos(0.5) - z3d * Math.sin(0.5)) * orbitScaleFactor; // Same 3D tilt as planet animation

      // Apply isometric transformation
      const isoPos = applyIsometric(screenX, screenY);
      points.push(isoPos.x, isoPos.y);
    }

    // Draw the orbit path
    if (points.length >= 4) {
      orbit.moveTo(points[0], points[1]);
      for (let i = 2; i < points.length; i += 2) {
        orbit.lineTo(points[i], points[i + 1]);
      }
      // Close the orbit by connecting back to the start
      orbit.lineTo(points[0], points[1]);
    }

    orbit.x = sun.x;
    orbit.y = sun.y;
    container.addChild(orbit);
  }

  // Create realistic asteroid belts
  const createAsteroidBelts = (): AsteroidBeltObject[] => {
    // Calculate ice line distance (approximate formula based on stellar luminosity)
    const starLuminosity = system.stars[0].luminosity || 1; // Solar luminosities
    const iceLineDistance = Math.sqrt(starLuminosity) * 2.7; // AU (approximation)

    // Get all planetary orbit boundaries (considering eccentricity)
    const planetaryOrbits = planetsToDisplay
      .map((planet) => {
        const orbitalState = planet.orbitalState;
        if (orbitalState) {
          // Use actual orbital parameters
          const periapsis =
            orbitalState.semiMajorAxis * (1 - orbitalState.eccentricity);
          const apoapsis =
            orbitalState.semiMajorAxis * (1 + orbitalState.eccentricity);
          return { inner: periapsis, outer: apoapsis, name: planet.name };
        } else {
          // Fallback to circular orbit approximation
          const buffer = planet.distance * 0.1; // 10% buffer for circular orbit
          return {
            inner: planet.distance - buffer,
            outer: planet.distance + buffer,
            name: planet.name,
          };
        }
      })
      .sort((a, b) => a.inner - b.inner);

    console.log("Planetary orbit boundaries:", planetaryOrbits);

    // Function to find safe asteroid belt positions
    const findSafeAsteroidDistance = (
      targetDistance: number,
      minClearance = 0.3
    ): number | null => {
      // Check if target distance has sufficient clearance from all planets
      for (const orbit of planetaryOrbits) {
        const distanceToInner = Math.abs(targetDistance - orbit.inner);
        const distanceToOuter = Math.abs(targetDistance - orbit.outer);

        // Reject if too close to any part of planetary orbit
        if (
          distanceToInner < minClearance ||
          distanceToOuter < minClearance ||
          (targetDistance > orbit.inner && targetDistance < orbit.outer)
        ) {
          console.log(
            `Asteroid belt at ${targetDistance.toFixed(2)} AU rejected: too close to ${orbit.name} orbit (${orbit.inner.toFixed(2)}-${orbit.outer.toFixed(2)} AU)`
          );
          return null;
        }
      }
      return targetDistance;
    };

    const asteroidBelts = [];

    // Try to place inner asteroid belt (rocky, main-belt type)
    let innerBeltDistance = null;

    // First, try placing it at the traditional asteroid belt distance (ice line * 0.6-0.8)
    for (let factor = 0.6; factor <= 0.8; factor += 0.05) {
      const candidateDistance = iceLineDistance * factor;
      const safeDistance = findSafeAsteroidDistance(candidateDistance, 0.4); // Larger clearance for inner belt
      if (safeDistance) {
        innerBeltDistance = safeDistance;
        break;
      }
    }

    // If no safe distance found near ice line, look for gaps between inner planets
    if (!innerBeltDistance && planetaryOrbits.length >= 2) {
      for (let i = 0; i < planetaryOrbits.length - 1; i++) {
        const gap = planetaryOrbits[i + 1].inner - planetaryOrbits[i].outer;
        if (gap > 0.8) {
          // Minimum 0.8 AU gap needed
          const candidateDistance =
            (planetaryOrbits[i].outer + planetaryOrbits[i + 1].inner) / 2;
          const safeDistance = findSafeAsteroidDistance(candidateDistance, 0.3);
          if (safeDistance) {
            innerBeltDistance = safeDistance;
            console.log(
              `Inner asteroid belt placed in gap between ${planetaryOrbits[i].name} and ${planetaryOrbits[i + 1].name}`
            );
            break;
          }
        }
      }
    }

    // Create inner asteroid belt if safe position found
    if (innerBeltDistance) {
      const innerBelt = createAsteroidRing(
        innerBeltDistance * orbitScaleFactor,
        180, // Even more asteroids for proper dust distribution (increased from 120)
        0.0001, // Slower orbital speed
        4 * zoomLevel, // Base size for distribution calculation
        "inner"
      );
      asteroidBelts.push(...innerBelt);
      console.log(
        `Inner asteroid belt created at ${innerBeltDistance.toFixed(2)} AU`
      );
    } else {
      console.log("No safe position found for inner asteroid belt");
    }

    // Try to place outer asteroid belt (icy, Kuiper-belt type)
    let outerBeltDistance = null;
    const lastPlanetOuter =
      planetaryOrbits.length > 0
        ? planetaryOrbits[planetaryOrbits.length - 1].outer
        : 2;

    // Place outer belt well beyond the last planet with generous clearance
    for (let multiplier = 2.0; multiplier <= 3.5; multiplier += 0.2) {
      const candidateDistance = Math.max(
        lastPlanetOuter * multiplier,
        iceLineDistance * 1.5
      );
      const safeDistance = findSafeAsteroidDistance(candidateDistance, 0.5);
      if (safeDistance) {
        outerBeltDistance = safeDistance;
        break;
      }
    }

    // Create outer asteroid belt if safe position found
    if (outerBeltDistance) {
      const outerBelt = createAsteroidRing(
        outerBeltDistance * orbitScaleFactor,
        200, // Many more asteroids in outer belt (increased from 150)
        0.00005, // Much slower orbital speed (farther from star)
        6 * zoomLevel, // Slightly larger icy bodies (increased from 4)
        "outer"
      );
      asteroidBelts.push(...outerBelt);
      console.log(
        `Outer asteroid belt created at ${outerBeltDistance.toFixed(2)} AU`
      );
    } else {
      console.log("No safe position found for outer asteroid belt");
    }

    console.log(`Ice line calculated at ${iceLineDistance.toFixed(2)} AU`);

    return asteroidBelts;
  };

  // Create asteroid ring with belt type identification
  const createAsteroidRing = (
    radius: number,
    count: number,
    speed: number,
    size: number,
    beltType: "inner" | "outer" = "inner"
  ): AsteroidBeltObject[] => {
    const result: AsteroidBeltObject[] = [];
    for (let i = 0; i < count; i++) {
      const asteroid = new PIXI.Sprite(Asteroid);

      // Add some randomness to the orbital radius for realistic belt width
      const radiusVariation = radius * 0.3; // 30% variation
      const actualRadius = radius + (Math.random() - 0.5) * radiusVariation;

      // Realistic asteroid size distribution - power law favoring small objects
      // 80% tiny dust particles, 15% small asteroids, 4% medium, 1% large
      let randSize;
      const sizeRoll = Math.random();

      if (beltType === "inner") {
        // Main belt: mostly rocky debris with some larger objects
        if (sizeRoll < 0.8) {
          // 80% tiny dust particles (0.2x to 0.6x base size)
          randSize = (0.2 + Math.random() * 0.4) * size;
        } else if (sizeRoll < 0.95) {
          // 15% small asteroids (0.6x to 1.0x base size)
          randSize = (0.6 + Math.random() * 0.4) * size;
        } else if (sizeRoll < 0.99) {
          // 4% medium asteroids (1.0x to 1.5x base size)
          randSize = (1.0 + Math.random() * 0.5) * size;
        } else {
          // 1% large asteroids (1.5x to 2.0x base size)
          randSize = (1.5 + Math.random() * 0.5) * size;
        }

        // Make smallest particles more transparent to simulate dust
        if (randSize < 0.4 * size) {
          asteroid.alpha = 0.6 + Math.random() * 0.3; // Semi-transparent dust
        }
      } else {
        // Outer belt: icy objects with different size distribution
        if (sizeRoll < 0.7) {
          // 70% ice dust and small fragments
          randSize = (0.3 + Math.random() * 0.5) * size;
        } else if (sizeRoll < 0.9) {
          // 20% medium icy bodies
          randSize = (0.8 + Math.random() * 0.7) * size;
        } else {
          // 10% large icy objects (Pluto-class)
          randSize = (1.2 + Math.random() * 0.8) * size;
        }
      }

      asteroid.width = randSize;
      asteroid.height = randSize;
      asteroid.anchor.x = 0.5;
      asteroid.anchor.y = 0.5;

      const angle = (i / count) * Math.PI * 2;
      const x = actualRadius * Math.cos(angle);
      const y = actualRadius * Math.sin(angle);
      const isoPos = applyIsometric(x, y);
      // Use current sun position for initial placement
      asteroid.x = sun.x + isoPos.x;
      asteroid.y = sun.y + isoPos.y;
      asteroid.rotation = Math.random() * Math.PI;

      // Apply belt-specific visual effects
      if (beltType === "outer") {
        // Outer belt: icy composition
        asteroid.alpha = 0.7;
        asteroid.tint = 0xccccff; // Slightly blue tint for icy composition
      } else {
        // Inner belt: rocky/metallic composition with dust effects
        if (randSize < 0.4 * size) {
          // Smallest particles get brownish dust tint and lower alpha
          asteroid.tint = 0xaaaa88; // Brownish dust color
        } else if (randSize < 0.8 * size) {
          // Small rocky asteroids - slight gray tint
          asteroid.tint = 0xcccccc; // Gray rocky color
        } else {
          // Larger asteroids keep natural color but may have slight metallic tint
          if (Math.random() < 0.3) {
            asteroid.tint = 0xddddaa; // Slight metallic yellowish tint
          }
        }
      }

      container.addChild(asteroid);
      result.push({
        sprite: asteroid,
        name: `${beltType}-${i}`,
        orbitRadius: actualRadius,
        orbitSpeed: speed,
        angle,
        rotation: asteroid.rotation,
        rotationSpeed: beltType === "outer" ? 0.0005 : 0.001, // Slower rotation for outer belt
        beltType,
      });
    }
    return result;
  };

  // Time scaling for animation (Earth days per frame)
  const timeScale = 1; // 1 Earth day per frame

  // Function to check if two orbits overlap (violates planetary definition)
  function checkOrbitClearance(
    planet1: PlanetType,
    planet2: PlanetType
  ): boolean {
    const orbit1 = planet1.orbitalState;
    const orbit2 = planet2.orbitalState;
    if (!orbit1 || !orbit2) return true; // Assume clear if no orbital data

    // Calculate periapsis (closest approach) and apoapsis (farthest distance) for each orbit
    const periapsis1 = orbit1.semiMajorAxis * (1 - orbit1.eccentricity);
    const apoapsis1 = orbit1.semiMajorAxis * (1 + orbit1.eccentricity);
    const periapsis2 = orbit2.semiMajorAxis * (1 - orbit2.eccentricity);
    const apoapsis2 = orbit2.semiMajorAxis * (1 + orbit2.eccentricity);

    // Calculate Hill sphere radius (approximate orbital dominance zone)
    // Hill sphere = a * (m/3M)^(1/3) where a is semi-major axis, m is planet mass, M is star mass
    const starMass = system.stars[0].mass || 1.989e30; // Solar masses in kg
    const hillRadius1 =
      orbit1.semiMajorAxis * Math.pow(planet1.mass / (3 * starMass), 1 / 3);
    const hillRadius2 =
      orbit2.semiMajorAxis * Math.pow(planet2.mass / (3 * starMass), 1 / 3);

    // Minimum safe separation should be at least 2.5x the larger Hill sphere
    const minSeparation = 2.5 * Math.max(hillRadius1, hillRadius2);

    // Check if orbital zones overlap considering Hill spheres
    const innerBound1 = periapsis1 - hillRadius1;
    const outerBound1 = apoapsis1 + hillRadius1;
    const innerBound2 = periapsis2 - hillRadius2;
    const outerBound2 = apoapsis2 + hillRadius2;

    // Orbits are clear if they don't overlap
    const isCleared = outerBound1 < innerBound2 || outerBound2 < innerBound1;

    // Also check minimum separation between orbital centers
    const orbitalSeparation = Math.abs(
      orbit1.semiMajorAxis - orbit2.semiMajorAxis
    );
    const hasMinimumSeparation = orbitalSeparation >= minSeparation;

    return isCleared && hasMinimumSeparation;
  }

  // Function to validate planetary status based on orbital clearance and stellar constraints
  function validatePlanetaryStatus(planets: PlanetType[]): PlanetType[] {
    const validPlanets: PlanetType[] = [];
    const starMass = system.stars[0].mass || 1.989e30; // kg
    const starRadius = (system.stars[0].diameter || 1392000) / 2; // km to meters
    const starLuminosity = system.stars[0].luminosity || 1; // Solar luminosities
    const starTemperature = system.stars[0].surfaceTemperature || 5778; // Kelvin
    const starType = system.stars[0].type || "G"; // Spectral class

    // Stellar-type specific minimum distances (based on observational data)
    const stellarTypeMinimums: { [key: string]: number } = {
      O: 0.5, // Very hot, massive stars
      B: 0.3, // Hot, massive stars
      A: 0.2, // Hot stars
      F: 0.15, // Hot-warm stars
      G: 0.1, // Sun-like stars
      K: 0.08, // Cool stars
      M: 0.05, // Red dwarf stars
    };

    // Calculate critical distances
    const calculateCriticalDistances = (planet: PlanetType) => {
      const planetMass = planet.mass || 5.972e24; // kg

      // Roche limit (rigid body approximation) - minimum distance to avoid tidal destruction
      const rocheLimit =
        (2.44 * starRadius * Math.pow(starMass / planetMass, 1 / 3)) /
        1000 /
        149597870.7; // Convert to AU

      // Stellar irradiation limit - where rocky planets would be vaporized
      // Using equilibrium temperature calculation: T_eq = T_star * sqrt(R_star / (2 * d))
      const maxPlanetTemp = planet.composition?.iron > 0.3 ? 2000 : 1500; // K (higher for iron-rich planets)
      const irradiationLimit =
        (Math.pow(starTemperature / maxPlanetTemp, 2) * starRadius) /
        (2 * 149597870.7 * 1000); // AU

      // Atmospheric escape limit - where atmospheres would be stripped away
      const stellarWindLimit = Math.sqrt(starLuminosity) * 0.1; // AU (simplified model)

      // Tidal heating limit - where planets would be tidally heated to destruction
      const tidalHeatingLimit = Math.pow(starMass / 1.989e30, 1 / 3) * 0.015; // AU

      // Hill sphere stability - minimum distance for orbital stability
      const hillSphere = Math.pow(planetMass / (3 * starMass), 1 / 3); // Relative to orbital distance

      return {
        rocheLimit,
        irradiationLimit,
        stellarWindLimit,
        tidalHeatingLimit,
        hillSphere,
      };
    };

    for (let i = 0; i < planets.length; i++) {
      const planet = planets[i];
      let isValidPlanet = true;
      const limits = calculateCriticalDistances(planet);

      // Check stellar proximity constraints
      const stellarTypeMinimum = stellarTypeMinimums[starType] || 0.1; // AU
      const minSafeDistance = Math.max(
        limits.rocheLimit * 1.5, // 50% safety margin on Roche limit
        limits.irradiationLimit * 1.2, // 20% safety margin on irradiation
        limits.stellarWindLimit,
        limits.tidalHeatingLimit * 2, // 100% safety margin on tidal heating
        stellarTypeMinimum, // Observational minimum for star type
        0.05 // Absolute minimum of 0.05 AU
      );

      if (planet.distance < minSafeDistance) {
        console.log(
          `Planet ${planet.name} rejected: too close to star (${planet.distance.toFixed(3)} AU < ${minSafeDistance.toFixed(3)} AU)`
        );
        console.log(
          `  Star type ${starType} minimum: ${stellarTypeMinimum} AU`
        );
        console.log(`  Roche limit: ${limits.rocheLimit.toFixed(3)} AU`);
        console.log(
          `  Irradiation limit: ${limits.irradiationLimit.toFixed(3)} AU`
        );
        console.log(
          `  Stellar wind limit: ${limits.stellarWindLimit.toFixed(3)} AU`
        );
        console.log(
          `  Tidal heating limit: ${limits.tidalHeatingLimit.toFixed(3)} AU`
        );
        isValidPlanet = false;
        continue;
      }

      // Check orbital clearance against other planets (existing logic)
      if (isValidPlanet) {
        for (let j = 0; j < planets.length; j++) {
          if (i !== j) {
            if (!checkOrbitClearance(planets[i], planets[j])) {
              // If orbits overlap, the more massive body keeps planetary status
              if (planets[i].mass < planets[j].mass) {
                isValidPlanet = false;
                break;
              }
            }
          }
        }
      }

      if (isValidPlanet) {
        validPlanets.push(planets[i]);
      }
    }

    return validPlanets;
  }

  // Filter and limit planets to display, ensuring orbital clearance
  const initialPlanets = system.planets
    .slice(0, maxOrbits) // Limit to 10 orbits
    .filter((planet) => planet.distance * orbitScaleFactor <= maxRadius); // Filter by maximum radius

  // Initialize orbital parameters for all initial planets first
  initialPlanets.forEach((planet: PlanetType) => {
    if (!planet.orbitalState) {
      const semiMajorAxis = planet.distance; // AU
      const eccentricity = Math.random() * 0.3; // Random eccentricity 0-0.3 for realistic orbits
      const inclination = (Math.random() - 0.5) * 0.2; // Small random inclination ±0.1 radians
      const longitudeOfAscendingNode = Math.random() * 2 * Math.PI;
      const argumentOfPeriapsis = Math.random() * 2 * Math.PI;

      // Calculate orbital period using Kepler's third law (in Earth days)
      const orbitalPeriod = Math.sqrt(Math.pow(semiMajorAxis, 3)) * 365.25;

      // Mean motion (radians per day)
      const meanMotion = (2 * Math.PI) / orbitalPeriod;

      // Initialize mean anomaly (position in orbit)
      const meanAnomaly = Math.random() * 2 * Math.PI;

      planet.orbitalState = {
        semiMajorAxis,
        eccentricity,
        inclination,
        longitudeOfAscendingNode,
        argumentOfPeriapsis,
        meanAnomaly,
        meanMotion,
        orbitalPeriod,
      };
    }
  });

  // Apply orbital clearance validation to ensure proper planetary classification
  const planetsToDisplay = validatePlanetaryStatus(initialPlanets);

  console.log(
    `Original planets: ${initialPlanets.length}, Valid planets after clearance check: ${planetsToDisplay.length}`
  );

  // Initialize planets with sprites and create orbital visualizations
  planetsToDisplay.forEach((planet: PlanetType) => {
    // Randomly choose from all 3 planet textures
    const planetTextures = [desert, aqua, jungla];
    const randomTexture =
      planetTextures[Math.floor(Math.random() * planetTextures.length)];
    planet.sprite = new Sprite(randomTexture);
    planet.size = planet.size * 20;
    createOrbitLine(planet);
    createPlanet(planet);
  });

  // Initialize asteroid belts with realistic positioning
  let asteroids: AsteroidBeltObject[] = createAsteroidBelts();

  // Mark asteroids for easy identification
  asteroids.forEach((asteroid) => {
    asteroid.sprite.isAsteroid = true;
  });

  // Animation loop with Newtonian physics
  app.ticker.add((delta) => {
    const deltaTime = timeScale * delta; // Scale time progression

    planetsToDisplay.forEach((planet: PlanetType) => {
      const orbitalState = planet.orbitalState;
      if (!orbitalState) return;

      // Update mean anomaly (planet's position in its orbit over time)
      orbitalState.meanAnomaly += orbitalState.meanMotion * deltaTime;
      orbitalState.meanAnomaly = orbitalState.meanAnomaly % (2 * Math.PI); // Keep in range [0, 2π]

      // Solve Kepler's equation for eccentric anomaly (iterative method)
      let eccentricAnomaly = orbitalState.meanAnomaly;
      for (let i = 0; i < 5; i++) {
        // 5 iterations for good precision
        eccentricAnomaly =
          orbitalState.meanAnomaly +
          orbitalState.eccentricity * Math.sin(eccentricAnomaly);
      }

      // Calculate true anomaly (actual angular position from periapsis)
      const trueAnomaly =
        2 *
        Math.atan2(
          Math.sqrt(1 + orbitalState.eccentricity) *
            Math.sin(eccentricAnomaly / 2),
          Math.sqrt(1 - orbitalState.eccentricity) *
            Math.cos(eccentricAnomaly / 2)
        );

      // Calculate distance from star (varies with eccentricity)
      const distance =
        orbitalState.semiMajorAxis *
        (1 - orbitalState.eccentricity * Math.cos(eccentricAnomaly));

      // Calculate position in orbital plane
      const orbitalX = distance * Math.cos(trueAnomaly);
      const orbitalY = distance * Math.sin(trueAnomaly);

      // Apply 3D rotation for inclination and other orbital elements
      const cosLAN = Math.cos(orbitalState.longitudeOfAscendingNode);
      const sinLAN = Math.sin(orbitalState.longitudeOfAscendingNode);
      const cosAP = Math.cos(orbitalState.argumentOfPeriapsis);
      const sinAP = Math.sin(orbitalState.argumentOfPeriapsis);
      const cosI = Math.cos(orbitalState.inclination);
      const sinI = Math.sin(orbitalState.inclination);

      // Transform from orbital plane to 3D space
      const x3d =
        (cosLAN * cosAP - sinLAN * sinAP * cosI) * orbitalX +
        (-cosLAN * sinAP - sinLAN * cosAP * cosI) * orbitalY;
      const y3d =
        (sinLAN * cosAP + cosLAN * sinAP * cosI) * orbitalX +
        (-sinLAN * sinAP + cosLAN * cosAP * cosI) * orbitalY;
      const z3d = sinAP * sinI * orbitalX + cosAP * sinI * orbitalY;

      // Convert to screen coordinates (project 3D to 2D)
      const screenX = x3d * orbitScaleFactor;
      const screenY =
        (y3d * Math.cos(0.5) - z3d * Math.sin(0.5)) * orbitScaleFactor; // Slight 3D tilt for visual effect

      // Apply isometric transformation and position relative to star
      const isoPosition = applyIsometric(screenX, screenY);
      planet.sprite.x = sun.x + isoPosition.x;
      planet.sprite.y = sun.y + isoPosition.y;
    });

    // Animate all asteroid belts (both inner and outer)
    asteroids.forEach((asteroid: AsteroidBeltObject) => {
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
