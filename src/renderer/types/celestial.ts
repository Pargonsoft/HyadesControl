import { Sprite } from "pixi.js";

/**
 * Base interface for all celestial objects (stars, planets, asteroids)
 */
export interface CelestialObject {
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

/**
 * Orbital parameters for physics-based orbital mechanics
 */
export interface OrbitalState {
  semiMajorAxis: number; // AU
  eccentricity: number; // 0-1
  inclination: number; // radians
  longitudeOfAscendingNode: number; // radians
  argumentOfPeriapsis: number; // radians
  meanAnomaly: number; // radians
  meanMotion: number; // radians per day
  orbitalPeriod: number; // Earth days
}

/**
 * Star type with stellar properties
 */
export interface StarType extends CelestialObject {
  type: "A" | "B" | "F" | "G" | "K" | "M" | "O";
  surfaceTemperature: number; // in Kelvin
  luminosity: number; // in Solar luminosities
  metallicity: number; // iron-to-hydrogen ratio
}

/**
 * Planet type with planetary properties
 */
export interface PlanetType extends CelestialObject {
  name: string;
  orbitalPeriod: number; // in Earth days
  meanTemperature: number; // in Kelvin
  inGoldilocksZone: boolean;
  orbitalState?: OrbitalState; // Physics-based orbital parameters
}

/**
 * Asteroid type for celestial debris
 */
export interface AsteroidType extends CelestialObject {
  collapsed: boolean;
}

/**
 * Complete star system with all celestial bodies
 */
export interface SystemType {
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
