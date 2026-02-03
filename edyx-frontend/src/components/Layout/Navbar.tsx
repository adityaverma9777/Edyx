import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    // Check auth status
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      setIsLoggedIn(!!token);
    };
    checkAuth();

    // Listen for storage changes (for multi-tab sync or login updates)
    window.addEventListener("storage", checkAuth);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const navLinks = [
    { name: "Features", href: "/#features" },
    { name: "Models", href: "/#models" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Docs", href: "/docs" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // For regular routes like /docs, don't intercept
    if (!href.includes("#")) {
      return;
    }

    // For hash links
    const targetId = href.replace(/^.*#/, "");
    const element = document.getElementById(targetId);

    if (element) {
      e.preventDefault();
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      // If target ID missing (maybe on another page), let default happen or force nav
      // Default behavior of <a href="/#features"> acts as nav if not on same page logic? 
      // But if we are on /docs and click /#features, simple <a> tag works.
      // So actually, we only need to preventDefault IF we successfully found the element to scroll to.
    }
  };

  const handleAuthAction = () => {
    if (isLoggedIn) {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/login";
    }
  };

  return (
    <>
      <motion.nav
        className={`navbar ${scrolled ? "scrolled" : ""}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="nav-content">
          {/* Logo */}
          <div className="logo-section" onClick={() => window.location.href = "/"}>
            <div className="logo-bg">
              <img src="/edyx-logo-white.png" alt="Edyx" className="logo-icon-img" />
            </div>
            <span className="logo-text">Edyx</span>
          </div>

          {/* Desktop Links */}
          <div className="desktop-links">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="nav-link"
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="nav-actions">
            <button className="cta-btn" onClick={handleAuthAction}>
              {isLoggedIn ? "Dashboard" : "Log in"}
            </button>

            {/* Mobile Toggle */}
            <button
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="mobile-link"
                onClick={(e) => {
                  handleNavClick(e, link.href);
                  setMobileMenuOpen(false);
                }}
              >
                {link.name}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .navbar {
          position: fixed;
          top: 20px;
          left: 0;
          right: 0;
          height: auto;
          z-index: 1000;
          display: flex;
          justify-content: center;
          padding: 0 20px;
          pointer-events: none; /* Let clicks pass through outside the pill */
        }

        .nav-content {
          pointer-events: auto;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 8px 8px 8px 24px;
          border-radius: 100px;
          display: flex;
          align-items: center;
          gap: 40px;
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.05),
            0 2px 4px -1px rgba(0, 0, 0, 0.03),
            0 0 0 1px rgba(0, 0, 0, 0.05); /* Thin border ring */
          width: auto; /* Hug content */
          max-width: 90%;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .navbar.scrolled .nav-content {
            background: rgba(255, 255, 255, 0.95);
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .logo-bg {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, var(--color-text-primary), #434344);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5px;
          overflow: hidden;
        }
        
        .logo-icon-img {
          width: 16px;
          height: 16px;
          object-fit: contain;
        }

        .logo-text {
          font-weight: 600;
          font-size: 1.05rem;
          color: var(--color-text-primary);
          letter-spacing: -0.02em;
        }

        .desktop-links {
          display: none;
        }
        @media (min-width: 768px) {
          .desktop-links {
            display: flex;
            align-items: center;
            gap: 24px;
          }
        }

        .nav-link {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          transition: color 0.2s;
        }
        .nav-link:hover {
          color: var(--color-text-primary);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .login-link {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--color-text-primary);
          background: none;
          padding: 0 8px;
        }

        .cta-btn {
          height: 36px;
          padding: 0 16px;
          background: var(--color-text-primary);
          color: white;
          border-radius: 18px;
          font-size: 0.85rem;
          font-weight: 600;
          transition: transform 0.2s, background 0.2s;
        }
        .cta-btn:hover {
          transform: scale(1.03);
          background: black;
        }

        .mobile-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: rgba(0,0,0,0.05);
          border-radius: 50%;
          color: var(--color-text-primary);
        }
        @media (min-width: 768px) {
          .mobile-toggle { display: none; }
        }

        .mobile-menu {
          position: fixed;
          top: 70px;
          left: 20px;
          right: 20px;
          background: white;
          border-radius: 20px;
          padding: 10px;
          box-shadow: var(--shadow-lg);
          z-index: 999;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .mobile-link {
          padding: 12px 16px;
          font-size: 1rem;
          font-weight: 500;
          border-radius: 12px;
          color: var(--color-text-primary);
        }
        .mobile-link:active {
          background: var(--surface-secondary);
        }
      `}</style>
    </>
  );
};

export default Navbar;
