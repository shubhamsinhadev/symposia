import { useEffect, useRef, useState, type FormEvent } from "react";
type Message = { type: string; message: string; user?: string; timestamp?: string };

export function ChatPage() {
  const socket = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState("Connecting");
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const url = new URL("/ws", window.location.href);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(url);
    socket.current = ws; setStatus("Connecting");
    ws.onopen = () => setStatus("Connected");
    ws.onclose = () => setStatus("Disconnected");
    ws.onerror = () => setStatus("Connection error");
    ws.onmessage = (event) => {
      try {
        const message: Message = JSON.parse(event.data);
        setMessages((previous) => [...previous.slice(-99), message]);
      } catch { setStatus("Invalid server message"); }
    };
    return () => {
      ws.onopen = ws.onclose = ws.onerror = ws.onmessage = null;
      ws.close(); socket.current = null;
    };
  }, [attempt]);
  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (socket.current?.readyState !== WebSocket.OPEN || !text.trim()) return;
    socket.current.send(text.trim()); setText("");
  }
  return <section><p className="eyebrow">LIVE WEBSOCKET</p><h1>The conversation starts here.</h1>
    <p>Open this page in two tabs. Messages appear in both, instantly.</p>
    <div className="connection"><span role="status">{status}</span>
      {(status === "Disconnected" || status === "Connection error") && <button onClick={() => setAttempt((n) => n + 1)}>Reconnect</button>}</div>
    <div className="messages" role="log" aria-label="Chat messages" aria-live="polite">
      {messages.length === 0 && <p className="muted">Waiting for the server…</p>}
      {messages.map((message, index) => <article key={index}>
        <small>{message.user ? `Guest ${message.user.slice(0, 8)}` : "Server"}{message.timestamp && ` · ${new Date(message.timestamp).toLocaleTimeString()}`}</small>
        <p>{message.message}</p></article>)}
    </div>
    <form onSubmit={send}><label htmlFor="chat-message">Your message</label><div className="input-row">
      <input id="chat-message" value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Say hello…" required />
      <button disabled={status !== "Connected" || !text.trim()}>Send</button></div></form>
  </section>;
}
