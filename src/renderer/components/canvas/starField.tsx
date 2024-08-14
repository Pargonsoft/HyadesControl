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

    newStar.sprite.x = starList[i].galX * 25 + 550;
    newStar.sprite.y = starList[i].galY * 25 + 400;
    newStar.sprite.height = (newStar.stars[0].diameter / 100000) * 2;
    newStar.sprite.width = (newStar.stars[0].diameter / 100000) * 2;
    newStar.sprite.anchor.set(0.5);

    // hover effects
    newStar.sprite.interactive = true;

    newStar.sprite.onmouseover = () => {
      log.info(`hover ${newStar.name}`);
      const circle = new Sprite(starSelect);
      circle.anchor.set(0.5);
      circle.alpha = 0.7;
      const style = new TextStyle({
        fontFamily: "Arial",
        fontSize: 80,
        fontWeight: "bold",
        fill: "0xFFFFFF",
        wordWrap: true,
        wordWrapWidth: 440,
      });
      const text = new Text(newStar.name, style);
      text.x = 200;
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
};

export default run;
