import React from "react";

import { Card, CardContent, CardTitle } from "@Components/ui/card";
import bg from "@Assets/Hyades.jpg";
import Footer from "@Components/footer";
import { Button } from "@Components/ui/button";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div
      className="container h-screen"
      style={{ backgroundImage: `url(${bg}`, backgroundSize: "cover" }}
    >
      <div className="flex items-center place-content-center h-full">
        <Card className="h-1/2 w-1/2 flex flex-col">
          <CardTitle className="text-center font-['quasitron']">
            Hyades Control
          </CardTitle>
          <CardContent className="flex flex-col place-content-center p-0 px-6 my-auto">
            <Link to="/game" className="flex flex-col">
              <Button variant="dark">New Game</Button>{" "}
            </Link>

            <Link to="/scores" className="flex flex-col">
              <Button variant="dark">Scores</Button>
            </Link>
            <Button
              variant="dark"
              onClick={() => window.contextAPI.ipcRenderer.closeApp()}
            >
              Exit
            </Button>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
