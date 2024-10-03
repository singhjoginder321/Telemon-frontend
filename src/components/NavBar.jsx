import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/NavBar.css";

function NavBar() {
  const navigate = useNavigate();
  const handleAnnotateClick = () => {
    navigate("/label");
  };

  const handleUploadClick = () => {
    navigate("/");
  };
  return (
    <nav className="nav-bar">
      <button className="nav-button" onClick={handleUploadClick}>
        Upload
      </button>
      <button className="nav-button" onClick={handleAnnotateClick}>
        Annotate
      </button>
      <button className="nav-button">Bill</button>
    </nav>
  );
}

export default NavBar;
