import { useState } from "react";

const CHANNELS = [
  { id: "channel-1", label: "Channel 1" },
  { id: "channel-2", label: "Channel 2" },
];

function AlertForm({ channel, label }) {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitAlert(event) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitMessage("Sending alert...");

    try {
      const response = await fetch("/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, detail, channel }),
      });
      const data = await response.json();

      if (!response.ok) {
        setSubmitMessage(data.error || "Failed to send alert.");
        return;
      }

      setTitle("");
      setDetail("");
      setSubmitMessage("Alert sent.");
    } catch {
      setSubmitMessage("Failed to send alert.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={submitAlert}>
      <h2 className="text-base font-medium">{label}</h2>
      <label className="flex flex-col gap-1 text-sm">
        Title
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-800"
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Detail
        <textarea
          value={detail}
          onChange={(event) => setDetail(event.target.value)}
          className="min-h-32 border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-800"
          required
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="w-fit border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white hover:bg-black disabled:opacity-50"
      >
        Submit
      </button>
      {submitMessage ? <p className="text-sm">{submitMessage}</p> : null}
    </form>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-white p-6 font-sans text-neutral-900">
      <div className="grid max-w-5xl gap-10 md:grid-cols-2">
        {CHANNELS.map((channel) => (
          <AlertForm
            key={channel.id}
            channel={channel.id}
            label={channel.label}
          />
        ))}
      </div>
    </div>
  );
}
