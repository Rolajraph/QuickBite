import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import logo from "../../assets/logo/quickbite-logo.png";
import "./Navbar.css";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    logout();
    navigate("/login");
  };

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "")}&background=C1440E&color=fff&bold=true`;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">
        <img src={logo} alt="QuickBite" className="navbar__logo" />
      </Link>

      <button
        className="navbar__mobile-toggle"
        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        aria-label="Toggle menu"
      >
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div
        className={`navbar__links ${isMobileMenuOpen ? "navbar__links--open" : ""}`}
      >
        <Link
          to="/menu"
          className="navbar__link"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Menu
        </Link>
        <Link
          to="/cart"
          className="navbar__link navbar__cart"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          Cart
          <span className="navbar__cart-badge">{itemCount}</span>
        </Link>
        {isAuthenticated ? (
          <div className="navbar__profile" ref={dropdownRef}>
            <button
              className="navbar__profile-trigger"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              <img
                src={avatarUrl}
                alt={user?.name}
                className="navbar__avatar"
              />
            </button>
            {isDropdownOpen && (
              <div className="navbar__dropdown">
                <Link
                  to="/orders"
                  className="navbar__dropdown-item"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  My Orders
                </Link>
                <Link
                  to="/profile"
                  className="navbar__dropdown-item"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="navbar__dropdown-item navbar__dropdown-item--danger"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className="navbar__link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="navbar__link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
