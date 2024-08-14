import React from "react";
import { NavigationMenuLink } from "@Components/ui/navigation-menu";

const Resource = ({
  name,
  hc,
  data,
  img,
}: {
  name: string;
  hc: (event: any) => void;
  data: number[];
  img: string;
}) => {
  return (
    <NavigationMenuLink href="#" onClick={hc}>
      <div className="icondata flex flex-row p-2">
        <img src={img} alt="" width="40" height="40" />
        <div className="data px-2">
          {name}
          <br />
          {data[0]}/{data[1]}
        </div>
      </div>
    </NavigationMenuLink>
  );
};

export default Resource;
