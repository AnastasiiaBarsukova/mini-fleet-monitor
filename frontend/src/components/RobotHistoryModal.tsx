import { useState } from "react";

import { getRobotPositions, type Robot, type RobotPosition } from "../api/robots";

type RobotHistoryModalProps = {
	robot: Robot;
	onClose: () => void;
};

const RobotHistoryModal = ({ robot, onClose }: RobotHistoryModalProps) => {
	const [date, setDate] = useState("");
	const [positions, setPositions] = useState<RobotPosition[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [hasLoadedHistory, setHasLoadedHistory] = useState(false);

	const loadHistory = async () => {
		if (!date) {
			setError("Select a date");
			return;
		}

		try {
			setIsLoading(true);
			setError("");
			setHasLoadedHistory(false);

			const response = await getRobotPositions(robot.id, date);

			setPositions(response.data.positions);
			setHasLoadedHistory(true);
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const displayedPositions = positions.slice(-100).reverse();

	return (
		<div className="modal-backdrop" onClick={onClose}>
			<div className="modal robot-history-modal" onClick={(event) => event.stopPropagation()}>
				<button type="button" className="modal-close" onClick={onClose} aria-label="Close">
					×
				</button>

				<h2>{robot.name} history</h2>

				<div className="history-controls">
					<label>
						Date
						<input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
					</label>

					<button type="button" onClick={loadHistory} disabled={isLoading}>
						{isLoading ? "Loading..." : "Show history"}
					</button>
				</div>

				{error && <p>{error}</p>}

				{!isLoading && positions.length > 0 && (
					<>
						<p>Positions recorded: {positions.length}</p>

						<table className="history-table">
							<thead>
								<tr>
									<th>Time</th>
									<th>Latitude</th>
									<th>Longitude</th>
								</tr>
							</thead>

							<tbody>
								{displayedPositions.map((position) => (
									<tr key={position.id}>
										<td>{new Date(position.createdAt).toLocaleTimeString()}</td>

										<td>{position.lat}</td>
										<td>{position.lon}</td>
									</tr>
								))}
							</tbody>
						</table>

						{positions.length > 100 && <p>Showing latest 100 of {positions.length} positions.</p>}
					</>
				)}

				{hasLoadedHistory && !isLoading && date && positions.length === 0 && !error && (
					<p>No positions recorded for this date.</p>
				)}
			</div>
		</div>
	);
};

export default RobotHistoryModal;
