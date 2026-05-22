import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <nav className="bg-white shadow-md border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="text-xl font-bold text-blue-600">
          <Link to="/">MyCarbonReport</Link>
        </div>

        {/* Links */}
        <div className="flex space-x-6 text-gray-600 font-medium">
          <Link to="/" className="hover:text-blue-500 transition-colors">
            Home
          </Link>
          <Link to="/list" className="hover:text-blue-500 transition-colors">
            List
          </Link>
          <Link to="/reports" className="hover:text-blue-500 transition-colors">
            Reports
          </Link>
        </div>

        {/* Button */}
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Kontakt
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
