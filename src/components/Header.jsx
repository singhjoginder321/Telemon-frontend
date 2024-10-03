import React from "react";
import "../styles/Header.css";

function Header() {
  const handleSignOut = () => {
    // Logic for sign out can be added here
    console.log("Sign Out Clicked");
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1>Telamon</h1>
      </div>
      <div className="header-right">
        <button className="signout-button" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </header>
  );
}

export default Header;
