interface PlanetaryValidatorConfig {
  system: SystemType;
  maxRadius: number;
  orbitScaleFactor: number;
}

export class PlanetaryValidator {
  private config: PlanetaryValidatorConfig;

  constructor(config: PlanetaryValidatorConfig) {
    this.config = config;
  }

  // Function to validate planetary status based on orbital clearance and stellar constraints
  validatePlanetaryStatus(planets: PlanetType[]): PlanetType[] {
    const { system, maxRadius, orbitScaleFactor } = this.config;
    const validPlanets: PlanetType[] = [];
    const starMass = system.stars[0].mass || 1.989e30; // kg
    const starRadius = (system.stars[0].diameter || 1392000) / 2; // km to meters
    const starLuminosity = system.stars[0].luminosity || 1; // Solar luminosities
    const starTemperature = system.stars[0].surfaceTemperature || 5778; // Kelvin
    const starType = system.stars[0].type || "G"; // Spectral class

    // Stellar-type specific minimum distances (based on observational data)
    const stellarTypeMinimums: { [key: string]: number } = {
      O: 0.5, // Very hot, massive stars
      B: 0.3, // Hot, massive stars
      A: 0.2, // Hot stars
      F: 0.15, // Hot-warm stars
      G: 0.1, // Sun-like stars
      K: 0.08, // Cool stars
      M: 0.05, // Red dwarf stars
    };

    // Calculate critical distances
    const calculateCriticalDistances = (planet: PlanetType) => {
      const planetMass = planet.mass || 5.972e24; // kg

      // Roche limit (rigid body approximation) - minimum distance to avoid tidal destruction
      const rocheLimit =
        (2.44 * starRadius * Math.pow(starMass / planetMass, 1 / 3)) /
        1000 /
        149597870.7; // Convert to AU

      // Stellar irradiation limit - where rocky planets would be vaporized
      // Using equilibrium temperature calculation: T_eq = T_star * sqrt(R_star / (2 * d))
      const maxPlanetTemp = planet.composition?.iron > 0.3 ? 2000 : 1500; // K (higher for iron-rich planets)
      const irradiationLimit =
        Math.pow(starTemperature / maxPlanetTemp, 2) *
        (starRadius / (2 * 149597870.7 * 1000)); // AU

      // Atmospheric escape limit - where atmospheres would be stripped away
      const stellarWindLimit = Math.sqrt(starLuminosity) * 0.1; // AU (simplified model)

      // Tidal heating limit - where planets would be tidally heated to destruction
      const tidalHeatingLimit = Math.pow(starMass / 1.989e30, 1 / 3) * 0.015; // AU

      // Hill sphere stability - minimum distance for orbital stability
      const hillSphere = Math.pow(planetMass / (3 * starMass), 1 / 3); // Relative to orbital distance

      return {
        rocheLimit,
        irradiationLimit,
        stellarWindLimit,
        tidalHeatingLimit,
        hillSphere,
      };
    };

    for (let i = 0; i < planets.length; i++) {
      const planet = planets[i];
      const distances = calculateCriticalDistances(planet);

      // Apply stellar constraints with safety margins
      const minSafeDistance = Math.max(
        distances.rocheLimit * 1.5, // 50% safety margin
        distances.irradiationLimit * 1.2, // 20% safety margin
        distances.stellarWindLimit * 1.1, // 10% safety margin
        distances.tidalHeatingLimit * 2.0, // 100% safety margin
        stellarTypeMinimums[starType] || 0.05 // Stellar type minimum
      );

      if (planet.distance < minSafeDistance) {
        console.log(
          `Planet ${planet.name} rejected: too close to star (${planet.distance.toFixed(3)} AU < ${minSafeDistance.toFixed(3)} AU)`
        );
        continue;
      }

      // Check orbital clearance with other valid planets
      let isValid = true;
      for (const existingPlanet of validPlanets) {
        if (!this.checkOrbitClearance(planet, existingPlanet)) {
          console.log(
            `Planet ${planet.name} rejected: overlapping orbit with ${existingPlanet.name}`
          );
          isValid = false;
          break;
        }
      }

      if (isValid) {
        validPlanets.push(planet);
      }
    }

    // Filter planets that fit within the maximum display radius
    const filteredPlanets = validPlanets
      .slice(0, 10) // Limit to maximum orbits
      .filter((planet) => planet.distance * orbitScaleFactor <= maxRadius); // Filter by maximum radius

    // Generate orbital states for valid planets
    filteredPlanets.forEach((planet) => {
      const semiMajorAxis = planet.distance; // AU
      const eccentricity = Math.min(Math.random() * 0.3, 0.8); // 0-30% eccentricity, max 80%
      const inclination = (Math.random() - 0.5) * 0.2; // ±0.1 radians (±5.7°)
      const longitudeOfAscendingNode = Math.random() * 2 * Math.PI;
      const argumentOfPeriapsis = Math.random() * 2 * Math.PI;
      const meanAnomaly = Math.random() * 2 * Math.PI;

      // Calculate orbital period using Kepler's third law (assuming solar mass star)
      const starMassInSolarMasses =
        (system.stars[0].mass || 1.989e30) / 1.989e30;
      const orbitalPeriod =
        Math.sqrt(Math.pow(semiMajorAxis, 3) / starMassInSolarMasses) * 365.25; // Earth days

      planet.orbitalState = {
        semiMajorAxis,
        eccentricity,
        inclination,
        longitudeOfAscendingNode,
        argumentOfPeriapsis,
        meanAnomaly,
        meanMotion: (2 * Math.PI) / orbitalPeriod, // radians per day
        orbitalPeriod,
      };
    });

    return filteredPlanets;
  }

  // Function to check if two orbits overlap (violates planetary definition)
  private checkOrbitClearance(
    planet1: PlanetType,
    planet2: PlanetType
  ): boolean {
    const orbit1 = planet1.orbitalState;
    const orbit2 = planet2.orbitalState;
    if (!orbit1 || !orbit2) return true; // Assume clear if no orbital data

    // Calculate periapsis (closest approach) and apoapsis (farthest distance) for each orbit
    const periapsis1 = orbit1.semiMajorAxis * (1 - orbit1.eccentricity);
    const apoapsis1 = orbit1.semiMajorAxis * (1 + orbit1.eccentricity);
    const periapsis2 = orbit2.semiMajorAxis * (1 - orbit2.eccentricity);
    const apoapsis2 = orbit2.semiMajorAxis * (1 + orbit2.eccentricity);

    // Check for orbital overlap - planets violate the definition if their orbits intersect
    const isCleared = apoapsis1 < periapsis2 || apoapsis2 < periapsis1;

    // Additional check: minimum separation between orbital centers (Hill sphere consideration)
    const minSeparation = 0.3; // AU - minimum separation for stable orbits
    const orbitalSeparation = Math.abs(
      orbit1.semiMajorAxis - orbit2.semiMajorAxis
    );
    const hasMinimumSeparation = orbitalSeparation >= minSeparation;

    return isCleared && hasMinimumSeparation;
  }
}
