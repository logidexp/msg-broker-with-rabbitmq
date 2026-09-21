import { useEffect, useState } from "react";

function websocketUrl() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws`;
}

export default function App() {
  const [message, setMessage] = useState("Server status is unknown.");
  const [alerts, setAlerts] = useState([]);

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

  useEffect(() => {
    let socket;
    let closed = false;
    let reconnectTimer;

    async function loadAlerts() {
      try {
        const response = await fetch("/alerts");
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (!closed) {
          setAlerts(Array.isArray(data) ? data : []);
        }
      } catch {
        // Keep the current list if the snapshot request fails.
      }
    }

    function rememberAlert(alert) {
      if (!alert?.id) {
        return;
      }

      setAlerts((current) => {
        if (current.some((item) => item.id === alert.id)) {
          return current;
        }

        return [alert, ...current];
      });
    }

    function connect() {
      socket = new WebSocket(websocketUrl());
      socket.onmessage = (event) => {
        try {
          rememberAlert(JSON.parse(event.data));
        } catch {
          // Ignore malformed live messages.
        }
      };
      socket.onclose = () => {
        if (!closed) {
          reconnectTimer = setTimeout(connect, 2000);
        }
      };
    }

    loadAlerts();
    connect();

    return () => {
      closed = true;
      clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white p-6 font-sans text-neutral-900">
      <div className="flex max-w-xl flex-col gap-10">
        <section className="flex flex-col gap-4">
          <h1 className="text-lg font-medium">Alerts</h1>
          {alerts.length === 0 ? (
            <p className="text-sm text-neutral-500">No alerts yet.</p>
          ) : (
            alerts.map((alert) => (
              <article
                key={alert.id}
                className="flex flex-col gap-1 border border-neutral-200 p-4"
              >
                <p className="text-xs text-neutral-500">
                  {alert.channel === "channel-2" ? "Channel 2" : "Channel 1"}
                </p>
                <h2 className="text-base font-medium">{alert.title}</h2>
                <p className="text-sm whitespace-pre-wrap">{alert.detail}</p>
                {alert.sentAt ? (
                  <p className="text-xs text-neutral-500">
                    {new Date(alert.sentAt).toLocaleString()}
                  </p>
                ) : null}
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
