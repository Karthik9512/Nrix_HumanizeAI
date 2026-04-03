import cors from "cors";
import express from "express";
import historyRoutes from "./routes/historyRoutes.js";
import humanizeRoutes from "./routes/humanizeRoutes.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorMiddleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "HumanizeAI API is running"
  });
});

app.use("/api", humanizeRoutes);
app.use("/api", historyRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
