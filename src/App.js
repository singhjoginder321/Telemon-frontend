import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import LabelComponent from "./components/LabelComponent";
import NavBar from "./components/NavBar";
import Upload from "./components/Upload";

function App() {
  return (
    <Router>
      <Header />
      <NavBar />

      <Routes>
        <Route path="/label" element={<LabelComponent />} />
        <Route path="/" element={<Upload />} />
      </Routes>
    </Router>
  );
}

export default App;
