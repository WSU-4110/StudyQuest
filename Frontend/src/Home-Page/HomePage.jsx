import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "./HeroSection";
import { getPlayerRewards } from "../services/rewards.js";
import './Homepage.css';
import NavButton from "./NavButton";
import { useAuth } from "../Auth-Page/AuthContext.jsx";

function Homepage() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();

  const [rewards, setRewards] = useState(null);
  const [rewardsError, setRewardsError] = useState("");

  useEffect(() => {
    if(!session) {
      setRewards(null);
      setRewardsError("");
      return;
    }

    let active = true;

    async function loadRewards() {
      try {
        const data = await getPlayerRewards();

        if (active) {
          setRewards(data);
        }
      } catch (error) {
        if (active) {
          setRewardsError(error.message);
        }
      }
    }

    loadRewards();

    return () => {
      active = false;
    };
  }, [session]);

  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <h1>Study Quest</h1>
        <h2>
          Welcome to Study Quest, Turn Boring Studying Into An Adventure!
        </h2>

        

        <div className="button-container">
          {!authLoading && !session ? (
          <button className="signUp-button" onClick={() => navigate("/login")}>Create Account</button>
          ): null}
          <button className="createSet-button" onClick={() => navigate("/create")}>Begin a Study Set</button>
        </div>

        {rewards && (
          <div className="player-rewards">
            <p>Level: {rewards.level}</p>
            <p>Total XP: {rewards.xp}</p>
            <p>Coins: {rewards.currency}</p>
          </div>
        )}

        {rewardsError && (
          <p role="alert">Unable to load rewards: {rewardsError}</p>
        )}


      </header>


      <HeroSection />
    </div>
  );
}

export default Homepage;
