import express from "express";
import router from "./routes/routes.js";
import errorHandler from "./middlewares/errorHandler.js";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/tree", router);
app.use(errorHandler);

export default app;
