export default function systemGenerator(
  systemName: string,
  systemX: number,
  systemY: number,
  systemZ: number
) {
  // Table to Generate planets for star system based on Spectral class and metalicity
  // var BC =[{O3:-4.3},{G0:-0.10},{G5:-0.14},{K0:-0.24},{K5:-0.66},{M0:-1.21}]
  const BC = [
    {
      type: "O",
      diameter: 40,
      massRange: [6.6, 13.4],
      metalicityRange: [1, 10],
      planets: [0, 2],
    },
    {
      type: "B",
      diameter: 30,
      massRange: [1.8, 6.6],
      metalicityRange: [1, 10],
      planets: [0, 4],
    },
    {
      type: "A",
      diameter: 25,
      massRange: [1.4, 1.8],
      metalicityRange: [1, 10],
      planets: [1, 4],
    },
    {
      type: "F",
      diameter: 20,
      massRange: [1.15, 1.4],
      metalicityRange: [1, 10],
      planets: [2, 5],
    },
    {
      type: "G",
      diameter: 15,
      massRange: [0.96, 1.15],
      metalicityRange: [1, 10],
      planets: [3, 8],
    },
    {
      type: "K",
      diameter: 12,
      massRange: [0.7, 0.96],
      metalicityRange: [1, 10],
      planets: [4, 7],
    },
    {
      type: "M",
      diameter: 8,
      massRange: [0.2, 0.7],
      metalicityRange: [1, 10],
      planets: [2, 5],
    },
  ];

  // Generate the random star we are going to populate
  const starType = BC[Math.floor(Math.random() * BC.length)];

  // Settle the different mass and metalicity values for the system
  const starMass =
    Math.random() * (starType.massRange[1] - starType.massRange[0]) +
    starType.massRange[0];
  const systemMass = starMass * 0.01001401962 * 1988;
  const systemMetalicity =
    Math.random() *
      (starType.metalicityRange[1] - starType.metalicityRange[0]) +
    starType.metalicityRange[0];

  const starRadius = (starMass * 20) / 10 + 20;

  // Calculate the planets values
  const planetNum =
    Math.round(Math.random() * (starType.planets[1] - starType.planets[0])) +
    starType.planets[0];
  const planetnames = ["b", "c", "d", "e", "f", "g", "h", "i"];
  const massDist = [1, 1, 2, 3, 5, 8, 13, 21];
  // small planets 0.1 and 0.6, Earths 0.6 and 1.1 Super Earths 1.1 and 1.7, mini-Neptunes between 1.7 and 4.0, sub-Saturns between 4.0 and 8.0, and Jupiters above 8.0

  const planets: PlanetType[] = Array.from({ length: planetNum });

  planets.forEach((planet, i) => {
    const localPlanet: PlanetType = {
      name: "",
      size: 0,
      mass: 0,
      orbitRadius: 0,
      orbitSpeed: 0,
      angle: 0,
    };
    localPlanet.name = planetnames[i];
    localPlanet.mass = (systemMass / 54) * massDist[i];
    localPlanet.size = localPlanet.mass * 0.55;
    localPlanet.angle = 0;
    localPlanet.orbitRadius = i * 25 + 100;
    localPlanet.orbitSpeed =
      (starMass * localPlanet.mass * localPlanet.orbitRadius) / 10000000;
    planets[i] = localPlanet;
  });

  const stars: StarType[] = [
    {
      starName: systemName,
      temp: 0,
      mass: starMass,
      starType: starType.type,
      diameter: starRadius,
      posX: 0,
      posY: 0,
    },
  ];

  const asteroids: AsteroidType[] = [
    {
      name: "1",
      mass: systemMass / 54,
      angle: 0,
      orbitRadius: 35,
      orbitSpeed: (((starMass * systemMass) / 54) * 35) / 10000000,
    },
  ];

  const result: SystemType = {
    id: 0,
    name: systemName,
    starType: stars[0].starType as "A" | "B" | "F" | "G" | "K" | "M" | "O",
    galX: systemX,
    galY: systemY,
    galZ: systemZ,
    dist: systemZ,
    mass: starMass,
    metalicity: systemMetalicity,
    stars,
    planets,
    asteroids,
  };

  return result;
}
