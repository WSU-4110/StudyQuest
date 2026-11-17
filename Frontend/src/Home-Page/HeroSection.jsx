import { useEffect, useState } from "react";
import { useAuth } from "../Auth-Page/AuthContext.jsx";
import { getPlayerRewards } from "../services/rewards.js";
// import { getQuizResults } from "../services/results.js";   
import { supabase } from "../lib/supabaseClient.js";    
import "./HeroSection.css";
import RecentStudysets from "./RecentStudysets";


function progressStats(attempts) {
    const scored = attempts.filter((a) => a.total > 0);

    const average = scored.length
        ? Math.round(
              (scored.reduce((sum, a) => sum + a.correct / a.total, 0) / scored.length) * 100
          )
        : null;

    return [
        { label: "Average score", value: average !== null ? `${average}%` : "–" },
        { label: "Quizzes taken", value: attempts.length },
    ];
}

function HeroSection() {   
    const {session} = useAuth();
    const [stats, setStats] = useState([]);

    useEffect(() => {
        if (!session) {
            setStats([]);
            return;
        }

        let active = true;

         async function load() {
            const { data, error } = await supabase
                .from("game_attempts")
                .select("correct, total")
                .limit(1000);

            if (error) {
                console.error("Progress failed to load:", error);
                if (active) setStats([]);
                return;
            }

            if (active) setStats(progressStats(data ?? []));
        }

        load();
        return () => {
            active = false;
        };
    }, [session]);

    return (
        <div className="hero-section">
            <div className="hero-box">
                <h3>Recent Study Sets</h3>
                <RecentStudysets />
            </div>
            <div className = "hero-box2">
                <h3>Your Progress</h3>
                {session ? (
                    <div className="hero-stats">
                        {stats.map((s) => (
                            <div key={s.label} className="hero-stat">
                                <span className="hero-stat-value">{s.value}</span>
                                <span className="hero-stat-label">{s.label}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="hero-text">Log-in to view your progress</p>
                )}
            </div>
        </div>
    );
}

export default HeroSection;