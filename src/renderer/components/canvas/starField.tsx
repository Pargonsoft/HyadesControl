import {
  Application,
  Assets,
  ICanvas,
  Sprite,
  Container,
  Text,
  TextStyle,
} from "pixi.js";
import log from "electron-log/renderer";
import selector from "@Assets/img/starSelect.png";
import starTextures from "@Components/utils/starTextures";

interface backgroundStarType {
  sprite: Sprite;
  z: number;
  x: number;
  y: number;
}

const run = async (
  app: Application<ICanvas>,
  starCatalog: SystemType[],
  clickedStar: (starID: number) => void
) => {
  const container = new Container();
  app.stage.addChild(container);

  // Load the star texture
  const starTexture = await Assets.load("https://pixijs.com/assets/star.png");
  const starSelect = await Assets.load(selector);
  const starList = starCatalog;

  const backgroundStarAmount = 1000;
  let cameraZ = 0;
  const fov = 20;
  const baseSpeed = 0.025;
  let speed = 0;
  const warpSpeed = 0;
  const starStretch = 5;
  const starBaseSize = 0.05;

  // Zoom functionality
  let zoomLevel = 1; // Current zoom level
  const zoomLevels = [0.25, 0.5, 1, 2, 4]; // Five zoom levels: 25%, 50%, 100%, 200%, 400%
  let currentZoomIndex = 2; // Start at 100% zoom (index 2)

  // Panning functionality
  let panOffsetX = 0; // Horizontal pan offset
  let panOffsetY = 0; // Vertical pan offset
  const panSpeed = 50; // Pan speed in pixels per key press

  // Get canvas center dynamically with pan offset
  const getCenterX = () => app.screen.width / 2 + panOffsetX;
  const getCenterY = () => app.screen.height / 2 + panOffsetY;

  // Function to update zoom and pan, repositioning stars
  const updateZoom = () => {
    zoomLevel = zoomLevels[currentZoomIndex];

    // Reposition all stars with new zoom and pan offsets
    for (let i = 1; i < starList.length; i++) {
      if (starList[i].sprite) {
        starList[i].sprite.x = starList[i].galX * 25 * zoomLevel + getCenterX();
        starList[i].sprite.y = starList[i].galY * 25 * zoomLevel + getCenterY();
        starList[i].sprite.height =
          (starList[i].stars[0].diameter / 100000) * 2 * zoomLevel;
        starList[i].sprite.width =
          (starList[i].stars[0].diameter / 100000) * 2 * zoomLevel;
      }
    }
  };

  // Add keyboard controls for zoom and panning
  const handleKeyPress = (event: KeyboardEvent) => {
    let needsUpdate = false;

    if (event.key === "+" || event.key === "=") {
      // Zoom in
      if (currentZoomIndex < zoomLevels.length - 1) {
        currentZoomIndex++;
        needsUpdate = true;
      }
    } else if (event.key === "-") {
      // Zoom out
      if (currentZoomIndex > 0) {
        currentZoomIndex--;
        needsUpdate = true;
      }
    } else if (event.key === "c" || event.key === "C") {
      // Center/Reset zoom and pan
      currentZoomIndex = 2; // Reset to 100% zoom (index 2 in new array)
      panOffsetX = 0; // Reset pan
      panOffsetY = 0; // Reset pan
      needsUpdate = true;
    } else if (event.key === "ArrowUp") {
      // Pan up
      panOffsetY -= panSpeed;
      needsUpdate = true;
    } else if (event.key === "ArrowDown") {
      // Pan down
      panOffsetY += panSpeed;
      needsUpdate = true;
    } else if (event.key === "ArrowLeft") {
      // Pan left
      panOffsetX -= panSpeed;
      needsUpdate = true;
    } else if (event.key === "ArrowRight") {
      // Pan right
      panOffsetX += panSpeed;
      needsUpdate = true;
    }

    if (needsUpdate) {
      updateZoom(); // This function now handles both zoom and pan updates
    }
  };

  // Add event listener for keyboard controls
  window.addEventListener("keydown", handleKeyPress);

  // Add mouse wheel zoom functionality
  const handleWheel = (event: WheelEvent) => {
    event.preventDefault(); // Prevent page scrolling

    let needsUpdate = false;

    if (event.deltaY < 0) {
      // Scroll up - zoom in
      if (currentZoomIndex < zoomLevels.length - 1) {
        currentZoomIndex++;
        needsUpdate = true;
      }
    } else if (event.deltaY > 0) {
      // Scroll down - zoom out
      if (currentZoomIndex > 0) {
        currentZoomIndex--;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      updateZoom();
    }
  };

  // Add event listener for mouse wheel
  window.addEventListener("wheel", handleWheel, { passive: false });

  // Create the stars
  const backgroundStars: Array<backgroundStarType> = [];

  for (let i = 0; i < backgroundStarAmount; i++) {
    const newStar = {
      sprite: new Sprite(starTexture),
      z: 0,
      x: 0,
      y: 0,
    };

    newStar.sprite.anchor.x = 0.5;
    newStar.sprite.anchor.y = 0.7;
    newStar.sprite.alpha = 0.4;
    randomizeStar(newStar, true);
    app.stage.addChild(newStar.sprite);
    backgroundStars.push(newStar);
  }

  for (let i = 1; i < starList.length; i++) {
    console.log("RENDERING: ", starList[i]);
    if (starList[i].sprite === undefined)
      starList[i].sprite = new Sprite(
        await Assets.load(starTextures[starList[i].type])
      );

    const newStar = starList[i];
    log.info(
      newStar.name,
      Math.round((newStar.stars[0].diameter / 100000) * 2)
    );

    newStar.sprite.x = starList[i].galX * 25 * zoomLevel + getCenterX();
    newStar.sprite.y = starList[i].galY * 25 * zoomLevel + getCenterY();
    newStar.sprite.height =
      (newStar.stars[0].diameter / 100000) * 2 * zoomLevel;
    newStar.sprite.width = (newStar.stars[0].diameter / 100000) * 2 * zoomLevel;
    newStar.sprite.anchor.set(0.5);

    // hover effects
    newStar.sprite.interactive = true;

    newStar.sprite.onmouseover = () => {
      log.info(`hover ${newStar.name}`);
      const circle = new Sprite(starSelect);
      circle.anchor.set(0.5);
      circle.alpha = 0.7;
      // Scale the hover circle inversely with zoom level - larger when zoomed out
      circle.scale.set(Math.max(2, 1 / zoomLevel));

      const style = new TextStyle({
        fontFamily: "Arial",
        fontSize: Math.max(300, 60 * (4 / zoomLevel)), // Scale font size directly with zoom - larger when zoomed out
        fontWeight: "bold",
        fill: "0xFFFFFF",
        wordWrap: true,
        wordWrapWidth: Math.max(300, 200 * (4 / zoomLevel)), // Scale word wrap width with zoom
      });
      const text = new Text(newStar.name, style);
      // Position text relative to zoom level
      text.x = Math.max(100, 75 * (4 / zoomLevel));
      text.y = -Math.max(50, 30 * (4 / zoomLevel)); // Position above the star
      text.tint = "0xFFFFFF";

      newStar.sprite.addChild(circle);
      newStar.sprite.addChild(text);
    };

    newStar.sprite.onmouseleave = () => {
      log.info(`left ${newStar.name}`);
      newStar.sprite.removeChildren();
    };

    newStar.sprite.onclick = () => {
      log.info(`clicked ${newStar.name}`);
      clickedStar(starList[i].id);
    };

    app.stage.addChild(newStar.sprite);
  }

  function randomizeStar(star: backgroundStarType, initial?: boolean) {
    star.z = initial
      ? Math.random() * 2000
      : cameraZ + Math.random() * 1000 + 2000;

    // Calculate star positions with radial random coordinate so no star hits the camera.
    const deg = Math.random() * Math.PI * 2;
    const distance = Math.random() * 50 + 1;

    star.x = Math.cos(deg) * distance;
    star.y = Math.sin(deg) * distance;
  }

  function easeBackgroundStars(delta: number) {
    // Simple easing. This should be changed to proper easing function when used for real.
    speed += (warpSpeed - speed) / 20;
    cameraZ += delta * 10 * (speed + baseSpeed);
    for (let i = 0; i < backgroundStarAmount; i++) {
      const star = backgroundStars[i];

      if (star.z < cameraZ) randomizeStar(star);

      // Map star 3d position to 2d with really simple projection
      const z = star.z - cameraZ;

      star.sprite.x =
        star.x * (fov / z) * app.renderer.screen.width +
        app.renderer.screen.width / 2;
      star.sprite.y =
        star.y * (fov / z) * app.renderer.screen.width +
        app.renderer.screen.height / 2;

      // Calculate star scale & rotation.
      const dxCenter = star.sprite.x - app.renderer.screen.width / 2;
      const dyCenter = star.sprite.y - app.renderer.screen.height / 2;
      const distanceCenter = Math.sqrt(
        dxCenter * dxCenter + dyCenter * dyCenter
      );
      const distanceScale = Math.max(0, (2000 - z) / 2000);

      star.sprite.scale.x = distanceScale * starBaseSize;
      // Star is looking towards center so that y axis is towards center.
      // Scale the star depending on how fast we are moving, what the stretchfactor is
      // and depending on how far away it is from the center.
      star.sprite.scale.y =
        distanceScale * starBaseSize +
        (distanceScale * speed * starStretch * distanceCenter) /
          app.renderer.screen.width;
      star.sprite.rotation = Math.atan2(dyCenter, dxCenter) + Math.PI / 2;
    }
  }

  // Listen for animate update
  app.ticker.add((deltaTime) => {
    easeBackgroundStars(deltaTime);
  });

  // Handle window resize to recenter stars
  const handleResize = () => {
    updateZoom(); // Recenter stars when window resizes
  };

  window.addEventListener("resize", handleResize);

  // Note: Event listeners should be cleaned up when component unmounts
};

export default run;
