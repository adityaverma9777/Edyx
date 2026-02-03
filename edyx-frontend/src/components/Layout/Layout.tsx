import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />

      <main className="main-content">{children}</main>

      <Footer />

      <style>{`
        .layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: var(--surface-primary);
        }

        .main-content {
          flex: 1;
          padding-top: 80px; /* Offset for fixed navbar */
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
};

export default Layout;
