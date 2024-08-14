import React, { Component } from "react";

import {
  NavigationMenu,
  NavigationMenuLink,
} from "@Components/ui/navigation-menu";
import GI from "@Assets/img/GalaxyIcon.png";
import Resources from "./Resources";
import Clock from "./Clock";

export default class GameNav extends Component {
  render() {
    return (
      <NavigationMenu className="w-full max-w-full h-20">
        <div className="flex flex-row w-full">
          <NavigationMenuLink
            href="/"
            className="flex flex-col place-content-center items-center p-2"
          >
            <img
              alt=""
              src={GI}
              width="40"
              height="40"
              className="d-inline-block align-center"
            />
            <h3 className="">SpaceGame</h3>
          </NavigationMenuLink>
          <NavigationMenuLink className="mx-auto">
            <Resources />
          </NavigationMenuLink>
          <Clock />
        </div>
      </NavigationMenu>
    );
  }
}
