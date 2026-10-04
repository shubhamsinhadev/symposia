import { useEffect, useState, type FormEvent } from "react";

export function ApiPage() {
  const [result, setResult] = useState<unknown>(null);
  const [message, setMessage] = useState("Hello, Symposia!");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/hello", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(`Request failed (${response.status})`);
        setResult(await response.json());
      })
      .catch((error: Error) => {
        if (!controller.signal.aborted) setError(error.message);
      });
    return () => controller.abort();
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/echo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");
      setResult(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <p className="eyebrow">HONO API</p>
      <h1>Request. Response.</h1>
      <p>
        The greeting loads from <code>/api/hello</code>. Send a message to{" "}
        <code>/api/echo</code>.
      </p>
      <form onSubmit={submit}>
        <label htmlFor="api-message">Message</label>
        <div className="input-row">
          <input
            id="api-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            required
          />
          <button disabled={busy || !message.trim()}>
            {busy ? "Sending…" : "Send JSON"}
          </button>
        </div>
      </form>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <pre aria-live="polite">
        {result ? JSON.stringify(result, null, 2) : "Loading…"}
      </pre>
    </section>
  );
}
