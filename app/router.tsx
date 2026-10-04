import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { ApiPage } from "./pages/api.tsx";
import { ChatPage } from "./pages/chat.tsx";

const rootRoute = createRootRoute({
  component: () => (
    <main>
      <header>
        <Link to="/" className="brand">
          Symposia
        </Link>
        <nav aria-label="Main navigation">
          <Link to="/" activeOptions={{ exact: true }}>
            Home
          </Link>
          <Link to="/api-demo">API</Link>
          <Link to="/chat">Chat</Link>
        </nav>
      </header>
      <Outlet />
    </main>
  ),
  notFoundComponent: () => (
    <section>
      <h1>Page not found</h1>
      <Link to="/">Back home</Link>
    </section>
  ),
});
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <section>
      <p className="eyebrow">FULL STACK STARTER</p>
      <h1>A place to build together.</h1>
      <p>
        React and TanStack Router on the frontend. Hono APIs and Nitro
        WebSockets on the server.
      </p>
      <div className="cards">
        <Link to="/api-demo" className="card">
          <h2>Try the API</h2>
          <p>Load a greeting and send a JSON message.</p>
        </Link>
        <Link to="/chat" className="card">
          <h2>Start a conversation</h2>
          <p>Send live messages between browser tabs.</p>
        </Link>
      </div>
    </section>
  ),
});
const apiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/api-demo",
  component: ApiPage,
});
const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  component: ChatPage,
});
export const router = createRouter({
  routeTree: rootRoute.addChildren([homeRoute, apiRoute, chatRoute]),
});
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
