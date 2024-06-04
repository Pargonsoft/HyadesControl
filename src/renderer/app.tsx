import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "@Components/navbar";
import Footer from "@Components/footer";
import Home from "./views/home";
import About from "./views/about";

function App() {
  return (
    <div>
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route index element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
