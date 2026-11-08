import { useNavigate } from "react-router-dom";
import HeroSection from "./HeroSection";
import './Homepage.css';
import NavButton from "./NavButton";

function Homepage() {
  const navigate = useNavigate();
  return (
    <div className="homepage-container">
      <header className = "homepage-header">
        <h1>Study Quest</h1>
        <h2> Welcome to Study Quest, Turn Boring Studying Into An Adventure!</h2>
        <div className="button-container">
          <NavButtonFactory type="signUp" navigate={navigate} />
          <NavButtonFactory type="createSet" navigate={navigate} />
        </div>
        
      </header>
      <HeroSection />
    </div>
  );
}

export default Homepage;