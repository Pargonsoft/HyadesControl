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
