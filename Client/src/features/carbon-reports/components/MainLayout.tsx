import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

const MainLayout = () => {
  return (
    // min-h-screen füllt die gesamte Bildschirmhöhe
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar />

      {/* flex-grow lässt den Main-Bereich den restlichen Platz einnehmen */}
      <main className="grow container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t py-4 text-center text-gray-500">
        © 2026 Mein Carbon Report. Alle Rechte vorbehalten.
      </footer>
    </div>
  );
};

export default MainLayout;
