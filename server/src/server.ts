import Fastify from "fastify";
import cors from "@fastify/cors";
import { appRoutes } from "./routes";

const app = Fastify();

const allowedOrigins = ["http://filipe-bacof-nlw-setup-front-end.vercel.app/"];

app.register(cors, {
  origin: allowedOrigins,
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Accept",
    "Content-Type",
    "Authorization",
  ],
  methods: ["GET", "PUT", "OPTIONS", "POST", "DELETE"],
});

app.register(appRoutes);

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("🔥 Server running on port 3333");
  });
