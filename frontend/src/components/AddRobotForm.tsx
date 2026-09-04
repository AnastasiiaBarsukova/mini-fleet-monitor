import { useState, type FormEventHandler } from "react";

import {
  createRobot,
  type Robot,
} from "../api/robots";

type AddRobotFormProps = {
  onCreated: (robot: Robot) => void;
};

const AddRobotForm = ({
  onCreated,
}: AddRobotFormProps) => {
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit: FormEventHandler<HTMLFormElement> =
    async (event) => {
      event.preventDefault();

      setError("");

      const parsedLat = Number(lat);
      const parsedLon = Number(lon);

      if (!name.trim()) {
        setError("Robot name is required");
        return;
      }

      if (
        !Number.isFinite(parsedLat) ||
        !Number.isFinite(parsedLon)
      ) {
        setError("Valid coordinates are required");
        return;
      }

      try {
        setIsLoading(true);

        const response = await createRobot({
          name: name.trim(),
          lat: parsedLat,
          lon: parsedLon,
        });

        onCreated(response.data.robot);

        setName("");
        setLat("");
        setLon("");
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Robot</h2>

      <div>
        <label htmlFor="robot-name">
          Name
        </label>

        <input
          id="robot-name"
          type="text"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          placeholder="Robot 04"
          required
        />
      </div>

      <div>
        <label htmlFor="robot-lat">
          Latitude
        </label>

        <input
          id="robot-lat"
          type="number"
          step="any"
          min="-90"
          max="90"
          value={lat}
          onChange={(event) =>
            setLat(event.target.value)
          }
          placeholder="52.5200"
          required
        />
      </div>

      <div>
        <label htmlFor="robot-lon">
          Longitude
        </label>

        <input
          id="robot-lon"
          type="number"
          step="any"
          min="-180"
          max="180"
          value={lon}
          onChange={(event) =>
            setLon(event.target.value)
          }
          placeholder="13.4050"
          required
        />
      </div>

      {error && <p>{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Adding..." : "Add Robot"}
      </button>
    </form>
  );
};

export default AddRobotForm;