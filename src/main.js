import express from "express";
import treeRouter from "./routes/tree.js";
import itemsRouter from "./routes/items.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();
const port = 3001;

app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use("/api/tree", treeRouter);
app.use("/api/items", itemsRouter);

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
