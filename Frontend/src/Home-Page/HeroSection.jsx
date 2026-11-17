import "./HeroSection.css";
import RecentStudysets from "./RecentStudysets";

function HeroSection() {   
    return (
        <div className="hero-section">
            <div className="hero-box">
                <h3>Recent Study Sets</h3>
                <RecentStudysets />
            </div>
            <div className = "hero-box2">
                <h3>Your Progress</h3>
                <p className = "hero-text">Log-in to view your progress</p>
            </div>
        </div>

    );
    }

    export default HeroSection;