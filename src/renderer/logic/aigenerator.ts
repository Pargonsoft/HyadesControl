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

  function generatePlanet(
    index: number,
    starMass: number,
    luminosity: number,
    goldilocksZone: { innerBoundary: number; outerBoundary: number },
    orbitalPeriodRatio: number,
    previousPlanetDistance: number
  ): PlanetType {
    const distance =
      previousPlanetDistance * Math.pow(orbitalPeriodRatio, 2 / 3); // AU
    const speed = Math.sqrt((G * starMass) / (distance * AU)) / 1000; // km/s
    const composition = generateComposition(metallicity);
    const albedo = calculateAlbedo(composition);
    const meanTemperature = calculateMeanTemperature(
      distance,
      luminosity,
      albedo
    );
    const inGoldilocksZone =
      distance >= goldilocksZone.innerBoundary &&
      distance <= goldilocksZone.outerBoundary;

    return {
      name: PLANET_NAMES[index],
      distance,
      speed,
      angle: random(0, 360),
      size: random(2000, 70000),
      mass: random(0.1, 300) * 5.972e24, // Earth masses
      diameter: random(4000, 140000),
      orbitalPeriod: Math.sqrt(Math.pow(distance, 3)) * 365.25, // Kepler's third law
      meanTemperature,
      inGoldilocksZone,
      composition,
      albedo,
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
  let previousPlanetDistance = random(0.1, 0.5); // Initial distance of the first planet
  for (let i = 0; i < numPlanets; i++) {
    const orbitalPeriodRatio = random(1.3, 2.0); // Ratio for orbital resonance
    planets.push(
      generatePlanet(
        i,
        stars[0].mass,
        stars[0].luminosity,
        goldilocksZone,
        orbitalPeriodRatio,
        previousPlanetDistance
      )
    );
    previousPlanetDistance = planets[i].distance;
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
