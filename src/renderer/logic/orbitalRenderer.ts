import { Graphics } from "pixi.js";
import type { PlanetType, OrbitalRendererConfig } from "../types";

export class OrbitalRenderer {
  private config: OrbitalRendererConfig;

  constructor(config: OrbitalRendererConfig) {
    this.config = config;
  }

  // Function to create and add planets to the stage
  createPlanet(planet: PlanetType): void {
    const { zoomLevel } = this.config;
    if (!planet.sprite) return;

    planet.sprite.width = (planet.size / 100000) * zoomLevel;
    planet.sprite.height = (planet.size / 100000) * zoomLevel;
    planet.sprite.anchor.x = 0.5;
    planet.sprite.anchor.y = 0.5;

    this.updatePlanetPosition(planet);
    this.config.container.addChild(planet.sprite);
  }

  // Function to create and add orbit lines to the stage (properly oriented elliptical orbits)
  createOrbitLine(planet: PlanetType): void {
    const { container, orbitScaleFactor, sun, applyIsometric } = this.config;
    const orbitalState = planet.orbitalState;
    if (!orbitalState) return;

    const orbit = new Graphics();
    orbit.lineStyle(1, 0x999999, 0.5);

    // Draw the actual orbital path by calculating positions at many points
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

      // Distance from focus (Kepler's equation in polar coordinates)
      const r =
        (orbitalState.semiMajorAxis * (1 - orbitalState.eccentricity ** 2)) /
        (1 + orbitalState.eccentricity * Math.cos(trueAnomaly));

      // Position in orbital plane
      const xOrb = r * Math.cos(trueAnomaly);
      const yOrb = r * Math.sin(trueAnomaly);

      // Apply 3D rotation matrices for orbital inclination and orientation
      // First rotate by argument of periapsis
      const x1 = xOrb * cosAP - yOrb * sinAP;
      const y1 = xOrb * sinAP + yOrb * cosAP;
      const z1 = 0;

      // Then rotate by inclination
      const x2 = x1;
      const y2 = y1 * cosI - z1 * sinI;
      // z2 component not needed for 2D projection

      // Finally rotate by longitude of ascending node
      const x3 = x2 * cosLAN - y2 * sinLAN;
      const y3 = x2 * sinLAN + y2 * cosLAN;

      // Scale and apply isometric projection
      const scaledX = x3 * orbitScaleFactor;
      const scaledY = y3 * orbitScaleFactor;
      const isoPos = applyIsometric(scaledX, scaledY);

      if (i === 0) {
        orbit.moveTo(isoPos.x, isoPos.y);
      } else {
        orbit.lineTo(isoPos.x, isoPos.y);
      }
    }

    orbit.x = sun.x;
    orbit.y = sun.y;
    container.addChild(orbit);
  }

  // Function to update individual planet position
  updatePlanetPosition(planet: PlanetType): void {
    const { orbitScaleFactor, sun, applyIsometric } = this.config;
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

    // Distance from star
    const radius =
      (orbitalState.semiMajorAxis * (1 - orbitalState.eccentricity ** 2)) /
      (1 + orbitalState.eccentricity * Math.cos(trueAnomaly));

    // Position in orbital plane
    const xOrb = radius * Math.cos(trueAnomaly);
    const yOrb = radius * Math.sin(trueAnomaly);

    // Apply 3D rotations (same as orbit line)
    const cosLAN = Math.cos(orbitalState.longitudeOfAscendingNode);
    const sinLAN = Math.sin(orbitalState.longitudeOfAscendingNode);
    const cosAP = Math.cos(orbitalState.argumentOfPeriapsis);
    const sinAP = Math.sin(orbitalState.argumentOfPeriapsis);
    const cosI = Math.cos(orbitalState.inclination);
    // sinI not needed for 2D projection

    const x1 = xOrb * cosAP - yOrb * sinAP;
    const y1 = xOrb * sinAP + yOrb * cosAP;

    const x2 = x1;
    const y2 = y1 * cosI;

    const screenX = x2 * cosLAN - y2 * sinLAN;
    const screenY = x2 * sinLAN + y2 * cosLAN;

    // Apply isometric transformation and position relative to star
    const isoPosition = applyIsometric(
      screenX * orbitScaleFactor,
      screenY * orbitScaleFactor
    );

    planet.sprite.x = sun.x + isoPosition.x;
    planet.sprite.y = sun.y + isoPosition.y;
  }

  // Update configuration (useful for zoom changes)
  updateConfig(newConfig: Partial<OrbitalRendererConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
