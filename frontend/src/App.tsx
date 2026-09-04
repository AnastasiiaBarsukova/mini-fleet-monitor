import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  if (!token) {
    console.log("here");
    return <LoginPage onLogin={setToken} />;
  }
console.log("here2");
  return <DashboardPage />;
}

export default App;
