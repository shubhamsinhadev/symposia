import { Hono } from "hono";

export const api = new Hono().basePath("/api");
api.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() }),
);
api.get("/hello", (c) => c.json({ message: "Hello from Hono!" }));
api.post("/echo", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Expected a JSON body" }, 400);
  }
  if (
    !body ||
    typeof body !== "object" ||
    !("message" in body) ||
    typeof body.message !== "string" ||
    !body.message.trim() ||
    body.message.length > 1000
  ) {
    return c.json(
      { error: "message must be a nonempty string of up to 1000 characters" },
      400,
    );
  }
  return c.json({
    message: body.message.trim(),
    timestamp: new Date().toISOString(),
  });
});
api.notFound((c) => c.json({ error: "API endpoint not found" }, 404));
