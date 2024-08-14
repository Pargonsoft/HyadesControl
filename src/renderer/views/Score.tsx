import React, { useState } from "react";
import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardFooter } from "@Components/ui/card";
import ScoreList from "@Components/ScoreList";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@Components/ui/navigation-menu";
import bg from "@Assets/Hyades.jpg";
import { Button } from "@Components/ui/button";
import Title from "@Components/title";

const Score = () => {
  const recent = [10200, 7890, 5467, 1234, 763, 324, 123, 78, 54, 22];
  const highest = [10250, 9954, 9210, 8952, 8884, 8701, 8321, 7451, 7002, 6548];
  const Global = [
    10500, 10500, 10500, 10500, 10500, 10500, 10500, 10500, 10500, 10500,
  ];
  const [scores, setScores] = useState(recent);

  const clickRecent = () => {
    setScores(recent);
  };

  const clickHighest = () => {
    setScores(highest);
  };

  const clickGlobal = () => {
    setScores(Global);
  };

  return (
    <div
      className="container h-screen"
      style={{ backgroundImage: `url(${bg}`, backgroundSize: "cover" }}
    >
      <div className=" p-4 h-full place-content-center">
        <Card className="text-center">
          <Title className="font-['quasitron']">Scores</Title>
          <CardHeader className="w-full">
            <NavigationMenu className="self-center">
              <Button
                variant="dark"
                className="btn w-1/3"
                onClick={clickRecent}
              >
                Recent
              </Button>
              <Button
                variant="dark"
                className="btn w-1/3"
                onClick={clickHighest}
              >
                Highest
              </Button>
              <Button
                variant="dark"
                className="btn w-1/3"
                onClick={clickGlobal}
              >
                Global
              </Button>
            </NavigationMenu>
          </CardHeader>
          <CardContent>
            <ul className="score-list">
              <ScoreList scores={scores} />
            </ul>
          </CardContent>
          <CardFooter className="place-content-center">
            <Link to="/" className="flex flex-col">
              <Button variant="dark">Home</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Score;
