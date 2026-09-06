import { useEffect, useState } from "react";

import { getRobots, updateRobotStatus, type Robot } from "../api/robots";
import RobotMap from "../components/RobotMap";
import AddRobotForm from "../components/AddRobotForm";
import RobotHistoryModal from "../components/RobotHistoryModal";
import "../styles/DashboardPage.css";

const DashboardPage = () => {
	const [robots, setRobots] = useState<Robot[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [isAddRobotOpen, setIsAddRobotOpen] = useState(false);
	const [historyRobot, setHistoryRobot] = useState<Robot | null>(null);

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
		const socket = new WebSocket(import.meta.env.VITE_WS_URL || "ws://localhost:5001");

		socket.onopen = () => {
			console.log("WebSocket connected");
		};

		socket.onmessage = (event) => {
			const message = JSON.parse(event.data);

			if (message.type !== "robot_positions") {
				return;
			}
			if (!Array.isArray(message.data?.robots)) {
				console.error("Invalid robot_positions message:", message);
				return;
			}
			setRobots(message.data.robots);
		};

		socket.onclose = () => {
			console.log("WebSocket disconnected");
		};

		return () => {
			socket.close();
		};
	}, []);

	const handleRobotStatusChange = async (robot: Robot) => {
		const newStatus = robot.status === "moving" ? "idle" : "moving";

		try {
			const response = await updateRobotStatus(robot.id, newStatus);

			const updatedRobot = response.data.robot;

			setRobots((currentRobots) =>
				currentRobots.map((currentRobot) => (currentRobot.id === updatedRobot.id ? updatedRobot : currentRobot)),
			);
		} catch (error) {
			console.error("Failed to update robot status:", error);
		}
	};

	const handleRobotCreated = (robot: Robot) => {
		setRobots((currentRobots) => [...currentRobots, robot]);
		setIsAddRobotOpen(false);
	};

	if (isLoading) {
		return <p>Loading robots...</p>;
	}

	if (error) {
		return <p>{error}</p>;
	}

	return (
		<main className="dashboard-page">
			<div className="dashboard-container">
				<header className="dashboard-header">
					<div>
						<h1>Fleet Dashboard</h1>
						<p>Monitor your robots in real time</p>
					</div>
				</header>

				<div className="dashboard-content">
					<section className="map-section">
						<RobotMap robots={robots} />
					</section>

					<aside className="robots-panel">
						<div className="section-header">
							<div>
								<h2>Robots</h2>
								<span className="robots-count">{robots.length} total</span>
							</div>

							<button type="button" className="primary-button" onClick={() => setIsAddRobotOpen(true)}>
								Add Robot
							</button>
						</div>

						<div className="robots-list">
							{robots.map((robot) => (
								<article key={robot.id} className="robot-card">
									<div className="robot-card-header">
										<h3>{robot.name}</h3>

										<span className={`status-badge status-${robot.status}`}>{robot.status}</span>
									</div>

									<div className="robot-card-body">
										<p>
											<span>Latitude</span>
											{robot.lat}
										</p>

										<p>
											<span>Longitude</span>
											{robot.lon}
										</p>
									</div>

									<button type="button" className="secondary-button" onClick={() => setHistoryRobot(robot)}>
										History
									</button>
									<button type="button" onClick={() => handleRobotStatusChange(robot)}>
										{robot.status === "moving" ? "Stop" : "Start"}
									</button>
								</article>
							))}
						</div>
					</aside>
				</div>
			</div>

			{historyRobot && <RobotHistoryModal robot={historyRobot} onClose={() => setHistoryRobot(null)} />}

			{isAddRobotOpen && (
				<div className="modal-backdrop" onClick={() => setIsAddRobotOpen(false)}>
					<div className="modal" onClick={(event) => event.stopPropagation()}>
						<button type="button" className="modal-close" onClick={() => setIsAddRobotOpen(false)}>
							×
						</button>

						<AddRobotForm onCreated={handleRobotCreated} />
					</div>
				</div>
			)}
		</main>
	);
};

export default DashboardPage;
