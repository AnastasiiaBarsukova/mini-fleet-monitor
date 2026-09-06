import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
	const [token, setToken] = useState(localStorage.getItem("token"));

	if (!token) {
		return <LoginPage onLogin={setToken} />;
	}
	return <DashboardPage />;
}

export default App;
