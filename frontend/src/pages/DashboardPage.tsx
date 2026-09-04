import { useEffect, useState } from "react";

import { getRobots, type Robot } from "../api/robots";
import RobotMap from "../components/RobotMap";
import AddRobotForm from "../components/AddRobotForm";
import "../styles/DashboardPage.css";

const DashboardPage = () => {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddRobotOpen, setIsAddRobotOpen] = useState(false);

  useEffect(() => {
    const loadRobots = async () => {
      try {
        const response = await getRobots();

        setRobots(response.data.robots);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadRobots();
  }, []);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:5001");

    socket.onopen = () => {
        console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type !== "robot_position") {
            return;
        }

        setRobots(message.data.robot);
    };

    socket.onclose = () => {
        console.log("WebSocket disconnected");
    };

    return () => {
        socket.close();
    };
  }, []);

   const handleRobotCreated = (robot: Robot) => {
    setRobots((currentRobots) => [
      ...currentRobots,
      robot,
    ]);
    setIsAddRobotOpen(false);
  };

  if (isLoading) {
    return <p>Loading robots...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main>
      <h1>Fleet Dashboard</h1>
      <RobotMap robots={robots} />

      <section>
        <div className="robots-header">
            <h2>Robots</h2>
            <button type="button" onClick={() => setIsAddRobotOpen(true)}>
                Add Robot
            </button>
        </div>

        {robots.map((robot) => (
            <article key={robot.id}>
                <strong>{robot.name}</strong>
                <p>Status: {robot.status}</p>
                <p>{robot.lat}, {robot.lon}</p>
            </article>
        ))}
      </section>

      {isAddRobotOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddRobotOpen(false)}>
            <div className="modal" onClick={(event) => event.stopPropagation()}>
                <button
                    type="button"
                    className="modal-close"
                    onClick={() => setIsAddRobotOpen(false)}
                    aria-label="Close"
                >
                    ×
                </button>

                <AddRobotForm onCreated={handleRobotCreated}/>
            </div>
        </div>
      )}
    </main>
  );
};

export default DashboardPage;