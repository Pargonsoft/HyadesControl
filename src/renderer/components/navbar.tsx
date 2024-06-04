import { Link } from "react-router-dom";
import { ModeToggle } from "@Components/mode-toggle";

export default function Navbar() {
  return (
    <div className="w-full flex justify-between items-center border-b px-4 py-2 bg-background/80 backdrop-blur">
      <div className="flex gap-4 text-sm">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>
        <Link to="/about" className="[&.active]:font-bold">
          About
        </Link>
        <Link to="/test" className="[&.active]:font-bold">
          Test
        </Link>
      </div>
      <ModeToggle />
    </div>
  );
}
