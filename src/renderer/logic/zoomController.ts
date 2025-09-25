import * as PIXI from "pixi.js";
import { Container } from "pixi.js";
import { AsteroidBeltObject } from "./asteroidBeltGenerator";
import { OrbitalRenderer } from "./orbitalRenderer";

interface ZoomControllerConfig {
  app: PIXI.Application;
  container: Container;
  system: SystemType;
  sun: PIXI.Sprite;
  planetsToDisplay: PlanetType[];
  orbitalRenderer: OrbitalRenderer;
  recreateAsteroids: () => AsteroidBeltObject[];
  zoomIndicator: PIXI.Text;
  baseOrbitScaleFactor: number;
}

export class ZoomController {
  private config: ZoomControllerConfig;
  private zoomLevel = 1;
  private readonly zoomLevels = [0.5, 1, 2, 4, 8];
  private currentZoomIndex = 1;
  private orbitScaleFactor: number;
  private panOffsetX = 0;
  private panOffsetY = 0;
  private readonly panSpeed = 50;

  constructor(config: ZoomControllerConfig) {
    this.config = config;
    this.orbitScaleFactor = config.baseOrbitScaleFactor * this.zoomLevel;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    const { app } = this.config;

    // Handle keyboard input for zoom and pan
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case "+":
        case "=":
          // Zoom in
          if (this.currentZoomIndex < this.zoomLevels.length - 1) {
            this.currentZoomIndex++;
            this.updateZoom();
            this.updateZoomIndicator();
          }
          break;
        case "-":
          // Zoom out
          if (this.currentZoomIndex > 0) {
            this.currentZoomIndex--;
            this.updateZoom();
            this.updateZoomIndicator();
          }
          break;
        case "ArrowUp":
          this.panOffsetY += this.panSpeed;
          this.updatePanPosition();
          break;
        case "ArrowDown":
          this.panOffsetY -= this.panSpeed;
          this.updatePanPosition();
          break;
        case "ArrowLeft":
          this.panOffsetX += this.panSpeed;
          this.updatePanPosition();
          break;
        case "ArrowRight":
          this.panOffsetX -= this.panSpeed;
          this.updatePanPosition();
          break;
        case "c":
        case "C":
          // Center the view
          this.panOffsetX = 0;
          this.panOffsetY = 0;
          this.updatePanPosition();
          break;
      }
    };

    // Handle mouse wheel zoom
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.deltaY < 0) {
        // Scroll up - zoom in
        if (this.currentZoomIndex < this.zoomLevels.length - 1) {
          this.currentZoomIndex++;
          this.updateZoom();
          this.updateZoomIndicator();
        }
      } else if (event.deltaY > 0) {
        // Scroll down - zoom out
        if (this.currentZoomIndex > 0) {
          this.currentZoomIndex--;
          this.updateZoom();
          this.updateZoomIndicator();
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    const canvas = app.view as HTMLCanvasElement;
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    // Store cleanup function for later use
    (globalThis as any).systemViewCleanup = () => {
      document.removeEventListener("keydown", handleKeyPress);
      canvas.removeEventListener("wheel", handleWheel);
      if (this.config.zoomIndicator.parent) {
        app.stage.removeChild(this.config.zoomIndicator);
      }
    };
  }

  // Function to update zoom and recalculate positions
  private updateZoom(): void {
    const {
      app,
      container,
      system,
      sun,
      planetsToDisplay,
      orbitalRenderer,
      recreateAsteroids,
    } = this.config;

    this.zoomLevel = this.zoomLevels[this.currentZoomIndex];
    this.orbitScaleFactor = this.config.baseOrbitScaleFactor * this.zoomLevel;

    // Clean up any old asteroids that might still be on app.stage from before the fix
    app.stage.children.forEach((child) => {
      if ((child as PIXI.Sprite & { isAsteroid?: boolean }).isAsteroid) {
        app.stage.removeChild(child);
      }
    });

    // Update star size and position
    const apparentSize = system.stars[0].diameter / 100000;
    sun.width = apparentSize * 4 * this.zoomLevel;
    sun.height = apparentSize * 4 * this.zoomLevel;
    sun.x = app.screen.width / 2 + this.panOffsetX;
    sun.y = app.screen.height / 2 + this.panOffsetY;

    // Update all planet positions, sizes, and orbits
    container.removeChildren(); // Clear existing graphics
    container.addChild(sun); // Re-add star

    // Update orbital renderer configuration
    orbitalRenderer.updateConfig({
      orbitScaleFactor: this.orbitScaleFactor,
      zoomLevel: this.zoomLevel,
    });

    // Recreate orbits and planets with new scale
    planetsToDisplay.forEach((planet: PlanetType) => {
      if (planet.sprite) {
        // Update planet size
        planet.sprite.width = (planet.size / 100000) * this.zoomLevel;
        planet.sprite.height = (planet.size / 100000) * this.zoomLevel;

        // Recreate orbit line with new scale
        orbitalRenderer.createOrbitLine(planet);

        // Update planet position
        orbitalRenderer.updatePlanetPosition(planet);

        container.addChild(planet.sprite);
      }
    });

    // Recreate asteroids with new scale
    recreateAsteroids();
  }

  private updatePanPosition(): void {
    const { app, sun } = this.config;
    sun.x = app.screen.width / 2 + this.panOffsetX;
    sun.y = app.screen.height / 2 + this.panOffsetY;
  }

  private updateZoomIndicator(): void {
    const { zoomIndicator } = this.config;
    zoomIndicator.text = `Zoom: ${Math.round(this.zoomLevel * 100)}% | Use +/- or mouse wheel to zoom | Arrow keys to pan | C to center`;
  }

  // Getters for current values
  getCurrentZoomLevel(): number {
    return this.zoomLevel;
  }

  getCurrentOrbitScaleFactor(): number {
    return this.orbitScaleFactor;
  }

  getPanOffset(): { x: number; y: number } {
    return { x: this.panOffsetX, y: this.panOffsetY };
  }

  // Update zoom indicator initially
  initialize(): void {
    this.updateZoomIndicator();
  }
}
