import { useNavigate } from "react-router-dom";
import './Homepage.css';

function Homepage() {
  const navigate = useNavigate();
  return (
    <div className="homepage-container">
      <h1>StudyQuest</h1>
    </div>
  );
}

export default Homepage;