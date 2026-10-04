import { defineHandler } from "nitro";
import { api } from "../utils/api.ts";

export default defineHandler((event) => api.fetch(event.req));
