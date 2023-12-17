import Fastify from "fastify";
import cors from "@fastify/cors";
import { appRoutes } from "./routes";

process.env.TZ = "UTC";

const app = Fastify();

app.register(cors, {
  origin: true,
  methods: ["GET", "PATCH", "POST"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Accept",
    "Content-Type",
    "Authorization",
  ],
});

app.register(appRoutes);

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("🔥 Server running on port 3333");
    console.log("Agora é: " + new Date());
  });
