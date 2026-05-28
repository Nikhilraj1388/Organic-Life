import { Search, ShoppingCart, Menu, User, LogOut, X, Leaf } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Header() {
  const { getTotalItems, toggleCart } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log("Searching for:", searchQuery);
      // navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header className="w-full bg-white border-b border-organic-brown/20 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2 font-acme text-2xl text-organic-brown hover:text-organic-black transition-colors"
            >
              <Leaf className="w-8 h-8 text-organic-brown" />
              <span className="hidden sm:block">Organic Life</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {user?.role !== 'farmer' && (
              <Link
                to="/marketplace"
                className="text-organic-brown hover:text-organic-black font-medium transition-colors relative group"
              >
                Marketplace
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-organic-brown group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
            {isAuthenticated && user?.role === 'farmer' && (
              <Link
                to="/farmer-dashboard"
                className="text-organic-brown hover:text-organic-black font-medium transition-colors relative group"
              >
                My Dashboard
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-organic-brown group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
            {user?.role !== 'farmer' && (
              <>
                <Link
                  to="/about"
                  className="text-organic-brown hover:text-organic-black font-medium transition-colors relative group"
                >
                  About
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-organic-brown group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                  to="/contact"
                  className="text-organic-brown hover:text-organic-black font-medium transition-colors relative group"
                >
                  Contact
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-organic-brown group-hover:w-full transition-all duration-300"></span>
                </Link>
              </>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-4 pr-10 py-2 border border-organic-brown/30 rounded-lg focus:ring-2 focus:ring-organic-brown/50 focus:border-organic-brown"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-organic-brown hover:text-organic-black"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Auth Section */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center text-organic-brown hover:text-organic-black hover:bg-organic-cream"
                  >
                    <User className="w-6 h-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate(user?.role === 'farmer' ? '/farmer-dashboard' : '/dashboard')}>
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => navigate("/login")}
                className="bg-organic-brown hover:bg-organic-black text-white px-4 py-2 rounded-lg font-medium"
              >
                Login
              </Button>
            )}

            {/* Shopping Cart - Hide for farmers */}
            {user?.role !== 'farmer' && (
              <button
                onClick={() => toggleCart()}
                className="relative p-2 text-organic-brown hover:text-organic-black hover:bg-organic-cream rounded-lg transition-colors"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-6 h-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-organic-brown text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-organic-brown hover:text-organic-black hover:bg-organic-cream rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden border-t border-organic-brown/20 py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 border border-organic-brown/30 rounded-lg"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-organic-brown"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col space-y-2">
              {user?.role !== 'farmer' && (
                <Link
                  to="/marketplace"
                  className="px-4 py-2 text-organic-brown hover:text-organic-black hover:bg-organic-cream rounded-lg font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Marketplace
                </Link>
              )}
              {isAuthenticated && user?.role === 'farmer' && (
                <Link
                  to="/farmer-dashboard"
                  className="px-4 py-2 text-organic-brown hover:text-organic-black hover:bg-organic-cream rounded-lg font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  My Dashboard
                </Link>
              )}
              {user?.role !== 'farmer' && (
                <>
                  <Link
                    to="/about"
                    className="px-4 py-2 text-organic-brown hover:text-organic-black hover:bg-organic-cream rounded-lg font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    to="/contact"
                    className="px-4 py-2 text-organic-brown hover:text-organic-black hover:bg-organic-cream rounded-lg font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    Contact
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
