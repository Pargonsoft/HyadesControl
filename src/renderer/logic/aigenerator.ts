import type { SystemType, PlanetType, StarType, AsteroidType, OrbitalState } from "../types";

// Typical albedo values for various compositions
const ALBEDO_VALUES: { [key: string]: number } = {
  hydrogen: 0.1,
  helium: 0.1,
  iron: 0.15,
  silicon: 0.2,
  carbon: 0.25,
  water: 0.6,
  ammonia: 0.5,
  methane: 0.4,
  sulfur: 0.2,
  nitrogen: 0.3,
};

const PLANET_NAMES = ["b", "c", "d", "e", "f", "g", "h", "i"];

export default function generateStarSystem(
  cloudMass: number,
  metallicity: number,
  starName: string,
  galX: number,
  galY: number,
  galZ: number
): SystemType {
  // Constants and helper functions
  const G = 6.6743e-11; // Gravitational constant
  const AU = 1.496e11; // Astronomical unit in meters
  const SOLAR_MASS = 1.989e30; // Solar mass in kg
  const SOLAR_LUMINOSITY = 3.828e26; // Solar luminosity in watts

  function random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  function calculateAlbedo(composition: { [key: string]: number }): number {
    const totalAlbedo = Object.entries(composition).reduce(
      (total, [element, percentage]) => {
        return (
          total + (ALBEDO_VALUES[element.toLowerCase()] || 0.3) * percentage
        );
      },
      0
    );
    return totalAlbedo;
  }

  function generateComposition(metallicity: number): { [key: string]: number } {
    return {
      hydrogen: 0.7 - metallicity,
      helium: 0.28 - metallicity,
      iron: 0.002 + metallicity / 2,
      silicon: 0.002 + metallicity / 4,
      carbon: 0.001 + metallicity / 4,
      water: 0.01 + metallicity / 4,
      ammonia: 0.001,
      methane: 0.001,
      sulfur: 0.001,
      nitrogen: 0.001,
    };
  }

  function generateStar(mass: number, metallicity: number): StarType {
    const type =
      mass < 0.8
        ? "M"
        : mass < 1.04
        ? "K"
        : mass < 1.4
        ? "G"
        : mass < 2.1
        ? "F"
        : "A";
    const surfaceTemperature =
      type === "M"
        ? random(2400, 3700)
        : type === "K"
        ? random(3700, 5200)
        : type === "G"
        ? random(5200, 6000)
        : type === "F"
        ? random(6000, 7500)
        : random(7500, 10000);
    const luminosity =
      type === "M"
        ? random(0.01, 0.08)
        : type === "K"
        ? random(0.08, 0.6)
        : type === "G"
        ? random(0.6, 1.5)
        : type === "F"
        ? random(1.5, 5)
        : random(5, 25);
    const composition = generateComposition(metallicity);
    const albedo = calculateAlbedo(composition);

    return {
      distance: 0,
      speed: 0,
      angle: 0,
      size: random(500000, 1500000),
      mass: mass * SOLAR_MASS,
      diameter: random(700000, 1400000),
      type,
      surfaceTemperature,
      luminosity,
      composition,
      albedo,
      metallicity,
    };
  }

  function calculateGoldilocksZone(luminosity: number): {
    innerBoundary: number;
    outerBoundary: number;
  } {
    const innerBoundary = Math.sqrt(luminosity / 1.1); // AU
    const outerBoundary = Math.sqrt(luminosity / 0.53); // AU
    return { innerBoundary, outerBoundary };
  }

  function calculateMeanTemperature(
    distance: number,
    luminosity: number,
    albedo: number
  ): number {
    const solarFlux =
      (luminosity * SOLAR_LUMINOSITY) /
      (4 * Math.PI * Math.pow(distance * AU, 2)); // in W/m^2
    const meanTemperature = Math.pow(
      (solarFlux * (1 - albedo)) / (4 * 5.67e-8),
      0.25
    ); // in Kelvin
    return meanTemperature;
  }

  function calculateHillSphere(
    planetMass: number,
    starMass: number,
    orbitalDistance: number
  ): number {
    // Hill sphere radius in AU
    return orbitalDistance * Math.pow(planetMass / (3 * starMass), 1/3);
  }

  function validateOrbitalSpacing(
    planets: PlanetType[],
    starMass: number
  ): { isValid: boolean; minSeparation: number; issues: string[] } {
    const issues: string[] = [];
    let minSeparation = Infinity;
    let isValid = true;

    // Sort planets by distance
    const sortedPlanets = [...planets].sort((a, b) => a.distance - b.distance);

    for (let i = 0; i < sortedPlanets.length - 1; i++) {
      const inner = sortedPlanets[i];
      const outer = sortedPlanets[i + 1];
      
      const separation = outer.distance - inner.distance;
      minSeparation = Math.min(minSeparation, separation);

      // Calculate required minimum separation based on Hill spheres
      const innerHill = calculateHillSphere(inner.mass, starMass, inner.distance);
      const outerHill = calculateHillSphere(outer.mass, starMass, outer.distance);
      const requiredSeparation = 2.4 * (innerHill + outerHill); // Mutual Hill radius rule

      if (separation < requiredSeparation) {
        isValid = false;
        issues.push(
          `Planets ${inner.name} and ${outer.name} too close: ${separation.toFixed(3)} AU < ${requiredSeparation.toFixed(3)} AU required`
        );
      }

      // Check for reasonable spacing (planets shouldn't be extremely close)
      if (separation < 0.1) {
        isValid = false;
        issues.push(`Planets ${inner.name} and ${outer.name} extremely close: ${separation.toFixed(3)} AU`);
      }
    }

    return { isValid, minSeparation: minSeparation === Infinity ? 0 : minSeparation, issues };
  }

  function generateStableOrbitalDistances(
    numPlanets: number,
    starMass: number,
    innerLimit = 0.1,
    outerLimit = 50
  ): number[] {
    const distances: number[] = [];
    
    if (numPlanets === 0) return distances;

    // Start with first planet at a reasonable distance from the star
    let currentDistance = random(innerLimit, Math.max(innerLimit + 0.3, 0.7));
    distances.push(currentDistance);

    // Generate subsequent planets with proper spacing based on Hill spheres and resonances
    for (let i = 1; i < numPlanets; i++) {
      // Use Titius-Bode-like progression with some randomization
      // Each planet should be 1.4 to 2.0 times farther than the previous one
      const spacingFactor = random(1.4, 2.0);
      currentDistance = currentDistance * spacingFactor;
      
      // Add some random variation to avoid perfect geometric progression
      const variation = random(0.9, 1.1);
      currentDistance = currentDistance * variation;
      
      // Ensure we don't exceed outer limit
      if (currentDistance > outerLimit) {
        currentDistance = outerLimit;
        distances.push(currentDistance);
        break;
      }
      
      distances.push(currentDistance);
    }

    return distances;
  }

  function generatePlanet(
    index: number,
    starMass: number,
    starDiameter: number,
    luminosity: number,
    goldilocksZone: { innerBoundary: number; outerBoundary: number },
    orbitalDistance: number
  ): PlanetType {
    const speed = Math.sqrt((G * starMass) / (orbitalDistance * AU)) / 1000; // km/s
    const composition = generateComposition(metallicity);
    const albedo = calculateAlbedo(composition);
    const meanTemperature = calculateMeanTemperature(
      orbitalDistance,
      luminosity,
      albedo
    );
    const inGoldilocksZone =
      orbitalDistance >= goldilocksZone.innerBoundary &&
      orbitalDistance <= goldilocksZone.outerBoundary;

    // Calculate planet size as a percentage of star diameter
    // Planets should be 0.5% to 12% of star diameter for realistic proportions
    // This ensures visual clarity while maintaining realistic scale relationships
    const minPlanetRatio = 0.005; // 0.5% of star diameter
    const maxPlanetRatio = 0.12;  // 12% of star diameter
    const planetDiameterRatio = random(minPlanetRatio, maxPlanetRatio);
    const planetDiameter = starDiameter * planetDiameterRatio;
    const planetSize = planetDiameter * 0.8; // Size is slightly smaller than diameter for game logic

    // Generate realistic mass based on size and type
    const planetMass = random(0.1, 300) * 5.972e24; // Earth masses

    // Generate stable, low-eccentricity orbital elements
    const eccentricity = random(0.001, 0.05); // Very low eccentricity for stability
    const inclination = random(0, 0.1); // Low inclination in radians (~0-6 degrees)
    const longitudeOfAscendingNode = random(0, 2 * Math.PI);
    const argumentOfPeriapsis = random(0, 2 * Math.PI);
    const meanAnomaly = random(0, 2 * Math.PI);
    const orbitalPeriod = Math.sqrt(Math.pow(orbitalDistance, 3)) * 365.25; // Kepler's third law in days
    const meanMotion = (2 * Math.PI) / orbitalPeriod; // radians per day

    const orbitalState: OrbitalState = {
      semiMajorAxis: orbitalDistance,
      eccentricity,
      inclination,
      longitudeOfAscendingNode,
      argumentOfPeriapsis,
      meanAnomaly,
      meanMotion,
      orbitalPeriod
    };

    return {
      name: PLANET_NAMES[index],
      distance: orbitalDistance,
      speed,
      angle: random(0, 360),
      size: planetSize,
      mass: planetMass,
      diameter: planetDiameter,
      orbitalPeriod,
      meanTemperature,
      inGoldilocksZone,
      composition,
      albedo,
      orbitalState
    };
  }

  function generateAsteroid(): AsteroidType {
    const distance = random(1.5, 4.5); // AU
    const speed = random(15, 25); // km/s
    const composition = generateComposition(metallicity);
    const albedo = calculateAlbedo(composition);

    return {
      distance,
      speed,
      angle: random(0, 360),
      size: random(1, 1000),
      mass: random(1e12, 1e15),
      diameter: random(10, 1000),
      composition,
      albedo,
      collapsed: false,
    };
  }

  function cleanPlanetaryOrbits(
    planets: PlanetType[],
    asteroids: AsteroidType[],
    safeRadius: number
  ): AsteroidType[] {
    return asteroids.filter((asteroid) => {
      return !planets.some((planet) => {
        const distanceDifference = Math.abs(
          asteroid.distance - planet.distance
        );
        return distanceDifference < safeRadius;
      });
    });
  }

  // Main logic
  const starMass = cloudMass * 0.9992; // 99.92% of cloud mass for stars
  const numStars = random(1, 3) < 2 ? 1 : 2; // Binary stars are less common
  const stars = [];
  for (let i = 0; i < numStars; i++) {
    stars.push(generateStar(starMass / numStars, metallicity));
  }

  const goldilocksZone = calculateGoldilocksZone(stars[0].luminosity);

  const numPlanets = Math.round(random(1, 15));
  const planets = [];
  
  // Generate stable, non-overlapping orbital distances
  const orbitalDistances = generateStableOrbitalDistances(
    numPlanets, 
    stars[0].mass,
    0.1,  // Inner limit: 0.1 AU (close to star)
    50    // Outer limit: 50 AU (outer solar system)
  );
  
  // Generate planets at the calculated distances
  for (let i = 0; i < orbitalDistances.length; i++) {
    planets.push(
      generatePlanet(
        i,
        stars[0].mass,
        stars[0].diameter,
        stars[0].luminosity,
        goldilocksZone,
        orbitalDistances[i]
      )
    );
  }

  // Validate orbital spacing for debugging/logging
  const validation = validateOrbitalSpacing(planets, stars[0].mass);
  if (!validation.isValid) {
    console.warn(`Orbital spacing issues for ${starName}:`, validation.issues);
  } else {
    console.log(`${starName}: Valid orbital spacing, min separation: ${validation.minSeparation.toFixed(3)} AU`);
  }

  const numAsteroids = Math.round(random(100, 10000));
  let asteroids = [];
  for (let i = 0; i < numAsteroids; i++) {
    asteroids.push(generateAsteroid());
  }

  const safeRadius = 0.05; // Safe radius in AU around each planet's orbit
  asteroids = cleanPlanetaryOrbits(planets, asteroids, safeRadius);

  return {
    id: 0,
    name: starName,
    galX,
    galY,
    galZ,
    mass: cloudMass,
    metallicity,
    type: stars[0].type,
    stars,
    planets,
    asteroids,
    goldilocksZone,
  };
}
