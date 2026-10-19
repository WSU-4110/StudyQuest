import { useNavigate } from "react-router-dom";
import HeroSection from "./HeroSection";
import './Homepage.css';

function Homepage() {
  const navigate = useNavigate();
  return (
    <div className="homepage-container">
      <header className = "homepage-header">
        <h1>Study Quest</h1>
        <h2> Welcome to Study Quest, Turn Boring Studying Into An Adventure!</h2>
        <div className="button-container">
          <button className="signUp-button" onClick={() => navigate("/login")}>Create Account</button>
          <button className="createSet-button" onClick={() => navigate("/create")}>Begin a Study Set</button>
        </div>
        
      </header>
      <HeroSection />
    </div>
  );
}

export default Homepage;