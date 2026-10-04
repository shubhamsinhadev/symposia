import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";
import { before, after, test } from "node:test";

let server;
let base;
let output = "";
before(async () => {
  const probe = createServer();
  probe.listen(0, "127.0.0.1");
  await once(probe, "listening");
  const port = probe.address().port;
  await new Promise((resolve) => probe.close(resolve));
  base = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, [".output/server/index.mjs"], {
    env: { ...process.env, PORT: String(port), HOST: "127.0.0.1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", (data) => { output += data; });
  server.stderr.on("data", (data) => { output += data; });
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(`${base}/api/health`)).ok) return; } catch {}
    if (server.exitCode !== null) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Server did not start: ${output}`);
});
after(async () => {
  if (server && server.exitCode === null) {
    const exited = once(server, "exit");
    server.kill();
    await exited;
  }
});

test("Hono serves JSON and validates echo requests", async () => {
  assert.equal((await (await fetch(`${base}/api/health`)).json()).status, "ok");
  assert.deepEqual(await (await fetch(`${base}/api/hello`)).json(), { message: "Hello from Hono!" });
  const post = (body) => fetch(`${base}/api/echo`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body,
  });
  const valid = await post(JSON.stringify({ message: " hello " }));
  assert.equal(valid.status, 200);
  assert.equal((await valid.json()).message, "hello");
  for (const body of ["{", "null", '{"message":42}', '{"message":" "}', JSON.stringify({ message: "x".repeat(1001) })]) {
    assert.equal((await post(body)).status, 400);
  }
  const missing = await fetch(`${base}/api/missing`);
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { error: "API endpoint not found" });
});

test("SPA routes load directly and built assets are served", async () => {
  for (const path of ["/", "/api-demo", "/chat"]) {
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /id="app"/);
    const script = html.match(/src="([^"]+\.js)"/)[1];
    assert.equal((await fetch(`${base}${script}`)).status, 200);
  }
});

test("WebSocket welcomes clients, echoes, broadcasts, and rejects invalid messages", { timeout: 10000 }, async () => {
  const clients = [new WebSocket(base.replace("http:", "ws:") + "/ws"), new WebSocket(base.replace("http:", "ws:") + "/ws")];
  const received = clients.map(() => []);
  clients.forEach((ws, i) => ws.addEventListener("message", (event) => received[i].push(JSON.parse(event.data))));
  async function waitFor(predicate) {
    for (let i = 0; i < 100; i++) {
      if (predicate()) return;
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    assert.fail("Timed out waiting for WebSocket message");
  }
  try {
    await waitFor(() => received.every((messages) => messages.some((m) => m.type === "system")));
    clients[0].send("hello from smoke test");
    await waitFor(() => received.every((messages) => messages.some((m) => m.message === "hello from smoke test")));
    const echoed = received[0].find((m) => m.type === "message");
    const broadcast = received[1].find((m) => m.type === "message");
    assert.deepEqual(echoed, broadcast);
    clients[0].send(" ");
    clients[0].send("x".repeat(1001));
    await waitFor(() => received[0].filter((m) => m.type === "error").length === 2);
    assert.equal(received[1].filter((m) => m.type === "message").length, 1);
  } finally { clients.forEach((ws) => ws.close()); }
});
