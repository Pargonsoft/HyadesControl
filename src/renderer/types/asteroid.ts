import * as PIXI from "pixi.js";

/**
 * Asteroid belt object for rendering and animation
 */
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
