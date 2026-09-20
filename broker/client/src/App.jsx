import { useState } from "react";

export default function App() {
  const [message, setMessage] = useState("Server status is unknown.");

  async function checkServer() {
    setMessage("Checking server...");

    try {
      const response = await fetch("/health");
      const data = await response.json();

      if (response.ok && data.status === "ok") {
        setMessage("Server is alive.");
        return;
      }

      setMessage("Server is not alive.");
    } catch {
      setMessage("Server is not alive.");
    }
  }

  return (
    <div className="app">
      <button type="button" onClick={checkServer}>
        Check server
      </button>
      <p>{message}</p>
    </div>
  );
}
