import * as PIXI from "pixi.js";
import { AsteroidBeltObject } from "./asteroidBeltGenerator";
import { OrbitalRenderer } from "./orbitalRenderer";

interface AnimationControllerConfig {
  planetsToDisplay: PlanetType[];
  asteroids: AsteroidBeltObject[];
  orbitalRenderer: OrbitalRenderer;
  applyIsometric: (x: number, y: number) => { x: number; y: number };
  sun: PIXI.Sprite;
  timeScale: number;
}

export class AnimationController {
  private config: AnimationControllerConfig;

  constructor(config: AnimationControllerConfig) {
    this.config = config;
  }

  // Main animation loop function
  createAnimationLoop(app: PIXI.Application): void {
    app.ticker.add((delta: number) => {
      const { planetsToDisplay, asteroids, applyIsometric, sun, timeScale } = this.config;
      const deltaTime = timeScale * delta; // Scale time progression

      // Animate planets using Newtonian orbital mechanics
      planetsToDisplay.forEach((planet: PlanetType) => {
        const orbitalState = planet.orbitalState;
        if (!orbitalState || !planet.sprite) return;

        // Update mean anomaly based on orbital motion
        orbitalState.meanAnomaly += orbitalState.meanMotion * deltaTime;

        // Solve Kepler's equation for eccentric anomaly (simplified Newton-Raphson)
        let eccentricAnomaly = orbitalState.meanAnomaly;
        for (let iteration = 0; iteration < 5; iteration++) {
          const delta_E =
            (orbitalState.meanAnomaly - eccentricAnomaly + orbitalState.eccentricity * Math.sin(eccentricAnomaly)) /
            (1 - orbitalState.eccentricity * Math.cos(eccentricAnomaly));
          eccentricAnomaly += delta_E;
          if (Math.abs(delta_E) < 1e-6) break; // Convergence check
        }

        // Convert to true anomaly
        const trueAnomaly = 2 * Math.atan2(
          Math.sqrt(1 + orbitalState.eccentricity) * Math.sin(eccentricAnomaly / 2),
          Math.sqrt(1 - orbitalState.eccentricity) * Math.cos(eccentricAnomaly / 2)
        );

        // Calculate distance from star using elliptical orbit equation
        const radius = orbitalState.semiMajorAxis * (1 - orbitalState.eccentricity ** 2) /
          (1 + orbitalState.eccentricity * Math.cos(trueAnomaly));

        // Position in orbital plane
        const xOrb = radius * Math.cos(trueAnomaly);
        const yOrb = radius * Math.sin(trueAnomaly);

        // Apply 3D rotations for orbital inclination and orientation
        const cosLAN = Math.cos(orbitalState.longitudeOfAscendingNode);
        const sinLAN = Math.sin(orbitalState.longitudeOfAscendingNode);
        const cosAP = Math.cos(orbitalState.argumentOfPeriapsis);
        const sinAP = Math.sin(orbitalState.argumentOfPeriapsis);
        const cosI = Math.cos(orbitalState.inclination);
        // sinI not used in 2D projection

        // Rotate by argument of periapsis
        const x1 = xOrb * cosAP - yOrb * sinAP;
        const y1 = xOrb * sinAP + yOrb * cosAP;

        // Rotate by inclination
        const x2 = x1;
        const y2 = y1 * cosI;

        // Rotate by longitude of ascending node
        const screenX = x2 * cosLAN - y2 * sinLAN;
        const screenY = x2 * sinLAN + y2 * cosLAN;

        // Apply isometric transformation and position relative to star
        const isoPosition = applyIsometric(screenX * 80, screenY * 80); // Use base scale factor
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
        asteroid.rotation = asteroid.rotationSpeed * delta * Math.PI + asteroid.rotation;
        asteroid.sprite.rotation = asteroid.rotation;
      });
    });
  }

  // Update asteroids reference (useful when recreating asteroids during zoom)
  updateAsteroids(newAsteroids: AsteroidBeltObject[]): void {
    this.config.asteroids = newAsteroids;
  }

  // Update configuration
  updateConfig(newConfig: Partial<AnimationControllerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}