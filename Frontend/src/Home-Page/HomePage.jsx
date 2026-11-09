import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "./HeroSection";
import { getPlayerRewards } from "../services/rewards.js";
import './Homepage.css';

function Homepage() {
  const navigate = useNavigate();

  const [rewards, setRewards] = useState(null);
  const [rewardsError, setRewardsError] = useState("");

  useEffect(() => {
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
  }, []);

  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <h1>Study Quest</h1>
        <h2>
          Welcome to Study Quest, Turn Boring Studying Into An Adventure!
        </h2>

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

        <div className="button-container">
          <button
            className="signUp-button"
            onClick={() => navigate("/login")}
          >
            Create Account
          </button>

          <button
            className="createSet-button"
            onClick={() => navigate("/create")}
          >
            Begin a Study Set
          </button>
        </div>
      </header>

      <HeroSection />
    </div>
  );
}

export default Homepage;
