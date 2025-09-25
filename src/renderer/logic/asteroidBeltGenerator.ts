import * as PIXI from "pixi.js";
import { Container } from "pixi.js";

// Type for asteroid belt objects (different from AsteroidType in Game.d.ts)
export interface AsteroidBeltObject {
  sprite: PIXI.Sprite & { isAsteroid?: boolean };
  name: string;
  orbitRadius: number;
  orbitSpeed: number;
  angle: number;
  rotation: number;
  rotationSpeed: number;
  beltType: "inner" | "outer";
}

interface AsteroidBeltConfig {
  system: SystemType;
  planetsToDisplay: PlanetType[];
  orbitScaleFactor: number;
  zoomLevel: number;
  container: Container;
  sun: PIXI.Sprite;
  Asteroid: PIXI.Texture;
  applyIsometric: (x: number, y: number) => { x: number; y: number };
}

export class AsteroidBeltGenerator {
  private config: AsteroidBeltConfig;

  constructor(config: AsteroidBeltConfig) {
    this.config = config;
  }

  // Create realistic asteroid belts
  createAsteroidBelts(): AsteroidBeltObject[] {
    const { system, planetsToDisplay, orbitScaleFactor, zoomLevel } =
      this.config;

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

    const asteroidBelts: AsteroidBeltObject[] = [];

    // Try to place inner asteroid belt (rocky, main-belt type)
    let innerBeltDistance = null;

    // First, try placing it at the traditional asteroid belt distance (ice line * 0.6-0.8)
    for (let factor = 0.6; factor <= 0.8; factor += 0.05) {
      const candidateDistance = iceLineDistance * factor;
      const safeDistance = this.findSafeAsteroidDistance(
        candidateDistance,
        0.4,
        planetaryOrbits
      );
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
          const safeDistance = this.findSafeAsteroidDistance(
            candidateDistance,
            0.3,
            planetaryOrbits
          );
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
      const innerBelt = this.createAsteroidRing(
        innerBeltDistance * orbitScaleFactor,
        180, // Even more asteroids for proper dust distribution
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
      const safeDistance = this.findSafeAsteroidDistance(
        candidateDistance,
        0.5,
        planetaryOrbits
      );
      if (safeDistance) {
        outerBeltDistance = safeDistance;
        break;
      }
    }

    // Create outer asteroid belt if safe position found
    if (outerBeltDistance) {
      const outerBelt = this.createAsteroidRing(
        outerBeltDistance * orbitScaleFactor,
        200, // Many more asteroids in outer belt
        0.00005, // Much slower orbital speed (farther from star)
        6 * zoomLevel, // Slightly larger icy bodies
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
  }

  // Function to find safe asteroid belt positions
  private findSafeAsteroidDistance(
    targetDistance: number,
    minClearance = 0.3,
    planetaryOrbits: Array<{ inner: number; outer: number; name: string }>
  ): number | null {
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
          `Asteroid belt at ${targetDistance.toFixed(2)} AU rejected: too close to ${
            orbit.name
          } orbit (${orbit.inner.toFixed(2)}-${orbit.outer.toFixed(2)} AU)`
        );
        return null;
      }
    }
    return targetDistance;
  }

  // Create asteroid ring with belt type identification
  private createAsteroidRing(
    radius: number,
    count: number,
    speed: number,
    size: number,
    beltType: "inner" | "outer" = "inner"
  ): AsteroidBeltObject[] {
    const { container, sun, Asteroid, applyIsometric } = this.config;
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
  }
}
