import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./views/Home";
import Score from "./views/Score";
import Game from "./views/Game";

function App() {
  return (
    <div>
      <div className="">
        <Routes>
          <Route index element={<Home />} />
          <Route path="/scores" element={<Score />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
