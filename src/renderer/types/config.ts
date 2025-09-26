import * as PIXI from "pixi.js";
import { Container, Sprite } from "pixi.js";
import { SystemType, PlanetType } from "./celestial";
import { AsteroidBeltObject } from "./asteroid";
import { OrbitalRenderer } from "../logic/orbitalRenderer";
import { AnimationController } from "../logic/animationController";

/**
 * Configuration for AsteroidBeltGenerator
 */
export interface AsteroidBeltConfig {
  system: SystemType;
  planetsToDisplay: PlanetType[];
  orbitScaleFactor: number;
  zoomLevel: number;
  container: Container;
  sun: Sprite;
  Asteroid: PIXI.Texture;
  applyIsometric: (x: number, y: number) => { x: number; y: number };
}

/**
 * Configuration for PlanetaryValidator
 */
export interface PlanetaryValidatorConfig {
  system: SystemType;
  maxRadius: number;
  orbitScaleFactor: number;
}

/**
 * Configuration for OrbitalRenderer
 */
export interface OrbitalRendererConfig {
  container: Container;
  orbitScaleFactor: number;
  zoomLevel: number;
  sun: Sprite;
  applyIsometric: (x: number, y: number) => { x: number; y: number };
}

/**
 * Configuration for AnimationController
 */
export interface AnimationControllerConfig {
  planetsToDisplay: PlanetType[];
  asteroids: AsteroidBeltObject[];
  orbitalRenderer: OrbitalRenderer;
  orbitScaleFactor: number;
  applyIsometric: (x: number, y: number) => { x: number; y: number };
  sun: Sprite;
  timeScale: number;
}

/**
 * Configuration for ZoomController
 */
export interface ZoomControllerConfig {
  app: PIXI.Application;
  container: Container;
  system: SystemType;
  sun: Sprite;
  planetsToDisplay: PlanetType[];
  orbitalRenderer: OrbitalRenderer;
  animationController: AnimationController;
  recreateAsteroids: () => AsteroidBeltObject[];
  zoomIndicator: PIXI.Text;
  baseOrbitScaleFactor: number;
}
