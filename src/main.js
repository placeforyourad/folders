const express = require("express");
const treeRouter = require("./routes/tree");

const app = express();
const port = 3001;

app.use(express.json());
app.use("/api/tree", treeRouter);

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
